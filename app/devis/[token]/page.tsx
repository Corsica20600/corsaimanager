import Link from "next/link";
import { notFound } from "next/navigation";
import { acceptQuoteAction, rejectQuoteAction } from "@/app/ventes/actions";
import { QuoteStatusBadge } from "@/components/billing/QuoteStatusBadge";
import { formatBillingDate, formatBillingMoney } from "@/lib/billing/format";
import { getQuoteByPublicToken, markQuoteViewed, syncQuoteExpiration } from "@/lib/billing/repository";
import { isQuotePubliclyActionable } from "@/lib/billing/quote-status";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PublicQuotePage({ params, searchParams }: Props) {
  const { token } = await params;
  const flags = await searchParams;
  const initialDetails = await getQuoteByPublicToken(token);
  if (!initialDetails) notFound();
  await syncQuoteExpiration(initialDetails.quote.id);
  const details = await getQuoteByPublicToken(token);
  if (!details) notFound();
  await markQuoteViewed(details);
  const refreshed = await getQuoteByPublicToken(token);
  const current = refreshed ?? details;
  const actionable = isQuotePubliclyActionable(current.quote.status);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="grid gap-6">
        <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Devis CorsaiManager</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-zinc-100">{current.quote.number ?? `Devis #${current.quote.id}`}</h1>
              <p className="mt-2 text-zinc-400">{current.prospect.company_name}</p>
            </div>
            <QuoteStatusBadge status={current.quote.status} />
          </div>
          {value(flags.merci) ? <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">Merci, votre acceptation a bien été enregistrée.</p> : null}
          {value(flags.refuse) ? <p className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">Votre refus a bien été enregistré.</p> : null}
        </section>

        <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-4">
          <Info label="Client" value={current.prospect.company_name} />
          <Info label="Date" value={formatBillingDate(current.quote.issued_at ?? current.quote.created_at)} />
          <Info label="Expiration" value={formatBillingDate(current.quote.expires_at)} />
          <Info label="Total TTC" value={formatBillingMoney(current.quote.total_cents, current.quote.currency)} />
        </section>

        <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-zinc-300">
              <tr>
                {["Description", "Qté", "PU HT", "TVA", "Total TTC"].map((head) => (
                  <th key={head} className="px-4 py-3 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.lines.map((line) => (
                <tr key={line.id} className="border-b border-white/5 text-zinc-200">
                  <td className="px-4 py-3">{line.description}</td>
                  <td className="px-4 py-3">{line.quantity_milli / 1000} {line.unit}</td>
                  <td className="px-4 py-3">{formatBillingMoney(line.unit_price_cents, current.quote.currency)}</td>
                  <td className="px-4 py-3">{line.vat_rate_basis_points / 100}%</td>
                  <td className="px-4 py-3 font-medium">{formatBillingMoney(line.total_cents, current.quote.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="flex flex-wrap gap-2">
          <Link href={`/devis/${encodeURIComponent(token)}/pdf`} className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100">
            Télécharger le PDF
          </Link>
        </div>

        {actionable ? (
          <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-2">
            <PublicDecisionForm token={token} action={acceptQuoteAction} title="Accepter le devis" button="Accepter" tone="emerald" />
            <PublicDecisionForm token={token} action={rejectQuoteAction} title="Refuser le devis" button="Refuser" tone="rose" />
          </section>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-sm text-zinc-300">
            Ce devis n&apos;est plus modifiable depuis le lien public.
          </section>
        )}
      </div>
    </main>
  );
}

function PublicDecisionForm({
  token,
  action,
  title,
  button,
  tone,
}: {
  token: string;
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  button: string;
  tone: "emerald" | "rose";
}) {
  const buttonClass = tone === "emerald" ? "bg-emerald-300 text-zinc-950 hover:bg-emerald-200" : "bg-rose-300 text-zinc-950 hover:bg-rose-200";
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="token" value={token} />
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <input name="name" placeholder="Votre nom" required className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <textarea name="comment" placeholder="Commentaire optionnel" rows={4} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <button className={`w-fit rounded-full px-5 py-2.5 text-sm font-semibold ${buttonClass}`}>{button}</button>
    </form>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm text-zinc-100">{value}</p>
    </div>
  );
}

function value(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}
