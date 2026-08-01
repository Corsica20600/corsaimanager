import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInvoiceAction } from "@/app/ventes/actions";
import { QuoteForm } from "@/components/billing/QuoteForm";
import { getBillingProducts, getBillingSettings, getInvoiceDetails, getQuoteProspectOptions } from "@/lib/billing/repository";
import { isInvoiceEditable } from "@/lib/billing/invoice-status";
import type { QuoteDetails } from "@/lib/billing/types";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id)) notFound();
  const details = await getInvoiceDetails(id);
  if (!details) notFound();
  const [settings, products, prospects] = await Promise.all([getBillingSettings(), getBillingProducts(), getQuoteProspectOptions("", details.invoice.prospect_id)]);
  const quoteLikeDetails = {
    quote: { ...details.invoice, expires_at: details.invoice.due_at, discount_cents: 0, deposit_cents: 0, public_token_hash: null, public_token_revoked_at: null, accepted_at: null, rejected_at: null, accepted_by_name: null, acceptance_ip: null, acceptance_user_agent: null, acceptance_comment: null, converted_invoice_id: null },
    lines: details.lines.map((line) => ({ ...line, quote_id: details.invoice.id })),
    prospect: details.prospect,
  } as unknown as QuoteDetails;

  return (
    <div className="grid gap-5">
      <Link href={`/ventes/factures/${id}`} className="text-sm text-cyan-200 hover:text-cyan-100">Retour à la facture</Link>
      <h1 className="text-3xl font-semibold text-zinc-100">Modifier {details.invoice.number ?? `brouillon #${details.invoice.id}`}</h1>
      {!isInvoiceEditable(details.invoice.status) || details.invoice.number ? (
        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm text-amber-100">Cette facture est figée. Dupliquez-la ou créez un avoir.</section>
      ) : (
        <QuoteForm action={updateInvoiceAction} prospects={prospects} products={products} settings={settings} quoteDetails={quoteLikeDetails} />
      )}
    </div>
  );
}
