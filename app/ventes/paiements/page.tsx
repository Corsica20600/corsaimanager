import Link from "next/link";
import { SalesBackLink } from "@/components/billing/SalesEmptyState";
import { formatBillingDate, formatBillingMoney } from "@/lib/billing/format";
import { formatPaymentMethod } from "@/lib/billing/payment-methods";
import { getPayments } from "@/lib/billing/repository";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const payments = await getPayments({ query: value(params.q), page: Number.parseInt(value(params.page) ?? "1", 10), pageSize: 30 });
  return (
    <div className="grid gap-5">
      <SalesBackLink />
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Paiements</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Paiements manuels</h1>
        <form className="mt-5 flex gap-2"><input name="q" defaultValue={value(params.q) ?? ""} placeholder="Facture, client, référence" className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100" /><button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">Filtrer</button></form>
      </section>
      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300"><tr>{["Date", "Facture", "Client", "Montant", "Moyen", "Statut", "Référence"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr></thead>
          <tbody>
            {payments.items.map((payment) => <tr key={payment.id} className="border-b border-white/5 text-zinc-200"><td className="px-4 py-3">{formatBillingDate(payment.paid_at)}</td><td className="px-4 py-3">{payment.invoice_id ? <Link href={`/ventes/factures/${payment.invoice_id}`} className="text-cyan-100">{payment.invoice_number ?? `#${payment.invoice_id}`}</Link> : "-"}</td><td className="px-4 py-3">{payment.company_name}</td><td className="px-4 py-3 font-medium">{formatBillingMoney(payment.amount_cents, payment.currency)}</td><td className="px-4 py-3">{formatPaymentMethod(payment.method)}</td><td className="px-4 py-3">{payment.status}</td><td className="px-4 py-3">{payment.reference ?? "-"}</td></tr>)}
            {!payments.items.length ? <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400">Aucun paiement.</td></tr> : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function value(input: string | string[] | undefined) { return Array.isArray(input) ? input[0] : input; }
