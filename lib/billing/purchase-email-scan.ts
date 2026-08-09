import { createHash } from "node:crypto";
import { ImapFlow } from "imapflow";
import { simpleParser, type Attachment, type ParsedMail } from "mailparser";
import { put } from "@vercel/blob";
import {
  createPurchaseInvoiceFromEmailImport,
  getPurchaseEmailImport,
  recordPurchaseEmailImportStatus,
  recordPurchaseEmailScanSkipped,
  type PurchaseAttachmentInput,
} from "./purchases";
import { purchaseCategories, purchaseEntities, type PurchaseCategory, type PurchaseEntity } from "./types";

export const purchaseMailboxes = [
  "longin.erwan@gmail.com",
  "contact@corsaimanager.com",
  "contact@sentieru.fr",
  "contact@traknio.com",
] as const;

export type PurchaseMailboxAddress = (typeof purchaseMailboxes)[number];

export type PurchaseMailboxConfig = {
  address: PurchaseMailboxAddress;
  provider: "gmail" | "imap";
  enabled?: boolean;
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  passwordEnv?: string;
};

export type PurchaseMailboxStatus =
  | "ready"
  | "disabled"
  | "missing_config"
  | "connection_error"
  | "completed";

export type PurchaseEmailScanStatus =
  | "disabled"
  | "no_mailboxes_configured"
  | "missing_config"
  | "completed"
  | "completed_with_errors";

export type PurchaseEmailScanStage =
  | "imap"
  | "parse"
  | "candidate_detection"
  | "openai_request"
  | "openai_response"
  | "blob_upload"
  | "database"
  | "unknown";

export type PurchaseEmailScanError = {
  mailbox: string;
  messageId?: string | null;
  subject?: string | null;
  sender?: string | null;
  stage: PurchaseEmailScanStage;
  code?: string | null;
  message: string;
  retryable: boolean;
};

export type PurchaseMailboxScanResult = {
  address: PurchaseMailboxAddress;
  provider?: "gmail" | "imap";
  status: PurchaseMailboxStatus;
  processedMessages: number;
  createdInvoices: number;
  skippedMessages: number;
  failedMessages: number;
  error: string | null;
  errors: PurchaseEmailScanError[];
  diagnostics?: Record<string, unknown>;
};

export type PurchaseEmailScanResult = {
  ok: boolean;
  status: PurchaseEmailScanStatus;
  scannedMailboxes: number;
  processedMessages: number;
  createdInvoices: number;
  skippedMessages: number;
  failedMessages: number;
  message: string;
  missing: string[];
  errors: string[];
  errorDetails: PurchaseEmailScanError[];
  mailboxes: PurchaseMailboxScanResult[];
  diagnostics: {
    ignoredMailboxes: string[];
    invalidEntries: number;
    malformedConfig: boolean;
    globalMissing: string[];
  };
};

export type PurchaseEmailScanDependencies = {
  scanMailbox?: (mailbox: PurchaseMailboxConfig) => Promise<PurchaseMailboxScanResult>;
};

type ExtractedPurchaseInvoice = {
  is_invoice: boolean;
  supplier_name: string | null;
  supplier_email: string | null;
  supplier_website: string | null;
  supplier_vat_number: string | null;
  supplier_siren_or_siret: string | null;
  entity: PurchaseEntity | null;
  category: PurchaseCategory | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_at: string | null;
  currency: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  confidence: number;
  summary: string;
  lines: Array<{
    description: string;
    quantity_milli: number;
    unit_price_cents: number;
    vat_rate_basis_points: number;
    total_cents: number;
  }>;
};

class PurchaseEmailStageError extends Error {
  readonly stage: PurchaseEmailScanStage;
  readonly code: string | null;
  readonly retryable: boolean;

  constructor({
    stage,
    code,
    message,
    retryable,
    cause,
  }: {
    stage: PurchaseEmailScanStage;
    code?: string | number | null;
    message: string;
    retryable: boolean;
    cause?: unknown;
  }) {
    super(message);
    this.name = "PurchaseEmailStageError";
    this.stage = stage;
    this.code = code === undefined || code === null ? null : String(code);
    this.retryable = retryable;
    this.cause = cause;
  }
}

