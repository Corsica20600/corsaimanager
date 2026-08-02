import { put } from "@vercel/blob";
import { recordPurchaseEmailScanSkipped } from "./purchases";

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
  status: "disabled" | "missing_config" | "ready";
  scannedMailboxes: number;
  createdInvoices: number;
  message: string;
  missing: string[];
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
      createdInvoices: 0,
      message: "Scan achats désactivé. Définir PURCHASE_EMAIL_SCAN_ENABLED=true pour l'activer.",
      missing,
    };
  }

  if (missing.length > 0) {
    await recordPurchaseEmailScanSkipped("missing_config", { missing });
    return {
      ok: false,
      status: "missing_config",
      scannedMailboxes: 0,
      createdInvoices: 0,
      message: "Configuration incomplète pour scanner les factures fournisseurs.",
      missing,
    };
  }

  await recordPurchaseEmailScanSkipped("connector_not_implemented_yet", {
    mailboxes: mailboxConfig.map((mailbox) => mailbox.address),
    ai_model: process.env.PURCHASE_EMAIL_AI_MODEL ?? null,
  });
  return {
    ok: true,
    status: "ready",
    scannedMailboxes: 0,
    createdInvoices: 0,
    message: "Configuration prête. Le connecteur Gmail/IMAP peut maintenant être branché.",
    missing: [],
  };
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
    if (mailbox.provider === "imap") {
      if (!mailbox.host) missing.push(`host:${mailbox.address}`);
      if (!mailbox.username) missing.push(`username:${mailbox.address}`);
      if (!mailbox.passwordEnv) missing.push(`passwordEnv:${mailbox.address}`);
      if (mailbox.passwordEnv && !process.env[mailbox.passwordEnv]) missing.push(mailbox.passwordEnv);
    }
  }

  return missing;
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
