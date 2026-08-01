import Link from "next/link";
import { createQuoteAction } from "@/app/ventes/actions";
import { QuoteForm } from "@/components/billing/QuoteForm";
import { getBillingProducts, getBillingSettings, getQuoteProspectOptions } from "@/lib/billing/repository";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewQuotePage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedProspectId = parseId(value(params.prospectId));
  const [settings, products, prospects] = await Promise.all([
    getBillingSettings(),
    getBillingProducts(),
    getQuoteProspectOptions("", selectedProspectId),
  ]);

  return (
    <div className="grid gap-5">
      <Link href="/ventes/devis" className="text-sm text-cyan-200 hover:text-cyan-100">Retour aux devis</Link>
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Nouveau devis</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Créer un brouillon</h1>
      </div>
      {!prospects.length ? (
        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm text-amber-100">
          Aucun prospect CRM disponible. Ajoutez d&apos;abord un prospect dans le CRM.
        </section>
      ) : (
        <QuoteForm action={createQuoteAction} prospects={prospects} products={products} settings={settings} selectedProspectId={selectedProspectId} />
      )}
    </div>
  );
}

function value(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}

function parseId(value?: string) {
  const id = Number.parseInt(value ?? "", 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}