export async function scanPurchaseInvoiceMailboxes(dependencies: PurchaseEmailScanDependencies = {}): Promise<PurchaseEmailScanResult> {
  const enabled = process.env.PURCHASE_EMAIL_SCAN_ENABLED === "true";
  const config = parseMailboxConfigDetailed();
  const plan = buildPurchaseMailboxScanPlan(config.mailboxes);
  const globalMissing = getGlobalMissingPurchaseScanConfig();
  const scan = dependencies.scanMailbox ?? scanMailbox;

  if (!enabled) {
    await safeRecordPurchaseEmailScanSkipped("disabled", { expected_mailboxes: purchaseMailboxes });
    const result = buildScanResult({
      ok: false,
      status: "disabled",
      message: "Scan achats désactivé. Définir PURCHASE_EMAIL_SCAN_ENABLED=true pour l'activer.",
      mailboxes: plan.results,
      errors: [],
      errorDetails: [],
      missing: globalMissing,
      config,
      globalMissing,
    });
    logScanResult(result);
    return result;
  }

  if (plan.ready.length === 0) {
    const status: PurchaseEmailScanStatus = config.mailboxes.length === 0 ? "no_mailboxes_configured" : "missing_config";
    await safeRecordPurchaseEmailScanSkipped(status, { missing: [...globalMissing, ...plan.missing] });
    const result = buildScanResult({
      ok: false,
      status,
      message: status === "no_mailboxes_configured"
        ? "Aucune boîte mail fournisseur n'est configurée."
        : "Aucune boîte mail fournisseur n'est prête à être scannée.",
      mailboxes: plan.results,
      errors: [],
      errorDetails: [],
      missing: [...globalMissing, ...plan.missing],
      config,
      globalMissing,
    });
    logScanResult(result);
    return result;
  }

  const mailboxResults = [...plan.results];

  for (const mailbox of plan.ready) {
    try {
      mailboxResults.push(await scan(mailbox));
    } catch (error) {
      const scanError = createPurchaseEmailScanError({
        mailbox: mailbox.address,
        messageId: null,
        parsed: null,
        stage: "imap",
        error,
      });
      logScanError(scanError);
      mailboxResults.push(createMailboxResult(mailbox.address, {
        provider: mailbox.provider,
        status: "connection_error",
        failedMessages: 1,
        error: scanError.message,
        errors: [scanError],
      }));
    }
  }

  const errorDetails = mailboxResults.flatMap((mailbox) => mailbox.errors);
  const errors = errorDetails.map((error) => `${error.mailbox}: ${error.stage}${error.code ? `/${error.code}` : ""}: ${error.message}`);
  const result = buildScanResult({
    ok: errors.length === 0,
    status: errors.length === 0 ? "completed" : "completed_with_errors",
    message: buildCompletionMessage(mailboxResults),
    mailboxes: mailboxResults,
    errors,
    errorDetails,
    missing: [...globalMissing, ...plan.missing],
    config,
    globalMissing,
  });
  logScanResult(result);
  return result;
}

