import Link from "next/link";
import { notFound } from "next/navigation";
import { finalizeCreditNoteAction } from "@/app/ventes/actions";
import { formatBillingDateTime, formatBillingMoney } from "@/lib/billing/format";
import { getCreditNoteDetails } from "@/lib/billing/repository";

export default async function CreditNoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id)) notFound();
  const details = await getCreditNoteDetails(id);
  if (!details) notFound();
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><Link href="/ventes/avoirs" className="text-sm text-cyan-200 hover:text-cyan-100">Retour aux avoirs</Link><h1 className="mt-3 text-3xl font-semibold text-zinc-100">{details.creditNote.number ?? `Brouillon #${details.creditNote.id}`}</h1><p className="mt-2 text-zinc-400">Facture {details.invoice.number ?? `#${details.invoice.id}`} - {details.prospect.company_name}</p></div>
        <div className="flex gap-2"><Link href={`/api/billing/credit-notes/${details.creditNote.id}/pdf`} className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100">PDF</Link>{details.creditNote.status === "DRAFT" ? <form action={finalizeCreditNoteAction}><input type="hidden" name="id" value={details.creditNote.id} /><button className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-950">Émettre l&apos;avoir</button></form> : null}</div>
      </div>
      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-4">
        <Info label="Statut" value={details.creditNote.status} />
        <Info label="Motif" value={details.creditNote.reason} />
        <Info label="Total" value={formatBillingMoney(details.creditNote.total_cents, details.invoice.currency)} />
        <Info label="Émis" value={formatBillingDateTime(details.creditNote.issued_at)} />
      </section>
      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm"><thead className="border-b border-white/10 text-zinc-300"><tr>{["Description", "Qté", "PU HT", "TVA", "Total"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr></thead><tbody>{details.lines.map((line) => <tr key={line.id} className="border-b border-white/5 text-zinc-200"><td className="px-4 py-3">{line.description}</td><td className="px-4 py-3">{line.quantity_milli / 1000} {line.unit}</td><td className="px-4 py-3">{formatBillingMoney(line.unit_price_cents, details.invoice.currency)}</td><td className="px-4 py-3">{line.vat_rate_basis_points / 100}%</td><td className="px-4 py-3 font-medium">{formatBillingMoney(line.total_cents, details.invoice.currency)}</td></tr>)}</tbody></table>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1 break-words text-sm text-zinc-100">{value}</p></div>;
}
