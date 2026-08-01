import { NextResponse } from "next/server";
import { requireBillingPermission } from "@/lib/billing/access";
import { getCreditNoteDetails } from "@/lib/billing/repository";
import { renderCreditNotePdfBuffer } from "@/lib/billing/invoice-pdf";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireBillingPermission("billing:view");
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Avoir invalide." }, { status: 400 });
  const details = await getCreditNoteDetails(id);
  if (!details) return NextResponse.json({ error: "Avoir introuvable." }, { status: 404 });
  const buffer = await renderCreditNotePdfBuffer(details);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${details.creditNote.number ?? `avoir-${details.creditNote.id}`}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
