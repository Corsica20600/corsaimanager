import Link from "next/link";
import { notFound } from "next/navigation";
import { updateQuoteAction } from "@/app/ventes/actions";
import { QuoteForm } from "@/components/billing/QuoteForm";
import { getBillingProducts, getBillingSettings, getQuoteDetails, getQuoteProspectOptions } from "@/lib/billing/repository";
import { isQuoteEditable } from "@/lib/billing/quote-status";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditQuotePage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id)) notFound();
  const details = await getQuoteDetails(id);
  if (!details) notFound();
  const [settings, products, prospects] = await Promise.all([
    getBillingSettings(),
    getBillingProducts(),
    getQuoteProspectOptions("", details.quote.prospect_id),
  ]);

  return (
    <div className="grid gap-5">
      <Link href={`/ventes/devis/${id}`} className="text-sm text-cyan-200 hover:text-cyan-100">Retour au devis</Link>
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Modifier</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">{details.quote.number ?? `Brouillon #${details.quote.id}`}</h1>
      </div>
      {!isQuoteEditable(details.quote.status) || details.quote.number ? (
        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm text-amber-100">
          Ce devis a déjà été émis. Dupliquez-le pour repartir sur un nouveau brouillon.
        </section>
      ) : (
        <QuoteForm action={updateQuoteAction} prospects={prospects} products={products} settings={settings} quoteDetails={details} />
      )}
    </div>
  );
}
