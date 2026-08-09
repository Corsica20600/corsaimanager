import Link from "next/link";
import { PurchaseEmailScanPanel } from "@/components/billing/PurchaseEmailScanPanel";
import { PurchaseStatusBadge, purchaseCategoryLabels, purchaseStatusLabels } from "@/components/billing/PurchaseStatusBadge";
import { SalesBackLink } from "@/components/billing/SalesEmptyState";
import { formatBillingDate, formatBillingMoney } from "@/lib/billing/format";
import { getPurchaseInvoices } from "@/lib/billing/purchases";
import { purchaseCategories, purchaseEntities, purchaseInvoiceStatuses, type PurchaseCategory, type PurchaseEntity, type PurchaseInvoiceStatus } from "@/lib/billing/types";

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const invoices = await getPurchaseInvoices({
    query: value(params.q),
    status: normalizeStatus(value(params.status)),
    entity: normalizeEntity(value(params.entity)),
    category: normalizeCategory(value(params.category)),
    page: Number.parseInt(value(params.page) ?? "1", 10),
    pageSize: 20,
  });

  return (
    <div className="grid gap-5">
      <SalesBackLink />

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Achats</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Factures fournisseurs</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300">
          Les factures détectées dans les boîtes mail arrivent ici en brouillon contrôlé. L&apos;IA propose le fournisseur, la catégorie,
          les montants et la pièce jointe, puis vous validez ou rejetez.
        </p>

        <form className="mt-5 flex flex-wrap gap-2">
          <input name="q" defaultValue={value(params.q) ?? ""} placeholder="Fournisseur, numéro, mailbox" className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100" />
          <select name="status" defaultValue={normalizeStatus(value(params.status))} className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100">
            <option value="all" className="bg-zinc-900">Tous statuts</option>
            {purchaseInvoiceStatuses.map((status) => <option key={status} value={status} className="bg-zinc-900">{purchaseStatusLabels[status]}</option>)}
          </select>
          <select name="entity" defaultValue={normalizeEntity(value(params.entity))} className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100">
            <option value="all" className="bg-zinc-900">Toutes marques</option>
            {purchaseEntities.map((entity) => <option key={entity} value={entity} className="bg-zinc-900">{entity}</option>)}
          </select>
          <select name="category" defaultValue={normalizeCategory(value(params.category))} className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100">
            <option value="all" className="bg-zinc-900">Toutes catégories</option>
            {purchaseCategories.map((category) => <option key={category} value={category} className="bg-zinc-900">{purchaseCategoryLabels[category]}</option>)}
          </select>
          <button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">Filtrer</button>
        </form>
      </section>

      <PurchaseEmailScanPanel />

      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>{["Fournisseur", "Marque", "Catégorie", "Statut", "Numéro", "Date", "TTC", "Source", "Action"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr>
          </thead>
          <tbody>
            {invoices.items.map((invoice) => (
              <tr key={invoice.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-100">{invoice.supplier_name}</div>
                  <div className="text-xs text-zinc-500">{invoice.supplier_email ?? "Email fournisseur non renseigné"}</div>
                </td>
                <td className="px-4 py-3">{invoice.entity}</td>
                <td className="px-4 py-3">{purchaseCategoryLabels[invoice.category]}</td>
                <td className="px-4 py-3"><PurchaseStatusBadge status={invoice.status} /></td>
                <td className="px-4 py-3">{invoice.invoice_number ?? "-"}</td>
                <td className="px-4 py-3">{formatBillingDate(invoice.invoice_date)}</td>
                <td className="px-4 py-3 font-medium">{formatBillingMoney(invoice.total_cents, invoice.currency)}</td>
                <td className="px-4 py-3">
                  <div>{invoice.source_mailbox ?? "-"}</div>
                  <div className="text-xs text-zinc-500">{invoice.attachment_count} pièce(s)</div>
                </td>
                <td className="px-4 py-3"><Link href={`/ventes/achats/${invoice.id}`} className="rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs text-cyan-100">Contrôler</Link></td>
              </tr>
            ))}
            {!invoices.items.length ? <tr><td colSpan={9} className="px-4 py-10 text-center text-zinc-400">Aucune facture fournisseur à afficher.</td></tr> : null}
          </tbody>
        </table>
      </section>

      <p className="text-sm text-zinc-400">{invoices.total} factures d&apos;achat - page {invoices.page} / {invoices.totalPages}</p>
    </div>
  );
}

function value(input: string | string[] | undefined) { return Array.isArray(input) ? input[0] : input; }
function normalizeStatus(status?: string): PurchaseInvoiceStatus | "all" { return purchaseInvoiceStatuses.includes(status as PurchaseInvoiceStatus) ? (status as PurchaseInvoiceStatus) : "all"; }
function normalizeEntity(entity?: string): PurchaseEntity | "all" { return purchaseEntities.includes(entity as PurchaseEntity) ? (entity as PurchaseEntity) : "all"; }
function normalizeCategory(category?: string): PurchaseCategory | "all" { return purchaseCategories.includes(category as PurchaseCategory) ? (category as PurchaseCategory) : "all"; }