async function scanMailbox(mailbox: PurchaseMailboxConfig): Promise<PurchaseMailboxScanResult> {
  const password = mailbox.passwordEnv ? process.env[mailbox.passwordEnv] : undefined;
  if (!mailbox.host || !mailbox.username || !password) {
    return createMailboxResult(mailbox.address, {
      provider: mailbox.provider,
      status: "missing_config",
      error: "Configuration IMAP incomplète.",
      diagnostics: getMailboxMissingDiagnostics(mailbox),
    });
  }

  const client = new ImapFlow({
    host: mailbox.host,
    port: mailbox.port ?? 993,
    secure: mailbox.secure ?? true,
    auth: {
      user: mailbox.username,
      pass: password,
    },
    logger: false,
  });

  const result = createMailboxResult(mailbox.address, {
    provider: mailbox.provider,
    status: "completed",
    processedMessages: 0,
    createdInvoices: 0,
    skippedMessages: 0,
    failedMessages: 0,
    error: null,
  });

  try {
    await client.connect();
  } catch (error) {
    const scanError = createPurchaseEmailScanError({
      mailbox: mailbox.address,
      messageId: null,
      parsed: null,
      stage: "imap",
      error,
    });
    logScanError(scanError);
    return createMailboxResult(mailbox.address, {
      provider: mailbox.provider,
      status: "connection_error",
      failedMessages: 1,
      error: scanError.message,
      errors: [scanError],
      diagnostics: getErrorDiagnostics(error),
    });
  }

  const lock = await client.getMailboxLock("INBOX");
  try {
    const since = new Date(Date.now() - getLookbackHours() * 60 * 60 * 1000);
    const uids = await client.search({ since });
    if (!uids || !uids.length) return result;

    for await (const message of client.fetch(uids, { envelope: true, internalDate: true, source: true }, { uid: true })) {
      result.processedMessages += 1;
      let parsed: ParsedMail | null = null;
      let messageId = `imap-uid-${message.uid}`;
      let stage: PurchaseEmailScanStage = "imap";
      try {
        if (!message.source) throw new Error("Message IMAP sans source.");
        stage = "parse";
        parsed = await parseMailSource(message.source);
        const parsedMail = parsed;
        messageId = getStableMessageId(parsedMail, message.uid);

        stage = "database";
        const existing = await runScanStage("database", () => getPurchaseEmailImport(mailbox.address, messageId));
        if (existing?.purchase_invoice_id || shouldSkipExistingPurchaseEmailImport(existing?.status)) {
          result.skippedMessages += 1;
          continue;
        }

        stage = "candidate_detection";
        const attachments = getInvoiceAttachments(parsedMail);
        if (!looksLikeInvoice(parsedMail, attachments)) {
          stage = "database";
          await runScanStage("database", () => recordPurchaseEmailImportStatus({
            mailbox: mailbox.address,
            provider: mailbox.provider,
            message_id: messageId,
            subject: parsedMail.subject,
            sender: parsedMail.from?.text,
            received_at: toIso(parsedMail.date ?? message.internalDate),
            status: "IGNORED",
            metadata: { reason: "not_invoice_candidate" },
          }));
          result.skippedMessages += 1;
          continue;
        }

        stage = "openai_request";
        const extraction = await extractPurchaseInvoiceWithAi({
          mailbox: mailbox.address,
          parsed: parsedMail,
          attachments,
        });
        if (!extraction.is_invoice || !extraction.supplier_name) {
          stage = "database";
          await runScanStage("database", () => recordPurchaseEmailImportStatus({
            mailbox: mailbox.address,
            provider: mailbox.provider,
            message_id: messageId,
            subject: parsedMail.subject,
            sender: parsedMail.from?.text,
            received_at: toIso(parsedMail.date ?? message.internalDate),
            status: "IGNORED",
            metadata: { reason: "ai_not_invoice", extraction },
          }));
          result.skippedMessages += 1;
          continue;
        }

        stage = "blob_upload";
        const uploadedAttachments = await runScanStage("blob_upload", () => uploadInvoiceAttachments(mailbox.address, messageId, attachments));
        stage = "database";
        const supplierName = extraction.supplier_name;
        const created = await runScanStage("database", () => createPurchaseInvoiceFromEmailImport({
          mailbox: mailbox.address,
          provider: mailbox.provider,
          message_id: messageId,
          subject: parsedMail.subject,
          sender: parsedMail.from?.text,
          received_at: toIso(parsedMail.date ?? message.internalDate),
          supplier: {
            name: supplierName,
            email: extraction.supplier_email,
            website: extraction.supplier_website,
            vat_number: extraction.supplier_vat_number,
            siren_or_siret: extraction.supplier_siren_or_siret,
          },
          entity: normalizeEntity(extraction.entity, mailbox.address),
          category: normalizeCategory(extraction.category),
          invoice_number: extraction.invoice_number,
          invoice_date: normalizeDate(extraction.invoice_date),
          due_at: normalizeDate(extraction.due_at),
          currency: extraction.currency,
          subtotal_cents: extraction.subtotal_cents,
          tax_cents: extraction.tax_cents,
          total_cents: extraction.total_cents,
          ai_confidence: extraction.confidence,
          ai_summary: extraction.summary,
          ai_raw_extraction: extraction as unknown as Record<string, unknown>,
          lines: extraction.lines,
          attachments: uploadedAttachments,
        }));
        if (created.created) result.createdInvoices += 1;
        else result.skippedMessages += 1;
      } catch (error) {
        result.failedMessages += 1;
        const scanError = createPurchaseEmailScanError({
          mailbox: mailbox.address,
          messageId,
          parsed,
          stage,
          error,
        });
        result.errors.push(scanError);
        result.error ??= scanError.message;
        logScanError(scanError);
        await recordPurchaseEmailImportStatus({
          mailbox: mailbox.address,
          provider: mailbox.provider,
          message_id: messageId,
          subject: parsed?.subject,
          sender: parsed?.from?.text,
          received_at: toIso(parsed?.date ?? message.internalDate),
          status: "FAILED",
          error: scanError.message,
          metadata: { retryable: scanError.retryable, stage: scanError.stage, code: scanError.code, error: getErrorDiagnostics(error) },
        }).catch((recordError) => {
          const databaseError = createPurchaseEmailScanError({
            mailbox: mailbox.address,
            messageId,
            parsed,
            stage: "database",
            error: recordError,
          });
          result.errors.push(databaseError);
          result.error ??= databaseError.message;
          logScanError(databaseError);
        });
      }
    }
  } finally {
    lock.release();
    await client.logout().catch(() => undefined);
  }

  return result;
}

export function shouldSkipExistingPurchaseEmailImport(status: string | null | undefined) {
  return status === "EXTRACTED" || status === "IGNORED";
}

