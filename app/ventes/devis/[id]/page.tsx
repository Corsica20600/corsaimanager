import Link from "next/link";
import { notFound } from "next/navigation";
import {
  acceptQuoteManuallyAction,
  cancelQuoteAction,
  createInvoiceFromQuoteAction,
  deleteQuoteDraftAction,
  duplicateQuoteAction,
  sendQuoteAction,
} from "@/app/ventes/actions";
import { QuoteStatusBadge } from "@/components/billing/QuoteStatusBadge";
import { getBillingEventsForEntity, getQuoteDetails, syncQuoteExpiration } from "@/lib/billing/repository";
import { formatBillingDate, formatBillingDateTime, formatBillingMoney } from "@/lib/billing/format";
import { isQuoteEditable } from "@/lib/billing/quote-status";
import { validateProspectForQuote } from "@/lib/billing/quote-snapshots";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuoteDetailPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id)) notFound();
  await syncQuoteExpiration(id);
  const [details, events] = await Promise.all([getQuoteDetails(id), getBillingEventsForEntity("quote", String(id), 12)]);
  if (!details) notFound();

  const canSend = ["DRAFT", "SENT", "VIEWED"].includes(details.quote.status) && Boolean(details.prospect.email);
  const missingClientFields = validateProspectForQuote(details.prospect);
  const subject = `Devis ${details.quote.number ?? `#${details.quote.id}`} - CorsaiManager`;
  const message = `Bonjour,\n\nVous trouverez ci-joint votre devis CorsaiManager d'un montant de ${formatBillingMoney(details.quote.total_cents, details.quote.currency)} TTC.\n\nVous pouvez le consulter, l'accepter ou le refuser depuis le lien sécurisé inclus dans cet email.\n\nBien cordialement,\nCorsaiManager`;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/ventes/devis" className="text-sm text-cyan-200 hover:text-cyan-100">Retour aux devis</Link>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-100">{details.quote.number ?? `Brouillon #${details.quote.id}`}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <QuoteStatusBadge status={details.quote.status} />
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
              {formatBillingMoney(details.quote.total_cents, details.quote.currency)} TTC
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/api/billing/quotes/${details.quote.id}/pdf`} className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100">
            Prévisualiser PDF
          </Link>
          {isQuoteEditable(details.quote.status) && !details.quote.number ? (
            <Link href={`/ventes/devis/${details.quote.id}/modifier`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-100">
              Modifier
            </Link>
          ) : null}
        </div>
      </div>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-4">
        <Info label="Client" value={details.prospect.company_name} />
        <Info label="Email" value={details.prospect.email ?? "Email manquant"} warning={!details.prospect.email} />
        <Info label="Créé" value={formatBillingDateTime(details.quote.created_at)} />
        <Info label="Expiration" value={formatBillingDate(details.quote.expires_at)} />
        <Info label="Émis" value={formatBillingDateTime(details.quote.issued_at)} />
        <Info label="Envoyé" value={formatBillingDateTime(details.quote.sent_at)} />
        <Info label="Accepté" value={formatBillingDateTime(details.quote.accepted_at)} />
        <Info label="Refusé" value={formatBillingDateTime(details.quote.rejected_at)} />
      </section>

      {missingClientFields.length ? (
        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Coordonnées client à compléter avant un devis propre : {missingClientFields.join(", ")}.
        </section>
      ) : null}

      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>
              {["Description", "Qté", "Unité", "PU HT", "Remise", "TVA", "Total TTC"].map((head) => (
                <th key={head} className="px-4 py-3 font-medium">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {details.lines.map((line) => (
              <tr key={line.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-4 py-3">{line.description}</td>
                <td className="px-4 py-3">{line.quantity_milli / 1000}</td>
                <td className="px-4 py-3">{line.unit}</td>
                <td className="px-4 py-3">{formatBillingMoney(line.unit_price_cents, details.quote.currency)}</td>
                <td className="px-4 py-3">{line.discount_basis_points / 100}%</td>
                <td className="px-4 py-3">{line.vat_rate_basis_points / 100}%</td>
                <td className="px-4 py-3 font-medium">{formatBillingMoney(line.total_cents, details.quote.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-[1fr_280px]">
        <div className="grid gap-2 text-sm text-zinc-300">
          <div>Sous-total HT : {formatBillingMoney(details.quote.subtotal_cents, details.quote.currency)}</div>
          <div>Remise : {formatBillingMoney(details.quote.discount_cents, details.quote.currency)}</div>
          <div>TVA : {formatBillingMoney(details.quote.tax_cents, details.quote.currency)}</div>
          {details.quote.notes ? <p className="mt-3 text-zinc-400">Notes : {details.quote.notes}</p> : null}
          {details.quote.terms ? <p className="text-zinc-400">Conditions : {details.quote.terms}</p> : null}
        </div>
        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-sm text-zinc-300">Total TTC</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-100">{formatBillingMoney(details.quote.total_cents, details.quote.currency)}</p>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Envoyer le devis</h2>
          <p className="mt-1 text-sm text-zinc-400">L&apos;envoi attribue le numéro si nécessaire, génère le PDF, crée le lien public sécurisé et envoie via SMTP.</p>
        </div>
        {!details.prospect.email ? (
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
            Ajoutez un email au prospect CRM avant l&apos;envoi.
          </div>
        ) : null}
        <form action={sendQuoteAction} className="grid gap-3">
          <input type="hidden" name="id" value={details.quote.id} />
          <label className="grid gap-2 text-sm text-zinc-300">
            Objet
            <input name="subject" defaultValue={subject} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-zinc-100" />
          </label>
          <label className="grid gap-2 text-sm text-zinc-300">
            Message
            <textarea name="message" defaultValue={message} rows={7} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-zinc-100" />
          </label>
          <button disabled={!canSend} className="w-fit rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40">
            {details.quote.sent_at ? "Renvoyer le devis" : "Envoyer le devis"}
          </button>
        </form>
      </section>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h2 className="text-xl font-semibold text-zinc-100">Journal</h2>
        <div className="grid gap-2 text-sm">
          {events.map((event) => (
            <div key={event.id} className="rounded-xl border border-white/10 bg-zinc-950/40 p-3 text-zinc-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-zinc-100">{event.event_type}</span>
                <span className="text-xs text-zinc-500">{formatBillingDateTime(event.created_at)}</span>
              </div>
              {event.metadata?.smtp_message_id ? <p className="mt-1 text-xs text-emerald-200">SMTP messageId : {String(event.metadata.smtp_message_id)}</p> : null}
              {event.metadata?.error ? <p className="mt-1 text-xs text-rose-200">Erreur : {String(event.metadata.error)}</p> : null}
            </div>
          ))}
          {!events.length ? <p className="text-zinc-400">Aucun événement enregistré pour ce devis.</p> : null}
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <form action={duplicateQuoteAction}>
          <input type="hidden" name="id" value={details.quote.id} />
          <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-100">Dupliquer en brouillon</button>
        </form>
        {details.quote.status === "ACCEPTED" ? (
          <form action={createInvoiceFromQuoteAction}>
            <input type="hidden" name="quote_id" value={details.quote.id} />
            <button className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-zinc-950">Créer la facture</button>
          </form>
        ) : null}
        {["DRAFT", "SENT", "VIEWED"].includes(details.quote.status) ? (
          <form action={acceptQuoteManuallyAction}>
            <input type="hidden" name="id" value={details.quote.id} />
            <button className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-zinc-950">Marquer comme accepté</button>
          </form>
        ) : null}
        {isQuoteEditable(details.quote.status) && !details.quote.number ? (
          <form action={deleteQuoteDraftAction}>
            <input type="hidden" name="id" value={details.quote.id} />
            <button className="rounded-full border border-rose-300/30 px-4 py-2 text-sm text-rose-100">Supprimer le brouillon</button>
          </form>
        ) : null}
        {["DRAFT", "SENT", "VIEWED"].includes(details.quote.status) ? (
          <form action={cancelQuoteAction}>
            <input type="hidden" name="id" value={details.quote.id} />
            <button className="rounded-full border border-amber-300/30 px-4 py-2 text-sm text-amber-100">Annuler le devis</button>
          </form>
        ) : null}
      </section>
    </div>
  );
}

function Info({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 break-words text-sm ${warning ? "text-amber-100" : "text-zinc-100"}`}>{value}</p>
    </div>
  );
}
