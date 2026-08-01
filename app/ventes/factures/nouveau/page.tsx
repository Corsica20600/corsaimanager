import Link from "next/link";
import { createInvoiceAction } from "@/app/ventes/actions";
import { QuoteForm } from "@/components/billing/QuoteForm";
import { getBillingProducts, getBillingSettings, getQuoteProspectOptions } from "@/lib/billing/repository";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const selectedProspectId = parseId(value(params.prospectId));
  const [settings, products, prospects] = await Promise.all([getBillingSettings(), getBillingProducts(), getQuoteProspectOptions("", selectedProspectId)]);
  return (
    <div className="grid gap-5">
      <Link href="/ventes/factures" className="text-sm text-cyan-200 hover:text-cyan-100">Retour aux factures</Link>
      <div><p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Nouvelle facture</p><h1 className="mt-2 text-3xl font-semibold text-zinc-100">Créer un brouillon</h1></div>
      <QuoteForm action={createInvoiceAction} prospects={prospects} products={products} settings={settings} selectedProspectId={selectedProspectId} />
    </div>
  );
}

function value(input: string | string[] | undefined) { return Array.isArray(input) ? input[0] : input; }
function parseId(raw?: string) { const id = Number.parseInt(raw ?? "", 10); return Number.isInteger(id) && id > 0 ? id : null; }