function parseMailSource(source: Buffer): Promise<ParsedMail> {
  return simpleParser(source) as Promise<ParsedMail>;
}

export async function extractPurchaseInvoiceWithAi({
  mailbox,
  parsed,
  attachments,
}: {
  mailbox: PurchaseMailboxAddress;
  parsed: ParsedMail;
  attachments: Attachment[];
}): Promise<ExtractedPurchaseInvoice> {
  const content = [
    {
      type: "input_text",
      text: buildExtractionPrompt({
        mailbox,
        subject: parsed.subject ?? "",
        sender: parsed.from?.text ?? "",
        text: (parsed.text ?? "").slice(0, 12000),
      }),
    },
    ...attachments.slice(0, 4).map((attachment) => ({
      type: "input_file",
      filename: attachment.filename || "facture.pdf",
      file_data: `data:${attachment.contentType || "application/pdf"};base64,${attachment.content.toString("base64")}`,
    })),
  ];

  if (!process.env.OPENAI_API_KEY) {
    throw new PurchaseEmailStageError({
      stage: "openai_request",
      code: "missing_api_key",
      message: "OpenAI configuration missing: OPENAI_API_KEY",
      retryable: false,
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getOpenAiTimeoutMs());
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.PURCHASE_EMAIL_AI_MODEL || "gpt-4.1-mini",
        input: [{ role: "user", content }],
        text: {
          format: {
            type: "json_schema",
            name: "purchase_invoice_extraction",
            strict: true,
            schema: extractionSchema,
          },
        },
      }),
    });
  } catch (error) {
    throw new PurchaseEmailStageError({
      stage: "openai_request",
      code: getErrorCode(error) ?? (isAbortError(error) ? "timeout" : "network_error"),
      message: isAbortError(error) ? "OpenAI request timeout." : formatError(error),
      retryable: true,
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new PurchaseEmailStageError({
      stage: "openai_request",
      code: String(response.status),
      message: `OpenAI extraction failed (${response.status}): ${safeSnippet(errorText, 500)}`,
      retryable: isRetryableOpenAiStatus(response.status),
    });
  }

  let json: unknown;
  try {
    json = await response.json() as unknown;
  } catch (error) {
    throw new PurchaseEmailStageError({
      stage: "openai_response",
      code: "invalid_json",
      message: `Réponse OpenAI JSON invalide: ${formatError(error)}`,
      retryable: false,
      cause: error,
    });
  }

  try {
    return normalizeExtraction(parseResponseOutputText(json));
  } catch (error) {
    throw new PurchaseEmailStageError({
      stage: "openai_response",
      code: getErrorCode(error) ?? "invalid_response",
      message: formatError(error),
      retryable: false,
      cause: error,
    });
  }
}

function buildExtractionPrompt({
  mailbox,
  subject,
  sender,
  text,
}: {
  mailbox: PurchaseMailboxAddress;
  subject: string;
  sender: string;
  text: string;
}) {
  return [
    "Tu extrais une facture d'achat fournisseur pour CorsaiManager.",
    "CorsaiManager centralise aussi les marques Sentieru et Traknio.",
    `Boîte destinataire: ${mailbox}`,
    `Expéditeur: ${sender}`,
    `Objet: ${subject}`,
    "Règles:",
    "- Réponds uniquement au schéma JSON demandé.",
    "- Tous les montants sont en centimes entiers.",
    "- Si ce n'est pas une facture ou un reçu fournisseur, mets is_invoice=false.",
    "- Catégories autorisées: hosting, domain_name, advertising, publication_fees, software, bank_fees, subcontracting, other.",
    "- Entités autorisées: CORSAIMANAGER, SENTIERU, TRAKNIO.",
    "- Utilise CORSAIMANAGER par défaut si l'entité n'est pas certaine.",
    "- Conserve une confidence de 0 à 100.",
    "",
    "Texte de l'email:",
    text || "(vide)",
  ].join("\n");
}

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    is_invoice: { type: "boolean" },
    supplier_name: { type: ["string", "null"] },
    supplier_email: { type: ["string", "null"] },
    supplier_website: { type: ["string", "null"] },
    supplier_vat_number: { type: ["string", "null"] },
    supplier_siren_or_siret: { type: ["string", "null"] },
    entity: { type: ["string", "null"], enum: [...purchaseEntities, null] },
    category: { type: ["string", "null"], enum: [...purchaseCategories, null] },
    invoice_number: { type: ["string", "null"] },
    invoice_date: { type: ["string", "null"] },
    due_at: { type: ["string", "null"] },
    currency: { type: "string" },
    subtotal_cents: { type: "integer" },
    tax_cents: { type: "integer" },
    total_cents: { type: "integer" },
    confidence: { type: "integer" },
    summary: { type: "string" },
    lines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          description: { type: "string" },
          quantity_milli: { type: "integer" },
          unit_price_cents: { type: "integer" },
          vat_rate_basis_points: { type: "integer" },
          total_cents: { type: "integer" },
        },
        required: ["description", "quantity_milli", "unit_price_cents", "vat_rate_basis_points", "total_cents"],
      },
    },
  },
  required: [
    "is_invoice",
    "supplier_name",
    "supplier_email",
    "supplier_website",
    "supplier_vat_number",
    "supplier_siren_or_siret",
    "entity",
    "category",
    "invoice_number",
    "invoice_date",
    "due_at",
    "currency",
    "subtotal_cents",
    "tax_cents",
    "total_cents",
    "confidence",
    "summary",
    "lines",
  ],
};

