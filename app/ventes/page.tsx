import { getBillingDashboardSummary } from "@/lib/billing/repository";
import { formatBillingMoney } from "@/lib/billing/format";

export default async function SalesDashboardPage() {
  const summary = await getBillingDashboardSummary();
  const metrics = [
    ["CA encaissé du mois", formatBillingMoney(summary.collected_this_month_cents)],
    ["CA facturé du mois", formatBillingMoney(summary.invoiced_this_month_cents)],
    ["Reste à encaisser", formatBillingMoney(summary.outstanding_cents)],
    ["Factures en retard", String(summary.overdue_invoices)],
    ["Devis en attente", String(summary.pending_quotes)],
    ["MRR", formatBillingMoney(summary.mrr_cents)],
    ["ARR", formatBillingMoney(summary.arr_cents)],
    ["Paiements échoués", String(summary.failed_payments)],
  ];

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
          </article>
        ))}
      </section>

    </div>
  );
}
