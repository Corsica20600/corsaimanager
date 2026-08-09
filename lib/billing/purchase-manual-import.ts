import { createHash, randomUUID } from "node:crypto";
import { del, get } from "@vercel/blob";
import type { Attachment, ParsedMail } from "mailparser";
import { extractPurchaseInvoiceWithAi, type ExtractedPurchaseInvoice } from "./purchase-email-scan";
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
  const normalizedType = contentType.toLowerCase().trim();
  if (!(normalizedType in manualPurchaseFileTypes)) throw new Error("Format non pris en charge. Utilisez un PDF, PNG, JPEG ou WebP.");
  if (!Number.isSafeInteger(size) || size <= 0 || size > manualPurchaseMaxFileSize || content.length !== size) {
    throw new Error("Le document doit peser entre 1 octet et 10 Mo.");
  }
  const detected = detectManualPurchaseFileType(content);
  if (!detected || detected !== normalizedType) throw new Error("Le type réel du fichier ne correspond pas au format annoncé.");
  if (!safeFilename(filename)) throw new Error("Nom de fichier invalide.");
  return { contentType: normalizedType as keyof typeof manualPurchaseFileTypes, filename: safeFilename(filename) };
}

export function detectManualPurchaseFileType(content: Buffer): keyof typeof manualPurchaseFileTypes | null {
  if (content.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (content.length >= 8 && content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) return "image/jpeg";
  if (content.length >= 12 && content.subarray(0, 4).toString("ascii") === "RIFF" && content.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export async function analyseManualPurchaseBlob({ url, pathname, filename }: { url: string; pathname: string; filename: string }): Promise<ManualPurchasePreview> {
  if (!pathname.startsWith("manual-purchase-invoices/")) throw new Error("Document importé invalide.");
  ensureBlobTokenAlias();
  const stored = await get(pathname, { access: "private", useCache: false });
  if (!stored || stored.statusCode !== 200) throw new Error("Document introuvable. Déposez-le à nouveau.");
  if (stored.blob.url !== url || stored.blob.pathname !== pathname) throw new Error("Document importé invalide.");
  if (stored.blob.size > manualPurchaseMaxFileSize) throw new Error("Le document dépasse la taille maximale de 10 Mo.");
  const content = Buffer.from(await new Response(stored.stream).arrayBuffer());
  const valid = validateManualPurchaseFile({ filename, contentType: stored.blob.contentType, size: stored.blob.size, content });

  let extraction: ExtractedPurchaseInvoice;
  try {
    extraction = await extractPurchaseInvoiceWithAi({
      mailbox: "contact@corsaimanager.com",
      parsed: { subject: `Facture déposée : ${valid.filename}`, text: "Document déposé manuellement depuis un portail fournisseur." } as ParsedMail,
      attachments: [{ filename: valid.filename, contentType: valid.contentType, content, size: content.length } as Attachment],
    });
  } catch (error) {
    await safeDeleteBlob(pathname);
    throw error;
  }
  if (!extraction.is_invoice || !extraction.supplier_name) {
    await safeDeleteBlob(pathname);
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
    blobUrl: stored.blob.url,
    blobPath: stored.blob.pathname,
    checksumSha256: createHash("sha256").update(content).digest("hex"),
    extraction,
  });
  return { importId, filename: valid.filename, duplicateInvoiceId, ...draft };
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