async function uploadInvoiceAttachments(mailbox: PurchaseMailboxAddress, messageId: string, attachments: Attachment[]): Promise<PurchaseAttachmentInput[]> {
  const uploaded: PurchaseAttachmentInput[] = [];
  for (const attachment of attachments) {
    const filename = sanitizeFilename(attachment.filename || "facture.pdf");
    const checksum = createHash("sha256").update(attachment.content).digest("hex");
    const blob = await uploadPurchaseAttachmentToBlob({
      pathname: `purchase-invoices/${mailbox}/${sanitizeFilename(messageId)}/${filename}`,
      content: attachment.content,
      contentType: attachment.contentType || "application/pdf",
    });
    uploaded.push({
      filename,
      content_type: attachment.contentType,
      size_bytes: attachment.size,
      blob_url: blob.url,
      blob_path: blob.pathname,
      checksum_sha256: checksum,
    });
  }
  return uploaded;
}

export async function uploadPurchaseAttachmentToBlob({
  pathname,
  content,
  contentType,
}: {
  pathname: string;
  content: Buffer | Blob;
  contentType?: string;
}) {
  ensureBlobTokenAlias();
  const blob = await put(pathname, content, {
    access: "private",
    contentType,
    addRandomSuffix: true,
  });
  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

export function parseMailboxConfig(): PurchaseMailboxConfig[] {
  return parseMailboxConfigDetailed().mailboxes;
}

export function parseMailboxConfigDetailed() {
  const raw = process.env.PURCHASE_EMAIL_MAILBOXES_JSON;
  const result = {
    mailboxes: [] as PurchaseMailboxConfig[],
    ignoredMailboxes: [] as string[],
    invalidEntries: 0,
    malformedConfig: false,
  };
  if (!raw) return result;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return { ...result, malformedConfig: true };
    for (const entry of parsed) {
      const normalized = normalizeMailboxConfig(entry);
      if (normalized.mailbox) result.mailboxes.push(normalized.mailbox);
      if (normalized.ignoredMailbox) result.ignoredMailboxes.push(normalized.ignoredMailbox);
      if (normalized.invalid) result.invalidEntries += 1;
    }
    return result;
  } catch {
    return { ...result, malformedConfig: true };
  }
}

function normalizeMailboxConfig(entry: unknown): { mailbox?: PurchaseMailboxConfig; ignoredMailbox?: string; invalid?: boolean } {
  if (!entry || typeof entry !== "object") return { invalid: true };
  const record = entry as Record<string, unknown>;
  const address = typeof record.address === "string" ? record.address : "";
  if (!isPurchaseMailboxAddress(address)) return { ignoredMailbox: address || "unknown", invalid: true };
  const provider = record.provider === "gmail" ? "gmail" : "imap";
  return { mailbox: {
    address,
    provider,
    enabled: record.enabled === false || record.disabled === true ? false : true,
    host: typeof record.host === "string" ? record.host : undefined,
    port: typeof record.port === "number" ? record.port : undefined,
    secure: typeof record.secure === "boolean" ? record.secure : undefined,
    username: typeof record.username === "string" ? record.username : undefined,
    passwordEnv: typeof record.passwordEnv === "string" ? record.passwordEnv : undefined,
  } };
}

function getInvoiceAttachments(parsed: ParsedMail) {
  return parsed.attachments.filter((attachment) => {
    const filename = attachment.filename?.toLowerCase() ?? "";
    const contentType = attachment.contentType?.toLowerCase() ?? "";
    return contentType.includes("pdf") || filename.endsWith(".pdf");
  });
}

