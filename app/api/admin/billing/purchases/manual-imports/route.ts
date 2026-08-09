import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { analyseManualPurchaseBlob, confirmManualPurchaseImport } from "@/lib/billing/purchase-manual-import";
import type { ManualPurchaseDraft } from "@/lib/billing/purchases";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  try {
    const body = await request.json() as { url?: unknown; pathname?: unknown; filename?: unknown };
    if (typeof body.url !== "string" || typeof body.pathname !== "string" || typeof body.filename !== "string") throw new Error("Document importé invalide.");
    const preview = await analyseManualPurchaseBlob({ url: body.url, pathname: body.pathname, filename: body.filename });
    return NextResponse.json({ ok: true, preview }, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch (error) {
    console.error(`[purchase-manual-import] analyse failed error=${safeError(error)}`);
    return NextResponse.json({ ok: false, error: clientError(error) }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  try {
    const body = await request.json() as { importId?: unknown; draft?: unknown };
    if (typeof body.importId !== "string" || !isDraft(body.draft)) throw new Error("Aperçu de facture invalide.");
    const result = await confirmManualPurchaseImport(body.importId, body.draft);
    return NextResponse.json({ ok: true, ...result }, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch (error) {
    console.error(`[purchase-manual-import] creation failed error=${safeError(error)}`);
    return NextResponse.json({ ok: false, error: clientError(error) }, { status: 400 });
  }
}

function isDraft(value: unknown): value is ManualPurchaseDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<ManualPurchaseDraft>;
  return typeof draft.supplierName === "string" && typeof draft.invoiceNumber === "string" && typeof draft.invoiceDate === "string"
    && typeof draft.currency === "string" && typeof draft.subtotalCents === "number" && typeof draft.taxCents === "number"
    && typeof draft.totalCents === "number" && typeof draft.entity === "string" && typeof draft.category === "string"
    && typeof draft.description === "string" && typeof draft.confidence === "number" && Array.isArray(draft.lines);
}

function clientError(error: unknown) {
  const message = error instanceof Error ? error.message : "Import impossible. Réessayez.";
  return message.length <= 300 ? message : "Import impossible. Réessayez.";
}

function safeError(error: unknown) {
  return (error instanceof Error ? error.message : "unknown").replace(/[\r\n\t]/g, " ").slice(0, 300);
}
