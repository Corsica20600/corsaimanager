import { createHash, randomUUID } from "node:crypto";
import { del, get } from "@vercel/blob";
import type { Attachment, ParsedMail } from "mailparser";
import { extractPurchaseInvoiceWithAi, uploadPurchaseAttachmentToBlob, type ExtractedPurchaseInvoice } from "./purchase-email-scan";
import { createManualPurchaseInvoice, detectManualPurchaseDuplicate, getManualPurchaseImport, saveManualPurchaseImport, type ManualPurchaseDraft } from "./purchases";
import { purchaseCategories, purchaseEntities, type PurchaseCategory, type PurchaseEntity } from "./types";

export const manualPurchaseFileTypes = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/webp": "webp",
} as const;

export const manualPurchaseMaxFileSize = 10 * 1024 * 1024;

export type ManualPurchasePreview = ManualPurchaseDraft & {
  importId: string;
  filename: string;
  duplicateInvoiceId: number | null;
};

export function validateManualPurchaseFile({ filename, contentType, size, content }: { filename: string; contentType: string; size: number; content: Buffer }) {
  const normalizedType = contentType.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  if (!(normalizedType in manualPurchaseFileTypes)) throw new Error("Format non pris en charge. Utilisez un PDF, PNG, JPEG ou WebP.");
  if (!Number.isSafeInteger(size) || size <= 0 || size > manualPurchaseMaxFileSize || content.length !== size) {
    throw new Error("Le document doit peser entre 1 octet et 10 Mo.");
  }
  const detected = detectManualPurchaseSignature(content).contentType;
  if (!detected || detected !== normalizedType) throw new Error("Le type réel du fichier ne correspond pas au format annoncé.");
  if (!safeFilename(filename)) throw new Error("Nom de fichier invalide.");
  return { contentType: normalizedType as keyof typeof manualPurchaseFileTypes, filename: safeFilename(filename) };
}

export function detectManualPurchaseFileType(content: Buffer): keyof typeof manualPurchaseFileTypes | null {
  return detectManualPurchaseSignature(content).contentType;
}