function looksLikeInvoice(parsed: ParsedMail, attachments: Attachment[]) {
  if (attachments.length > 0) return true;
  const haystack = `${parsed.subject ?? ""}\n${parsed.text ?? ""}`.toLowerCase();
  return ["facture", "invoice", "receipt", "reçu", "recu", "paiement", "payment"].some((word) => haystack.includes(word));
}

function getStableMessageId(parsed: ParsedMail, uid: number) {
  const sourceId = parsed.messageId || `${parsed.date?.toISOString() ?? "unknown"}-${parsed.subject ?? "message"}-${uid}`;
  return sourceId.replace(/^<|>$/g, "").slice(0, 500);
}

function parseResponseOutputText(response: unknown) {
  if (isRecord(response) && typeof response.output_text === "string") return response.output_text;
  if (!isRecord(response) || !Array.isArray(response.output)) throw new Error("Réponse OpenAI sans output.");
  for (const output of response.output) {
    if (!isRecord(output) || !Array.isArray(output.content)) continue;
    for (const content of output.content) {
      if (isRecord(content) && typeof content.text === "string") return content.text;
    }
  }
  throw new Error("Réponse OpenAI sans texte JSON.");
}

function normalizeExtraction(text: string): ExtractedPurchaseInvoice {
  const parsed = JSON.parse(text) as unknown;
  if (!isRecord(parsed)) throw new Error("Extraction IA invalide.");
  const lines = Array.isArray(parsed.lines) ? parsed.lines.filter(isRecord).map((line) => ({
    description: stringValue(line.description, "Facture fournisseur"),
    quantity_milli: integerValue(line.quantity_milli, 1000),
    unit_price_cents: positiveIntegerValue(line.unit_price_cents),
    vat_rate_basis_points: positiveIntegerValue(line.vat_rate_basis_points),
    total_cents: positiveIntegerValue(line.total_cents),
  })) : [];
  return {
    is_invoice: parsed.is_invoice === true,
    supplier_name: nullableString(parsed.supplier_name),
    supplier_email: nullableString(parsed.supplier_email),
    supplier_website: nullableString(parsed.supplier_website),
    supplier_vat_number: nullableString(parsed.supplier_vat_number),
    supplier_siren_or_siret: nullableString(parsed.supplier_siren_or_siret),
    entity: purchaseEntities.includes(parsed.entity as PurchaseEntity) ? (parsed.entity as PurchaseEntity) : null,
    category: purchaseCategories.includes(parsed.category as PurchaseCategory) ? (parsed.category as PurchaseCategory) : null,
    invoice_number: nullableString(parsed.invoice_number),
    invoice_date: nullableString(parsed.invoice_date),
    due_at: nullableString(parsed.due_at),
    currency: stringValue(parsed.currency, "EUR").toUpperCase(),
    subtotal_cents: positiveIntegerValue(parsed.subtotal_cents),
    tax_cents: positiveIntegerValue(parsed.tax_cents),
    total_cents: positiveIntegerValue(parsed.total_cents),
    confidence: Math.max(0, Math.min(100, integerValue(parsed.confidence, 0))),
    summary: stringValue(parsed.summary, ""),
    lines,
  };
}

function getGlobalMissingPurchaseScanConfig() {
  const missing = [];
  if (!getBlobReadWriteToken()) missing.push("PURCHASE_BLOB_READ_WRITE_TOKEN ou BLOB_READ_WRITE_TOKEN");
  if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
  if (!process.env.PURCHASE_EMAIL_MAILBOXES_JSON) missing.push("PURCHASE_EMAIL_MAILBOXES_JSON");
  return missing;
}

export function buildPurchaseMailboxScanPlan(mailboxConfig: PurchaseMailboxConfig[]) {
  const byAddress = new Map(mailboxConfig.map((mailbox) => [mailbox.address, mailbox]));
  const ready: PurchaseMailboxConfig[] = [];
  const results: PurchaseMailboxScanResult[] = [];
  const missing: string[] = [];

  for (const address of purchaseMailboxes) {
    const mailbox = byAddress.get(address);
    if (!mailbox) {
      missing.push(`mailbox:${address}`);
      results.push(createMailboxResult(address, { status: "missing_config", error: null }));
      continue;
    }
    if (mailbox.enabled === false) {
      results.push(createMailboxResult(address, { provider: mailbox.provider, status: "disabled", error: null }));
      continue;
    }
    const mailboxMissing = getMailboxMissingDiagnostics(mailbox);
    if (Object.keys(mailboxMissing).length > 0) {
      missing.push(`mailbox_config:${address}`);
      results.push(createMailboxResult(address, {
        provider: mailbox.provider,
        status: "missing_config",
        error: null,
        diagnostics: mailboxMissing,
      }));
      continue;
    }
    ready.push(mailbox);
  }

  return { ready, results, missing };
}

