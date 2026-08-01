import { NextResponse } from "next/server";
import { getQuoteByPublicToken, markQuoteViewed, syncQuoteExpiration } from "@/lib/billing/repository";
import { renderQuotePdfBuffer } from "@/lib/billing/quote-pdf";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { token } = await params;
  const details = await getQuoteByPublicToken(token);
  if (!details) return NextResponse.json({ error: "Devis introuvable." }, { status: 404 });
  await syncQuoteExpiration(details.quote.id);
  const refreshed = await getQuoteByPublicToken(token);
  if (!refreshed) return NextResponse.json({ error: "Devis introuvable." }, { status: 404 });
  await markQuoteViewed(refreshed);

  const buffer = await renderQuotePdfBuffer(refreshed);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${refreshed.quote.number ?? `devis-${refreshed.quote.id}`}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
