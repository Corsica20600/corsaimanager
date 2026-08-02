import Link from "next/link";
import { notFound } from "next/navigation";
import { PurchaseStatusBadge, purchaseCategoryLabels } from "@/components/billing/PurchaseStatusBadge";
import { SalesBackLink } from "@/components/billing/SalesEmptyState";
import { formatBillingDate, formatBillingMoney } from "@/lib/billing/format";
import { getPurchaseInvoiceDetails } from "@/lib/billing/purchases";
import { rejectPurchaseInvoiceAction, validatePurchaseInvoiceAction } from "../actions";

export default async function PurchaseInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);
  if (!Number.isInteger(numericId)) notFound();
  const details = await getPurchaseInvoiceDetails(numericId);
  if (!details) notFound();
  const { invoice, supplier, lines, attachments, emailImport } = details;
  const canReview = invoice.status === "DETECTED" || invoice.status === "NEEDS_REVIEW" || invoice.status === "REJECTED";

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SalesBackLink />
        <Link href="/ventes/achats" className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">Retour aux achats</Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Facture fournisseur</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">{supplier.name}</h1>
            <p className="mt-2 text-sm text-zinc-400">Numéro : {invoice.invoice_number ?? "non détecté"}</p>
          </div>
          <PurchaseStatusBadge status={invoice.status} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Marque" value={invoice.entity} />
          <Info label="Catégorie" value={purchaseCategoryLabels[invoice.category]} />
          <Info label="Date facture" value={formatBillingDate(invoice.invoice_date)} />
          <Info label="Échéance" value={formatBillingDate(invoice.due_at)} />
          <Info label="HT" value={formatBillingMoney(invoice.subtotal_cents, invoice.currency)} />
          <Info label="TVA" value={formatBillingMoney(invoice.tax_cents, invoice.currency)} />
          <Info label="TTC" value={formatBillingMoney(invoice.total_cents, invoice.currency)} />
          <Info label="Confiance IA" value={invoice.ai_confidence == null ? "-" : `${invoice.ai_confidence}/100`} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-semibold text-zinc-100">Extraction IA</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{invoice.ai_summary ?? "Aucun résumé IA enregistré pour cette facture."}</p>
          {invoice.ai_raw_extraction ? (
            <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-white/10 bg-zinc-950/80 p-4 text-xs text-zinc-300">{JSON.stringify(invoice.ai_raw_extraction, null, 2)}</pre>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-semibold text-zinc-100">Source email</h2>
          <div className="mt-4 grid gap-3 text-sm text-zinc-300">
            <Info label="Boîte" value={invoice.source_mailbox ?? "-"} />
            <Info label="Message ID" value={invoice.source_message_id ?? "-"} />
            <Info label="Objet" value={emailImport?.subject ?? "-"} />
            <Info label="Expéditeur" value={emailImport?.sender ?? supplier.email ?? "-"} />
          </div>
        </section>
      </div>

      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>{["Description", "Quantité", "PU", "TVA", "Total"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-4 py-3">{line.description}</td>
                <td className="px-4 py-3">{line.quantity_milli / 1000}</td>
                <td className="px-4 py-3">{formatBillingMoney(line.unit_price_cents, invoice.currency)}</td>
                <td className="px-4 py-3">{line.vat_rate_basis_points / 100}%</td>
                <td className="px-4 py-3">{formatBillingMoney(line.total_cents, invoice.currency)}</td>
              </tr>
            ))}
            {!lines.length ? <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-400">Aucune ligne détaillée détectée.</td></tr> : null}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h2 className="text-xl font-semibold text-zinc-100">Pièces jointes</h2>
        <div className="mt-4 grid gap-3">
          {attachments.map((attachment) => (
            <a key={attachment.id} href={attachment.blob_url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-cyan-100 hover:border-cyan-300/40">
              {attachment.filename} <span className="text-zinc-500">({attachment.content_type ?? "fichier"})</span>
            </a>
          ))}
          {!attachments.length ? <p className="text-sm text-zinc-400">Aucune pièce jointe Blob stockée.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h2 className="text-xl font-semibold text-zinc-100">Validation humaine</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <form action={validatePurchaseInvoiceAction} className="grid gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <input type="hidden" name="id" value={invoice.id} />
            <label className="text-sm text-zinc-300">
              Note de validation
              <textarea name="review_notes" defaultValue={invoice.review_notes ?? ""} className="mt-2 min-h-24 w-full rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100" />
            </label>
            <button disabled={!canReview} className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50">Valider la facture d&apos;achat</button>
          </form>
          <form action={rejectPurchaseInvoiceAction} className="grid gap-3 rounded-xl border border-rose-300/20 bg-rose-300/10 p-4">
            <input type="hidden" name="id" value={invoice.id} />
            <label className="text-sm text-zinc-300">
              Motif de rejet
              <textarea name="rejection_reason" defaultValue={invoice.rejection_reason ?? ""} className="mt-2 min-h-24 w-full rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100" />
            </label>
            <button className="rounded-full border border-rose-300/40 px-5 py-2.5 text-sm font-semibold text-rose-100">Rejeter</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-zinc-100">{value}</p>
    </div>
  );
}
