import Link from "next/link";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { SalesBackLink } from "@/components/billing/SalesEmptyState";
import { formatBillingDate, formatBillingMoney } from "@/lib/billing/format";
import { getInvoices } from "@/lib/billing/repository";
import { invoiceOrigins, invoiceStatuses, type InvoiceOrigin, type InvoicePaymentFilter, type InvoiceSort, type InvoiceStatus } from "@/lib/billing/types";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const invoices = await getInvoices({
    query: value(params.q),
    status: normalizeStatus(value(params.status)),
    payment: normalizePayment(value(params.payment)),
    origin: normalizeOrigin(value(params.origin)),
    sort: normalizeSort(value(params.sort)),
    page: Number.parseInt(value(params.page) ?? "1", 10),
    pageSize: 20,
  });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SalesBackLink />
        <Link href="/ventes/factures/nouveau" className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-zinc-950">Nouvelle facture</Link>
      </div>
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Factures</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Factures ponctuelles</h1>
        <form className="mt-5 flex flex-wrap gap-2">
          <input name="q" defaultValue={value(params.q) ?? ""} placeholder="Numéro, client, email" className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100" />
          <select name="status" defaultValue={normalizeStatus(value(params.status)) ?? "all"} className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100">
            <option value="all" className="bg-zinc-900">Tous statuts</option>
            {invoiceStatuses.map((status) => <option key={status} value={status} className="bg-zinc-900">{status}</option>)}
          </select>
          <select name="payment" defaultValue={normalizePayment(value(params.payment))} className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100">
            <option value="all" className="bg-zinc-900">Tous paiements</option>
            <option value="paid" className="bg-zinc-900">Payées</option>
            <option value="partial" className="bg-zinc-900">Partielles</option>
            <option value="unpaid" className="bg-zinc-900">Impayées</option>
            <option value="overdue" className="bg-zinc-900">En retard</option>
          </select>
          <select name="origin" defaultValue={normalizeOrigin(value(params.origin)) ?? "all"} className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100">
            <option value="all" className="bg-zinc-900">Toutes origines</option>
            <option value="MANUAL" className="bg-zinc-900">Manuelle</option>
            <option value="QUOTE" className="bg-zinc-900">Depuis devis</option>
          </select>
          <button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">Filtrer</button>
        </form>
      </section>
      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>{["Numéro", "Client", "Statut", "Origine", "TTC", "Payé", "Reste", "Échéance", "Action"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr>
          </thead>
          <tbody>
            {invoices.items.map((invoice) => (
              <tr key={invoice.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-4 py-3">{invoice.number ?? `Brouillon #${invoice.id}`}</td>
                <td className="px-4 py-3"><div className="font-medium text-zinc-100">{invoice.company_name}</div><div className="text-xs text-zinc-500">{invoice.email ?? "Email manquant"}</div></td>
                <td className="px-4 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
                <td className="px-4 py-3">{invoice.origin}</td>
                <td className="px-4 py-3">{formatBillingMoney(invoice.total_cents, invoice.currency)}</td>
                <td className="px-4 py-3">{formatBillingMoney(invoice.paid_cents, invoice.currency)}</td>
                <td className="px-4 py-3 font-medium">{formatBillingMoney(invoice.remaining_cents, invoice.currency)}</td>
                <td className="px-4 py-3">{formatBillingDate(invoice.due_at)}</td>
                <td className="px-4 py-3"><Link href={`/ventes/factures/${invoice.id}`} className="rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs text-cyan-100">Ouvrir</Link></td>
              </tr>
            ))}
            {!invoices.items.length ? <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-400">Aucune facture.</td></tr> : null}
          </tbody>
        </table>
      </section>
      <p className="text-sm text-zinc-400">{invoices.total} factures - page {invoices.page} / {invoices.totalPages}</p>
    </div>
  );
}

function value(input: string | string[] | undefined) { return Array.isArray(input) ? input[0] : input; }
function normalizeStatus(status?: string): InvoiceStatus | "all" { return invoiceStatuses.includes(status as InvoiceStatus) ? (status as InvoiceStatus) : "all"; }
function normalizeOrigin(origin?: string): InvoiceOrigin | "all" { return invoiceOrigins.includes(origin as InvoiceOrigin) ? (origin as InvoiceOrigin) : "all"; }
function normalizePayment(payment?: string): InvoicePaymentFilter { return ["paid", "partial", "unpaid", "overdue"].includes(payment ?? "") ? (payment as InvoicePaymentFilter) : "all"; }
function normalizeSort(sort?: string): InvoiceSort { return ["issued_asc", "due_asc", "due_desc", "amount_desc", "amount_asc"].includes(sort ?? "") ? (sort as InvoiceSort) : "issued_desc"; }
