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
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  passwordEnv?: string;
};

export type PurchaseEmailScanResult = {
  ok: boolean;
  status: "disabled" | "missing_config" | "completed";
  scannedMailboxes: number;
  processedMessages: number;
  createdInvoices: number;
  skippedMessages: number;
  failedMessages: number;
  message: string;
  missing: string[];
  errors: string[];
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

export async function scanPurchaseInvoiceMailboxes(): Promise<PurchaseEmailScanResult> {
  const enabled = process.env.PURCHASE_EMAIL_SCAN_ENABLED === "true";
  const mailboxConfig = parseMailboxConfig();
  const missing = getMissingPurchaseScanConfig(mailboxConfig);

  if (!enabled) {
    await recordPurchaseEmailScanSkipped("disabled", { expected_mailboxes: purchaseMailboxes });
    return {
      ok: true,
      status: "disabled",
      scannedMailboxes: 0,
      processedMessages: 0,
      createdInvoices: 0,
      skippedMessages: 0,
      failedMessages: 0,
      message: "Scan achats désactivé. Définir PURCHASE_EMAIL_SCAN_ENABLED=true pour l'activer.",
      missing,
      errors: [],
    };
  }

  if (missing.length > 0) {
    await recordPurchaseEmailScanSkipped("missing_config", { missing });
    return {
      ok: false,
      status: "missing_config",
      scannedMailboxes: 0,
      processedMessages: 0,
      createdInvoices: 0,
      skippedMessages: 0,
      failedMessages: 0,
      message: "Configuration incomplète pour scanner les factures fournisseurs.",
      missing,
      errors: [],
    };
  }

  const totals = {
    scannedMailboxes: 0,
    processedMessages: 0,
    createdInvoices: 0,
    skippedMessages: 0,
    failedMessages: 0,
    errors: [] as string[],
  };

  for (const mailbox of mailboxConfig) {
    try {
      const result = await scanMailbox(mailbox);
      totals.scannedMailboxes += 1;
      totals.processedMessages += result.processedMessages;
      totals.createdInvoices += result.createdInvoices;
      totals.skippedMessages += result.skippedMessages;
      totals.failedMessages += result.failedMessages;
      totals.errors.push(...result.errors);
    } catch (error) {
      totals.failedMessages += 1;
      totals.errors.push(`${mailbox.address}: ${formatError(error)}`);
    }
  }

  return {
    ok: totals.errors.length === 0,
    status: "completed",
    ...totals,
    message: `Scan achats terminé : ${totals.createdInvoices} facture(s) créée(s), ${totals.skippedMessages} message(s) ignoré(s).`,
    missing: [],
  };
}

async function scanMailbox(mailbox: PurchaseMailboxConfig) {
  const password = mailbox.passwordEnv ? process.env[mailbox.passwordEnv] : undefined;
  if (!mailbox.host || !mailbox.username || !password) throw new Error("Configuration IMAP incomplète.");

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

  const result = {
    processedMessages: 0,
    createdInvoices: 0,
    skippedMessages: 0,
    failedMessages: 0,
    errors: [] as string[],
  };

  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    const since = new Date(Date.now() - getLookbackHours() * 60 * 60 * 1000);
    const uids = await client.search({ since });
    if (!uids || !uids.length) return result;

    for await (const message of client.fetch(uids, { envelope: true, internalDate: true, source: true }, { uid: true })) {
      result.processedMessages += 1;
      try {
        if (!message.source) throw new Error("Message IMAP sans source.");
        const parsed = await parseMailSource(message.source);
        const messageId = getStableMessageId(parsed, message.uid);
        const existing = await getPurchaseEmailImport(mailbox.address, messageId);
        if (existing?.status === "EXTRACTED" || existing?.status === "IGNORED") {
          result.skippedMessages += 1;
          continue;
        }

        const attachments = getInvoiceAttachments(parsed);
        if (!looksLikeInvoice(parsed, attachments)) {
          await recordPurchaseEmailImportStatus({
            mailbox: mailbox.address,
            provider: mailbox.provider,
            message_id: messageId,
            subject: parsed.subject,
            sender: parsed.from?.text,
            received_at: toIso(parsed.date ?? message.internalDate),
            status: "IGNORED",
            metadata: { reason: "not_invoice_candidate" },
          });
          result.skippedMessages += 1;
          continue;
        }

        const extraction = await extractPurchaseInvoiceWithAi({
          mailbox: mailbox.address,
          parsed,
          attachments,
        });
        if (!extraction.is_invoice || !extraction.supplier_name) {
          await recordPurchaseEmailImportStatus({
            mailbox: mailbox.address,
            provider: mailbox.provider,
            message_id: messageId,
            subject: parsed.subject,
            sender: parsed.from?.text,
            received_at: toIso(parsed.date ?? message.internalDate),
            status: "IGNORED",
            metadata: { reason: "ai_not_invoice", extraction },
          });
          result.skippedMessages += 1;
          continue;
        }

        const uploadedAttachments = await uploadInvoiceAttachments(mailbox.address, messageId, attachments);
        const created = await createPurchaseInvoiceFromEmailImport({
          mailbox: mailbox.address,
          provider: mailbox.provider,
          message_id: messageId,
          subject: parsed.subject,
          sender: parsed.from?.text,
          received_at: toIso(parsed.date ?? message.internalDate),
          supplier: {
            name: extraction.supplier_name,
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
        });
        if (created.created) result.createdInvoices += 1;
        else result.skippedMessages += 1;
      } catch (error) {
        result.failedMessages += 1;
        result.errors.push(`${mailbox.address}: ${formatError(error)}`);
      }
    }
  } finally {
    lock.release();
    await client.logout().catch(() => undefined);
  }

  return result;
}

function parseMailSource(source: Buffer): Promise<ParsedMail> {
  return simpleParser(source) as Promise<ParsedMail>;
}

async function extractPurchaseInvoiceWithAi({
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

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI extraction failed (${response.status}): ${errorText.slice(0, 500)}`);
  }

  const json = await response.json() as unknown;
  return normalizeExtraction(parseResponseOutputText(json));
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
  const raw = process.env.PURCHASE_EMAIL_MAILBOXES_JSON;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => normalizeMailboxConfig(entry));
  } catch {
    return [];
  }
}

function normalizeMailboxConfig(entry: unknown): PurchaseMailboxConfig[] {
  if (!entry || typeof entry !== "object") return [];
  const record = entry as Record<string, unknown>;
  const address = typeof record.address === "string" ? record.address : "";
  if (!isPurchaseMailboxAddress(address)) return [];
  const provider = record.provider === "gmail" ? "gmail" : "imap";
  return [{
    address,
    provider,
    host: typeof record.host === "string" ? record.host : undefined,
    port: typeof record.port === "number" ? record.port : undefined,
    secure: typeof record.secure === "boolean" ? record.secure : undefined,
    username: typeof record.username === "string" ? record.username : undefined,
    passwordEnv: typeof record.passwordEnv === "string" ? record.passwordEnv : undefined,
  }];
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

function getMissingPurchaseScanConfig(mailboxConfig: PurchaseMailboxConfig[]) {
  const missing = [];
  if (!getBlobReadWriteToken()) missing.push("PURCHASE_BLOB_READ_WRITE_TOKEN ou BLOB_READ_WRITE_TOKEN");
  if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
  if (!process.env.PURCHASE_EMAIL_MAILBOXES_JSON) missing.push("PURCHASE_EMAIL_MAILBOXES_JSON");

  const configuredAddresses = new Set(mailboxConfig.map((mailbox) => mailbox.address));
  for (const address of purchaseMailboxes) {
    if (!configuredAddresses.has(address)) missing.push(`mailbox:${address}`);
  }

  for (const mailbox of mailboxConfig) {
    if (!mailbox.host) missing.push(`host:${mailbox.address}`);
    if (!mailbox.username) missing.push(`username:${mailbox.address}`);
    if (!mailbox.passwordEnv) missing.push(`passwordEnv:${mailbox.address}`);
    if (mailbox.passwordEnv && !process.env[mailbox.passwordEnv]) missing.push(mailbox.passwordEnv);
  }

  return missing;
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
  return error instanceof Error ? error.message : String(error);
}
