import Link from "next/link";
import { notFound } from "next/navigation";
import { createCreditNoteFromInvoiceAction, duplicateInvoiceAction, finalizeInvoiceAction, recordPaymentAction, sendInvoiceAction, voidInvoiceAction } from "@/app/ventes/actions";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { formatBillingDate, formatBillingDateTime, formatBillingMoney } from "@/lib/billing/format";
import { formatPaymentMethod, visiblePaymentMethods } from "@/lib/billing/payment-methods";
import { getBillingEventsForEntity, getInvoiceDetails, syncInvoiceOverdue } from "@/lib/billing/repository";
import { isInvoiceEditable } from "@/lib/billing/invoice-status";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id)) notFound();
  await syncInvoiceOverdue(id);
  const [details, events] = await Promise.all([getInvoiceDetails(id), getBillingEventsForEntity("invoice", String(id), 20)]);
  if (!details) notFound();
  const subject = `Facture ${details.invoice.number ?? `#${details.invoice.id}`} - CorsaiManager`;
  const message = `Bonjour,\n\nVous trouverez votre facture CorsaiManager en pièce jointe.\n\nMontant TTC : ${formatBillingMoney(details.invoice.total_cents, details.invoice.currency)}\nReste à payer : ${formatBillingMoney(details.invoice.remaining_cents, details.invoice.currency)}\n\nBien cordialement,\nCorsaiManager`;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/ventes/factures" className="text-sm text-cyan-200 hover:text-cyan-100">Retour aux factures</Link>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-100">{details.invoice.number ?? `Brouillon #${details.invoice.id}`}</h1>
          <div className="mt-3 flex flex-wrap gap-2"><InvoiceStatusBadge status={details.invoice.status} /><span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">{formatBillingMoney(details.invoice.remaining_cents, details.invoice.currency)} restant</span></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/api/billing/invoices/${details.invoice.id}/pdf`} className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100">PDF</Link>
          {isInvoiceEditable(details.invoice.status) ? <Link href={`/ventes/factures/${details.invoice.id}/modifier`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-100">Modifier</Link> : null}
        </div>
      </div>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-4">
        <Info label="Client" value={details.prospect.company_name} />
        <Info label="Email" value={details.prospect.email ?? "Email manquant"} />
        <Info label="Origine" value={details.quote?.number ? `Devis ${details.quote.number}` : details.invoice.origin} />
        <Info label="Échéance" value={formatBillingDate(details.invoice.due_at)} />
        <Info label="Émise" value={formatBillingDateTime(details.invoice.issued_at)} />
        <Info label="Envoyée" value={formatBillingDateTime(details.invoice.sent_at)} />
        <Info label="Payée" value={formatBillingDateTime(details.invoice.paid_at)} />
        <Info label="Total TTC" value={formatBillingMoney(details.invoice.total_cents, details.invoice.currency)} />
      </section>

      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300"><tr>{["Description", "Qté", "PU HT", "TVA", "Total TTC"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr></thead>
          <tbody>{details.lines.map((line) => <tr key={line.id} className="border-b border-white/5 text-zinc-200"><td className="px-4 py-3">{line.description}</td><td className="px-4 py-3">{line.quantity_milli / 1000} {line.unit}</td><td className="px-4 py-3">{formatBillingMoney(line.unit_price_cents, details.invoice.currency)}</td><td className="px-4 py-3">{line.vat_rate_basis_points / 100}%</td><td className="px-4 py-3 font-medium">{formatBillingMoney(line.total_cents, details.invoice.currency)}</td></tr>)}</tbody>
        </table>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-3">
        <Info label="HT" value={formatBillingMoney(details.invoice.subtotal_cents, details.invoice.currency)} />
        <Info label="TVA" value={formatBillingMoney(details.invoice.tax_cents, details.invoice.currency)} />
        <Info label="TTC" value={formatBillingMoney(details.invoice.total_cents, details.invoice.currency)} />
        <Info label="Payé" value={formatBillingMoney(details.invoice.paid_cents, details.invoice.currency)} />
        <Info label="Reste" value={formatBillingMoney(details.invoice.remaining_cents, details.invoice.currency)} />
        <Info label="Avoirs" value={formatBillingMoney(details.creditNotes.reduce((sum, note) => sum + (note.status === "VOID" ? 0 : note.total_cents), 0), details.invoice.currency)} />
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h2 className="text-xl font-semibold text-zinc-100">Actions</h2>
        <div className="flex flex-wrap gap-2">
          {details.invoice.status === "DRAFT" ? <SimpleForm action={finalizeInvoiceAction} id={details.invoice.id} label="Finaliser" /> : null}
          <SimpleForm action={duplicateInvoiceAction} id={details.invoice.id} label="Dupliquer" />
          {["FINALIZED", "SENT", "OVERDUE"].includes(details.invoice.status) && details.invoice.paid_cents === 0 ? <SimpleForm action={voidInvoiceAction} id={details.invoice.id} label="Rendre nulle" /> : null}
        </div>
        {details.invoice.number && ["FINALIZED", "SENT", "OVERDUE"].includes(details.invoice.status) ? (
          <form action={sendInvoiceAction} className="grid gap-3">
            <input type="hidden" name="id" value={details.invoice.id} />
            <input name="subject" defaultValue={subject} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
            <textarea name="message" defaultValue={message} rows={5} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
            <button disabled={!details.prospect.email} className="w-fit rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-40">{details.invoice.sent_at ? "Renvoyer" : "Envoyer"}</button>
          </form>
        ) : null}
      </section>

      {["FINALIZED", "SENT", "PARTIALLY_PAID", "OVERDUE"].includes(details.invoice.status) ? (
        <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-semibold text-zinc-100">Enregistrer un paiement</h2>
          <form action={recordPaymentAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="invoice_id" value={details.invoice.id} />
            <input name="amount" placeholder="Montant" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
            <input type="date" name="paid_at" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
            <select name="method" defaultValue="bank_transfer" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100">
              {visiblePaymentMethods.map((method) => <option key={method} value={method} className="bg-zinc-900">{formatPaymentMethod(method)}</option>)}
            </select>
            <input name="reference" placeholder="Référence" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
            <input type="hidden" name="status" value="SUCCEEDED" />
            <button className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-zinc-950">Enregistrer</button>
          </form>
        </section>
      ) : null}

      {details.invoice.status !== "DRAFT" ? (
        <section className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-semibold text-zinc-100">Avoir</h2>
          <form action={createCreditNoteFromInvoiceAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="invoice_id" value={details.invoice.id} />
            <input name="reason" placeholder="Motif" defaultValue="Correction de facture" className="min-w-72 rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
            <button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">Créer un avoir</button>
          </form>
        </section>
      ) : null}

      <section className="grid gap-2 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h2 className="text-xl font-semibold text-zinc-100">Paiements</h2>
        {details.payments.map((payment) => <p key={payment.id} className="text-sm text-zinc-300">{formatBillingDate(payment.paid_at)} - {formatBillingMoney(payment.amount_cents, payment.currency)} - {formatPaymentMethod(payment.method)} - {payment.reference ?? "-"}</p>)}
        {!details.payments.length ? <p className="text-sm text-zinc-400">Aucun paiement.</p> : null}
      </section>

      <section className="grid gap-2 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h2 className="text-xl font-semibold text-zinc-100">Journal</h2>
        {events.map((event) => <p key={event.id} className="text-sm text-zinc-300">{formatBillingDateTime(event.created_at)} - {event.event_type}{event.metadata?.smtp_message_id ? ` - SMTP ${String(event.metadata.smtp_message_id)}` : ""}{event.metadata?.error ? ` - ${String(event.metadata.error)}` : ""}</p>)}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1 break-words text-sm text-zinc-100">{value}</p></div>;
}

function SimpleForm({ action, id, label }: { action: (formData: FormData) => void | Promise<void>; id: number; label: string }) {
  return <form action={action}><input type="hidden" name="id" value={id} /><button className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100">{label}</button></form>;
}
