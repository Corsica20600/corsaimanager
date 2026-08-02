import { put } from "@vercel/blob";

export type BillingBlobDocumentType = "quote" | "invoice" | "credit-note" | "stripe-invoice";

export type ArchivedBillingPdf = {
  url: string;
  pathname: string;
};

export async function archiveBillingPdf({
  documentType,
  id,
  number,
  content,
}: {
  documentType: BillingBlobDocumentType;
  id: number | string;
  number: string | null | undefined;
  content: Buffer | Blob;
}): Promise<ArchivedBillingPdf> {
  ensureBlobTokenAlias();
  const safeNumber = sanitizePathSegment(number || `${documentType}-${id}`);
  const pathname = `billing/${documentType}/${id}/${safeNumber}.pdf`;
  const blob = await put(pathname, content, {
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: true,
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function archiveRemoteBillingPdf({
  documentType,
  id,
  number,
  sourceUrl,
}: {
  documentType: BillingBlobDocumentType;
  id: number | string;
  number: string | null | undefined;
  sourceUrl: string;
}): Promise<ArchivedBillingPdf> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Téléchargement PDF impossible (${response.status}).`);
  }
  const content = Buffer.from(await response.arrayBuffer());
  return archiveBillingPdf({ documentType, id, number, content });
}

function ensureBlobTokenAlias() {
  if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.PURCHASE_BLOB_READ_WRITE_TOKEN) {
    process.env.BLOB_READ_WRITE_TOKEN = process.env.PURCHASE_BLOB_READ_WRITE_TOKEN;
  }
}

function sanitizePathSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "document";
}
