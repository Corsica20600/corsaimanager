import { NextResponse } from "next/server";
import { requireBillingPermission } from "@/lib/billing/access";
import { getQuoteDetails } from "@/lib/billing/repository";
import { renderQuotePdfBuffer } from "@/lib/billing/quote-pdf";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  await requireBillingPermission("billing:view");
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Devis invalide." }, { status: 400 });

  const details = await getQuoteDetails(id);
  if (!details) return NextResponse.json({ error: "Devis introuvable." }, { status: 404 });

  const buffer = await renderQuotePdfBuffer(details);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${details.quote.number ?? `devis-${details.quote.id}`}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