function getMailboxMissingDiagnostics(mailbox: PurchaseMailboxConfig) {
  return {
    ...(!mailbox.host ? { host: "missing" } : {}),
    ...(!mailbox.username ? { username: "missing" } : {}),
    ...(!mailbox.passwordEnv ? { passwordEnv: "missing" } : {}),
    ...(mailbox.passwordEnv && !process.env[mailbox.passwordEnv] ? { password: "env_unset", passwordEnv: mailbox.passwordEnv } : {}),
  };
}

function normalizeEntity(entity: PurchaseEntity | null, mailbox: PurchaseMailboxAddress): PurchaseEntity {
  if (entity && purchaseEntities.includes(entity)) return entity;
  if (mailbox.endsWith("@sentieru.fr")) return "SENTIERU";
  if (mailbox.endsWith("@traknio.com")) return "TRAKNIO";
  return "CORSAIMANAGER";
}

function normalizeCategory(category: PurchaseCategory | null): PurchaseCategory {
  return category && purchaseCategories.includes(category) ? category : "other";
}

function normalizeDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function getLookbackHours() {
  const parsed = Number.parseInt(process.env.PURCHASE_EMAIL_LOOKBACK_HOURS ?? "24", 10);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(720, parsed)) : 24;
}

function getOpenAiTimeoutMs() {
  const parsed = Number.parseInt(process.env.PURCHASE_EMAIL_AI_TIMEOUT_MS ?? "45000", 10);
  return Number.isFinite(parsed) ? Math.max(5000, Math.min(120000, parsed)) : 45000;
}

function sanitizeFilename(value: string) {
  return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, "-").replace(/\s+/g, " ").trim().slice(0, 180) || "facture.pdf";
}

function toIso(value: Date | string | false | undefined | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getBlobReadWriteToken() {
  return process.env.PURCHASE_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || "";
}

function ensureBlobTokenAlias() {
  if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.PURCHASE_BLOB_READ_WRITE_TOKEN) {
    process.env.BLOB_READ_WRITE_TOKEN = process.env.PURCHASE_BLOB_READ_WRITE_TOKEN;
  }
}

function isPurchaseMailboxAddress(value: string): value is PurchaseMailboxAddress {
  return purchaseMailboxes.includes(value as PurchaseMailboxAddress);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 500) : null;
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function integerValue(value: unknown, fallback: number) {
  return Number.isInteger(value) ? Number(value) : fallback;
}

function positiveIntegerValue(value: unknown) {
  return Math.max(0, integerValue(value, 0));
}

function formatError(error: unknown) {
  if (!isRecord(error)) return String(error);
  const message = typeof error.message === "string" ? error.message : "Erreur inconnue";
  const response = typeof error.response === "string" ? error.response : null;
  const code = typeof error.serverResponseCode === "string" ? error.serverResponseCode : typeof error.code === "string" ? error.code : null;
  return [code, message, response].filter(Boolean).join(" - ").slice(0, 1000);
}

export async function runScanStage<T>(stage: PurchaseEmailScanStage, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof PurchaseEmailStageError) throw error;
    throw new PurchaseEmailStageError({
      stage,
      code: getErrorCode(error),
      message: formatError(error),
      retryable: isRetryableError(error, stage),
      cause: error,
    });
  }
}

export function createPurchaseEmailScanError({
  mailbox,
  messageId,
  parsed,
  stage,
  error,
}: {
  mailbox: string;
  messageId?: string | null;
  parsed?: ParsedMail | null;
  stage: PurchaseEmailScanStage;
  error: unknown;
}): PurchaseEmailScanError {
  const staged = error instanceof PurchaseEmailStageError ? error : null;
  const normalizedStage = staged?.stage ?? stage ?? "unknown";
  const code = staged?.code ?? getErrorCode(error);
  return {
    mailbox: safeSnippet(mailbox, 200),
    messageId: nullableSnippet(messageId, 300),
    subject: nullableSnippet(parsed?.subject, 180),
    sender: nullableSnippet(parsed?.from?.text, 220),
    stage: normalizedStage,
    code: nullableSnippet(code, 80),
    message: safeSnippet(staged?.message ?? formatError(error), 700),
    retryable: staged?.retryable ?? isRetryableError(error, normalizedStage),
  };
}

function isRetryableError(error: unknown, stage: PurchaseEmailScanStage) {
  const code = getErrorCode(error)?.toUpperCase() ?? "";
  if (["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EAI_AGAIN", "TIMEOUT"].includes(code)) return true;
  if (isAbortError(error)) return true;
  if (stage === "blob_upload" || stage === "database" || stage === "imap") return code !== "AUTHENTICATIONFAILED";
  return false;
}

