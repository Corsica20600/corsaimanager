import Link from "next/link";
import { SalesBackLink } from "@/components/billing/SalesEmptyState";
import { formatBillingDate, formatBillingMoney } from "@/lib/billing/format";
import { getCreditNotes } from "@/lib/billing/repository";

export default async function CreditNotesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const notes = await getCreditNotes({ query: value(params.q), page: Number.parseInt(value(params.page) ?? "1", 10), pageSize: 30 });
  return (
    <div className="grid gap-5">
      <SalesBackLink />
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Avoirs</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Corrections de factures</h1>
        <form className="mt-5 flex gap-2"><input name="q" defaultValue={value(params.q) ?? ""} placeholder="Avoir, facture, client" className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100" /><button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">Filtrer</button></form>
      </section>
      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300"><tr>{["Numéro", "Facture", "Client", "Motif", "Total", "Statut", "Date", "Action"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr></thead>
          <tbody>
            {notes.items.map((note) => <tr key={note.id} className="border-b border-white/5 text-zinc-200"><td className="px-4 py-3">{note.number ?? `Brouillon #${note.id}`}</td><td className="px-4 py-3">{note.invoice_number ?? `#${note.invoice_id}`}</td><td className="px-4 py-3">{note.company_name}</td><td className="px-4 py-3">{note.reason}</td><td className="px-4 py-3 font-medium">{formatBillingMoney(note.total_cents)}</td><td className="px-4 py-3">{note.status}</td><td className="px-4 py-3">{formatBillingDate(note.issued_at ?? note.created_at)}</td><td className="px-4 py-3"><Link href={`/ventes/avoirs/${note.id}`} className="rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs text-cyan-100">Ouvrir</Link></td></tr>)}
            {!notes.items.length ? <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-400">Aucun avoir.</td></tr> : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function value(input: string | string[] | undefined) { return Array.isArray(input) ? input[0] : input; }
