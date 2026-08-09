import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { manualPurchaseFileTypes, manualPurchaseMaxFileSize } from "@/lib/billing/purchase-manual-import";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  try {
    const body = await request.json();
    const result = await handleUpload({
      request,
      body,
      token: blobToken(),
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("manual-purchase-invoices/") || pathname.split("/").length !== 3) throw new Error("Chemin de document invalide.");
        return {
          allowedContentTypes: Object.keys(manualPurchaseFileTypes),
          maximumSizeInBytes: manualPurchaseMaxFileSize,
          validUntil: Date.now() + 10 * 60 * 1000,
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error(`[purchase-manual-upload] token failed error=${safeError(error)}`);
    return NextResponse.json({ error: "Préparation du dépôt impossible." }, { status: 400 });
  }
}

function blobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.PURCHASE_BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("Blob non configuré.");
  return token;
}

function safeError(error: unknown) {
  return (error instanceof Error ? error.message : "unknown").replace(/[\r\n\t]/g, " ").slice(0, 300);
}