function isRetryableOpenAiStatus(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function getErrorCode(error: unknown) {
  if (!isRecord(error)) return null;
  const code = error.code ?? error.serverResponseCode ?? error.status ?? error.statusCode;
  return typeof code === "string" || typeof code === "number" ? String(code) : null;
}

function isAbortError(error: unknown) {
  return isRecord(error) && (error.name === "AbortError" || error.code === "ABORT_ERR");
}

function safeSnippet(value: unknown, maxLength: number) {
  const text = typeof value === "string" ? value : String(value ?? "");
  return text.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function nullableSnippet(value: unknown, maxLength: number) {
  const snippet = safeSnippet(value, maxLength);
  return snippet || null;
}

function getErrorDiagnostics(error: unknown) {
  if (!isRecord(error)) return { message: safeSnippet(error, 500) };
  const diagnostics: Record<string, unknown> = {};
  for (const key of ["name", "code", "serverResponseCode", "response", "command"]) {
    const value = error[key];
    if (typeof value === "string" || typeof value === "number") diagnostics[key] = safeSnippet(value, 500);
  }
  if (typeof error.message === "string") diagnostics.message = safeSnippet(error.message, 500);
  return diagnostics;
}

function createMailboxResult(address: PurchaseMailboxAddress, overrides: Partial<PurchaseMailboxScanResult>): PurchaseMailboxScanResult {
  return {
    address,
    status: "missing_config",
    processedMessages: 0,
    createdInvoices: 0,
    skippedMessages: 0,
    failedMessages: 0,
    error: null,
    errors: [],
    ...overrides,
  };
}

function buildScanResult({
  ok,
  status,
  message,
  mailboxes,
  errors,
  errorDetails,
  missing,
  config,
  globalMissing,
}: {
  ok: boolean;
  status: PurchaseEmailScanStatus;
  message: string;
  mailboxes: PurchaseMailboxScanResult[];
  errors: string[];
  errorDetails: PurchaseEmailScanError[];
  missing: string[];
  config: ReturnType<typeof parseMailboxConfigDetailed>;
  globalMissing: string[];
}): PurchaseEmailScanResult {
  const completed = mailboxes.filter((mailbox) => mailbox.status === "completed");
  return {
    ok,
    status,
    scannedMailboxes: completed.length,
    processedMessages: sum(mailboxes, "processedMessages"),
    createdInvoices: sum(mailboxes, "createdInvoices"),
    skippedMessages: sum(mailboxes, "skippedMessages"),
    failedMessages: sum(mailboxes, "failedMessages"),
    message,
    missing,
    errors,
    errorDetails,
    mailboxes,
    diagnostics: {
      ignoredMailboxes: config.ignoredMailboxes,
      invalidEntries: config.invalidEntries,
      malformedConfig: config.malformedConfig,
      globalMissing,
    },
  };
}

function buildCompletionMessage(mailboxes: PurchaseMailboxScanResult[]) {
  const created = sum(mailboxes, "createdInvoices");
  const skipped = sum(mailboxes, "skippedMessages");
  const failed = sum(mailboxes, "failedMessages");
  return `Scan achats terminé : ${created} facture(s) créée(s), ${skipped} message(s) ignoré(s), ${failed} erreur(s).`;
}

function sum(mailboxes: PurchaseMailboxScanResult[], key: "processedMessages" | "createdInvoices" | "skippedMessages" | "failedMessages") {
  return mailboxes.reduce((total, mailbox) => total + mailbox[key], 0);
}

function logScanResult(result: PurchaseEmailScanResult) {
  for (const mailbox of result.mailboxes) {
    console.info(
      `[purchase-email-scan] mailbox=${mailbox.address} status=${mailbox.status} processed=${mailbox.processedMessages} created=${mailbox.createdInvoices} skipped=${mailbox.skippedMessages} failed=${mailbox.failedMessages}`,
    );
  }
}

function logScanError(error: PurchaseEmailScanError) {
  console.warn(
    `[purchase-email-scan] mailbox=${error.mailbox} stage=${error.stage} message_id=${error.messageId ?? "-"} code=${error.code ?? "-"} retryable=${error.retryable} error="${safeSnippet(error.message, 300).replace(/"/g, "'")}"`,
  );
}

async function safeRecordPurchaseEmailScanSkipped(reason: string, metadata?: Record<string, unknown>) {
  try {
    await recordPurchaseEmailScanSkipped(reason, metadata);
  } catch (error) {
    console.warn(`[purchase-email-scan] scan_event_record_failed reason=${reason} error=${formatError(error)}`);
  }
}
