import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteImportedPurchaseInvoice } from "@/lib/billing/purchases";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });

  const { id } = await context.params;
  const purchaseId = Number.parseInt(id, 10);
  if (!Number.isSafeInteger(purchaseId) || purchaseId <= 0 || String(purchaseId) !== id) {
    return NextResponse.json({ ok: false, error: "Identifiant d'achat invalide." }, { status: 400 });
  }

  let reason: string | null = null;
  try {
    const body = await request.json().catch(() => null) as { reason?: unknown } | null;
    if (typeof body?.reason === "string") reason = body.reason.trim().slice(0, 1000) || null;
    const result = await deleteImportedPurchaseInvoice(purchaseId, reason);
    revalidatePath("/ventes/achats");
    revalidatePath(`/ventes/achats/${purchaseId}`);
    return NextResponse.json({ ok: true, ...result }, { headers: { "cache-control": "no-store, max-age=0" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Suppression impossible.";
    console.error(`[purchase-invoice-delete] failed invoice_id=${purchaseId} error=${message.replace(/[\r\n\t]/g, " ").slice(0, 300)}`);
    const status = message.includes("introuvable") ? 404 : message.includes("non importée") ? 409 : 500;
    return NextResponse.json({ ok: false, error: status === 500 ? "Suppression de l'achat impossible. Réessayez." : message }, { status });
  }
}
