import Link from "next/link";
import { SalesBackLink } from "@/components/billing/SalesEmptyState";
import { QuoteStatusBadge } from "@/components/billing/QuoteStatusBadge";
import { getQuotes } from "@/lib/billing/repository";
import { formatBillingDate, formatBillingMoney } from "@/lib/billing/format";
import { quoteStatuses, type QuoteSort, type QuoteStatus } from "@/lib/billing/types";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QuotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = value(params.q);
  const status = normalizeStatus(value(params.status));
  const sort = normalizeSort(value(params.sort));
  const page = Number.parseInt(value(params.page) ?? "1", 10);
  const quotes = await getQuotes({ query, status, sort, page, pageSize: 20 });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SalesBackLink />
        <Link href="/ventes/devis/nouveau" className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-cyan-200">
          Nouveau devis
        </Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Devis</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Pipeline devis</h1>
          </div>
          <form className="flex flex-wrap gap-2">
            <input name="q" defaultValue={query ?? ""} placeholder="Rechercher client, numéro, email" className="min-w-64 rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100" />
            <select name="status" defaultValue={status ?? "all"} className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100">
              <option value="all" className="bg-zinc-900">Tous statuts</option>
              {quoteStatuses.map((item) => <option key={item} value={item} className="bg-zinc-900">{item}</option>)}
            </select>
            <select name="sort" defaultValue={sort} className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100">
              <option value="created_desc" className="bg-zinc-900">Plus récents</option>
              <option value="created_asc" className="bg-zinc-900">Plus anciens</option>
              <option value="expires_asc" className="bg-zinc-900">Expiration proche</option>
              <option value="amount_desc" className="bg-zinc-900">Montant décroissant</option>
              <option value="amount_asc" className="bg-zinc-900">Montant croissant</option>
            </select>
            <button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">Filtrer</button>
          </form>
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>
              {["Numéro", "Client", "Statut", "HT", "TTC", "Créé", "Expiration", "Action"].map((head) => (
                <th key={head} className="px-4 py-3 font-medium">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotes.items.map((quote) => (
              <tr key={quote.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-4 py-3">{quote.number ?? `Brouillon #${quote.id}`}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-100">{quote.company_name}</div>
                  <div className="text-xs text-zinc-500">{quote.email ?? "Email manquant"}</div>
                </td>
                <td className="px-4 py-3"><QuoteStatusBadge status={quote.status} /></td>
                <td className="px-4 py-3">{formatBillingMoney(quote.subtotal_cents, quote.currency)}</td>
                <td className="px-4 py-3 font-medium">{formatBillingMoney(quote.total_cents, quote.currency)}</td>
                <td className="px-4 py-3 text-zinc-400">{formatBillingDate(quote.created_at)}</td>
                <td className="px-4 py-3 text-zinc-400">{formatBillingDate(quote.expires_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/ventes/devis/${quote.id}`} className="rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs text-cyan-100">
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
            {!quotes.items.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                  Aucun devis pour ces filtres.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
        <span>{quotes.total} devis - page {quotes.page} / {quotes.totalPages}</span>
        <div className="flex gap-2">
          <PageLink disabled={quotes.page <= 1} page={quotes.page - 1} params={params}>Précédent</PageLink>
          <PageLink disabled={quotes.page >= quotes.totalPages} page={quotes.page + 1} params={params}>Suivant</PageLink>
        </div>
      </div>
    </div>
  );
}

function PageLink({ page, params, disabled, children }: { page: number; params: Record<string, string | string[] | undefined>; disabled: boolean; children: string }) {
  const search = new URLSearchParams();
  for (const [key, item] of Object.entries(params)) {
    const current = value(item);
    if (current && key !== "page") search.set(key, current);
  }
  search.set("page", String(page));
  if (disabled) return <span className="rounded-full border border-white/10 px-4 py-2 text-zinc-600">{children}</span>;
  return <Link href={`/ventes/devis?${search.toString()}`} className="rounded-full border border-cyan-300/30 px-4 py-2 text-cyan-100">{children}</Link>;
}

function value(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}

function normalizeStatus(status?: string): QuoteStatus | "all" | undefined {
  if (!status || status === "all") return "all";
  return quoteStatuses.includes(status as QuoteStatus) ? (status as QuoteStatus) : "all";
}

function normalizeSort(sort?: string): QuoteSort {
  const allowed: QuoteSort[] = ["created_desc", "created_asc", "expires_asc", "expires_desc", "amount_desc", "amount_asc"];
  return allowed.includes(sort as QuoteSort) ? (sort as QuoteSort) : "created_desc";
}
