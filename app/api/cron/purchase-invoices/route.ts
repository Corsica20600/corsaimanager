import { NextResponse } from "next/server";
import { scanPurchaseInvoiceMailboxes } from "@/lib/billing/purchase-email-scan";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = validateCronRequest(request);
  if (authError) return authError;

  try {
    const result = await scanPurchaseInvoiceMailboxes();
    return NextResponse.json(result, { status: result.ok ? 200 : 503 });
  } catch (error) {
    console.error("[cron] purchase-invoices failed", error);
    return NextResponse.json({ ok: false, error: "purchase_invoice_scan_failed" }, { status: 500 });
  }
}

function validateCronRequest(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET manquant côté serveur." }, { status: 500 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
  const headerSecret = request.headers.get("x-cron-secret") ?? "";

  if (constantTimeEqual(bearer, expectedSecret) || constantTimeEqual(headerSecret.trim(), expectedSecret)) {
    return null;
  }

  return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
}

function constantTimeEqual(value: string, expected: string) {
  if (!value || value.length !== expected.length) return false;
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result |= value.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return result === 0;
}
