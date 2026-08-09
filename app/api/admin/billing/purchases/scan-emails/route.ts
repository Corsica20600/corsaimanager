import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { scanPurchaseInvoiceMailboxes } from "@/lib/billing/purchase-email-scan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ ok: false, error: "Non autorise." }, { status: 401 });
  }

  try {
    const result = await scanPurchaseInvoiceMailboxes();
    return NextResponse.json(result, {
      status: result.status === "completed" || result.status === "completed_with_errors" ? 200 : 409,
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[purchase-email-scan] manual route failed", error);
    return NextResponse.json(
      {
        ok: false,
        status: "failed",
        error: error instanceof Error ? error.message : "Scan achats impossible.",
      },
      { status: 500 },
    );
  }
}
