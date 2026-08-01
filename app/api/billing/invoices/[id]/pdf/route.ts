import { NextResponse } from "next/server";
import { requireBillingPermission } from "@/lib/billing/access";
import { getInvoiceDetails } from "@/lib/billing/repository";
import { renderInvoicePdfBuffer } from "@/lib/billing/invoice-pdf";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireBillingPermission("billing:view");
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Facture invalide." }, { status: 400 });
  const details = await getInvoiceDetails(id);
  if (!details) return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
  const buffer = await renderInvoicePdfBuffer(details);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${details.invoice.number ?? `facture-${details.invoice.id}`}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