export function detectManualPurchaseSignature(content: Buffer): { contentType: keyof typeof manualPurchaseFileTypes | null; offset: number | null } {
  const pdfOffset = pdfSignatureOffset(content);
  if (pdfOffset !== null) return { contentType: "application/pdf", offset: pdfOffset };
  if (content.length >= 8 && content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { contentType: "image/png", offset: 0 };
  if (content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) return { contentType: "image/jpeg", offset: 0 };
  if (content.length >= 12 && content.subarray(0, 4).toString("ascii") === "RIFF" && content.subarray(8, 12).toString("ascii") === "WEBP") return { contentType: "image/webp", offset: 0 };
  return { contentType: null, offset: null };
}

export async function analyseManualPurchaseBlob({ pathname, filename }: { pathname: string; filename: string }): Promise<ManualPurchasePreview> {
  if (!isManualBlobPath(pathname)) throw new Error("Document importé invalide.");
  ensureBlobTokenAlias();
  const stored = await get(pathname, { access: "private", useCache: false });
  if (!stored || stored.statusCode !== 200) throw new Error("Document introuvable. Déposez-le à nouveau.");
  if (stored.blob.pathname !== pathname) throw new Error("Document importé invalide.");
  if (stored.blob.size > manualPurchaseMaxFileSize) throw new Error("Le document dépasse la taille maximale de 10 Mo.");
  const content = Buffer.from(await new Response(stored.stream).arrayBuffer());
  return analyseManualPurchaseContent({
    filename,
    contentType: stored.blob.contentType,
    size: stored.blob.size,
    content,
    blobUrl: stored.blob.url,
    blobPath: stored.blob.pathname,
  });
}

export async function analyseManualPurchaseFormDataFile(file: File): Promise<ManualPurchasePreview> {
  const content = Buffer.from(await file.arrayBuffer());
  const filename = file.name || "facture";
  const validation = validateManualPurchaseFile({ filename, contentType: file.type, size: file.size, content });
  const pathname = `manual-purchase-invoices/${randomUUID()}/${validation.filename}`;
  const blob = await uploadPurchaseAttachmentToBlob({ pathname, content, contentType: validation.contentType });
  return analyseManualPurchaseContent({ filename, contentType: validation.contentType, size: content.length, content, blobUrl: blob.url, blobPath: blob.pathname });
}

async function analyseManualPurchaseContent({ filename, contentType, size, content, blobUrl, blobPath }: {
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
  blobUrl: string;
  blobPath: string;
}): Promise<ManualPurchasePreview> {
  const signature = detectManualPurchaseSignature(content);
  let valid: { contentType: keyof typeof manualPurchaseFileTypes; filename: string };
  try {
    valid = validateManualPurchaseFile({ filename, contentType, size, content });
    logManualValidation({ declaredType: contentType, size, detectedType: signature.contentType, result: "accepted" });
  } catch (error) {
    logManualValidation({ declaredType: contentType, size, detectedType: signature.contentType, result: "rejected", reason: validationReason(error) });
    await safeDeleteBlob(blobPath);
    throw error;
  }

  let extraction: ExtractedPurchaseInvoice;
  try {
    extraction = await extractPurchaseInvoiceWithAi({
      mailbox: "contact@corsaimanager.com",
      parsed: { subject: `Facture déposée : ${valid.filename}`, text: "Document déposé manuellement depuis un portail fournisseur." } as ParsedMail,
      attachments: [{ filename: valid.filename, contentType: valid.contentType, content, size: content.length } as Attachment],
    });
  } catch (error) {
    await safeDeleteBlob(blobPath);
    throw error;
  }
  if (!extraction.is_invoice || !extraction.supplier_name) {
    await safeDeleteBlob(blobPath);
    throw new Error("Ce document ne semble pas être une facture fournisseur.");
  }

  const importId = randomUUID();
  const draft = mapManualPurchaseExtraction(extraction);
  const duplicateInvoiceId = await detectManualPurchaseDuplicate(draft);
  await saveManualPurchaseImport({
    id: importId,
    filename: valid.filename,
    contentType: valid.contentType,
    sizeBytes: content.length,
    blobUrl,
    blobPath,
    checksumSha256: createHash("sha256").update(content).digest("hex"),
    extraction,
  });
  return { importId, filename: valid.filename, duplicateInvoiceId, ...draft };
}

function pdfSignatureOffset(content: Buffer) {
  let offset = 0;
  if (content.length >= 3 && content[0] === 0xef && content[1] === 0xbb && content[2] === 0xbf) offset = 3;
  while (offset < Math.min(content.length, 1024) && (content[offset] === 0x20 || content[offset] === 0x09 || content[offset] === 0x0a || content[offset] === 0x0d)) offset += 1;
  return content.subarray(offset, offset + 5).toString("ascii") === "%PDF-" ? offset : null;
}

function logManualValidation({ declaredType, size, detectedType, result, reason }: { declaredType: string; size: number; detectedType: string | null; result: "accepted" | "rejected"; reason?: string }) {
  console.info(`[purchase-manual-import] validation result=${result} declared_mime=${safeLogValue(declaredType)} size=${size} signature=${detectedType ?? "unknown"} reason=${reason ?? "-"}`);
}

function validationReason(error: unknown) {
  const message = error instanceof Error ? error.message : "unknown";
  if (message.includes("Format non pris")) return "mime_not_allowed";
  if (message.includes("peser")) return "invalid_size";
  if (message.includes("type réel")) return "signature_mismatch";
  if (message.includes("Nom de fichier")) return "invalid_filename";
  return "validation_failed";
}

function safeLogValue(value: string) {
  return value.replace(/[\r\n\t]/g, " ").slice(0, 120);
}

export function mapManualPurchaseExtraction(extraction: ExtractedPurchaseInvoice): ManualPurchaseDraft {
  return {
    supplierName: extraction.supplier_name ?? "",
    invoiceNumber: extraction.invoice_number ?? "",
    invoiceDate: normalizeDate(extraction.invoice_date),
    currency: normalizeCurrency(extraction.currency),
    subtotalCents: extraction.subtotal_cents,
    taxCents: extraction.tax_cents,
    totalCents: extraction.total_cents,
    entity: extraction.entity && purchaseEntities.includes(extraction.entity) ? extraction.entity : "CORSAIMANAGER",
    category: extraction.category && purchaseCategories.includes(extraction.category) ? extraction.category : "other",
    description: extraction.summary || extraction.lines[0]?.description || "Facture fournisseur",
    confidence: extraction.confidence,
    lines: extraction.lines,
  };
}

export async function confirmManualPurchaseImport(importId: string, input: ManualPurchaseDraft) {
  const manualImport = await getManualPurchaseImport(importId);
  if (!manualImport || manualImport.status !== "PENDING") throw new Error("Cet import n'est plus disponible. Déposez le document à nouveau.");
  const draft = normalizeManualPurchaseDraft(input);
  const duplicateInvoiceId = await detectManualPurchaseDuplicate(draft);
  if (duplicateInvoiceId) return { created: false, duplicateInvoiceId };
  return createManualPurchaseInvoice({ manualImport, draft });
}

export function normalizeManualPurchaseDraft(input: ManualPurchaseDraft): ManualPurchaseDraft {
  const supplierName = input.supplierName.trim().slice(0, 200);
  if (!supplierName) throw new Error("Le fournisseur est obligatoire.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.invoiceDate)) throw new Error("La date de facture est invalide.");
  const entity: PurchaseEntity = purchaseEntities.includes(input.entity) ? input.entity : "CORSAIMANAGER";
  const category: PurchaseCategory = purchaseCategories.includes(input.category) ? input.category : "other";
  const totalCents = cents(input.totalCents);
  return {
    supplierName,
    invoiceNumber: input.invoiceNumber.trim().slice(0, 160),
    invoiceDate: input.invoiceDate,
    currency: normalizeCurrency(input.currency),
    subtotalCents: cents(input.subtotalCents),
    taxCents: cents(input.taxCents),
    totalCents,
    entity,
    category,
    description: input.description.trim().slice(0, 500) || "Facture fournisseur",
    confidence: Math.max(0, Math.min(100, Math.round(input.confidence || 0))),
    lines: input.lines.length ? input.lines : [{ description: input.description || "Facture fournisseur", quantity_milli: 1000, unit_price_cents: totalCents, vat_rate_basis_points: 0, total_cents: totalCents }],
  };
}

function safeFilename(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function isManualBlobPath(pathname: string) {
  return /^manual-purchase-invoices\/[a-f0-9-]{36}\/[a-zA-Z0-9._-]{1,120}$/.test(pathname);
}

function normalizeDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : new Date().toISOString().slice(0, 10);
}

function normalizeCurrency(value: string) {
  const currency = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : "EUR";
}

function cents(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function ensureBlobTokenAlias() {
  if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.PURCHASE_BLOB_READ_WRITE_TOKEN) process.env.BLOB_READ_WRITE_TOKEN = process.env.PURCHASE_BLOB_READ_WRITE_TOKEN;
}

async function safeDeleteBlob(pathname: string) {
  try {
    ensureBlobTokenAlias();
    await del(pathname);
  } catch (error) {
    console.error(`[purchase-manual-import] blob cleanup failed path=${pathname.slice(0, 180)} error=${error instanceof Error ? error.message.slice(0, 250) : "unknown"}`);
  }
}
