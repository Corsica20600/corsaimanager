import Link from "next/link";
import { ProspectStatusBadge, ScoreBadge } from "@/components/crm/CrmBadges";
import { getProspects } from "@/lib/crm/repository";
import { type ProspectStatus, prospectStatuses } from "@/lib/crm/types";
import { formatDateTimeParis } from "@/lib/date";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: ProspectStatus | "all";
    sector?: string;
  }>;
};

export default async function CrmProspectsPage({ searchParams }: Props) {
  const params = await searchParams;
  const prospects = await getProspects({
    query: params.q ?? "",
    status: params.status ?? "all",
    sector: params.sector ?? "",
  });
  const sectors = [...new Set(prospects.map((prospect) => prospect.sector).filter(Boolean))] as string[];

  return (
    <div className="grid gap-5">
      <form className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur lg:grid-cols-[1fr_180px_180px_auto]">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Rechercher nom, ville, secteur, statut..."
          className="rounded-xl border border-white/15 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={params.status ?? "all"}
          className="rounded-xl border border-white/15 bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 focus:border-cyan-300/60 focus:outline-none"
        >
          <option value="all" className="bg-zinc-900">Tous statuts</option>
          {prospectStatuses.map((status) => (
            <option key={status} value={status} className="bg-zinc-900">{status}</option>
          ))}
        </select>
        <input
          name="sector"
          defaultValue={params.sector ?? ""}
          list="crm-sectors"
          placeholder="Secteur"
          className="rounded-xl border border-white/15 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
        />
        <datalist id="crm-sectors">
          {sectors.map((sector) => <option key={sector} value={sector} />)}
        </datalist>
        <button className="rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2.5 text-sm font-semibold text-zinc-950">
          Filtrer
        </button>
      </form>

      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/50">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>
              {["Entreprise", "Contact", "Ville", "Secteur", "Statut", "Score", "Prochaine relance", "Source", ""].map((head) => (
                <th key={head} className="px-4 py-3 font-medium">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prospects.map((prospect) => (
              <tr key={prospect.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-100">{prospect.company_name}</div>
                  <div className="text-xs text-zinc-500">{prospect.email ?? prospect.website ?? "Coordonnées à compléter"}</div>
                </td>
                <td className="px-4 py-3">{prospect.contact_name ?? "-"}</td>
                <td className="px-4 py-3">{prospect.city ?? "-"}</td>
                <td className="px-4 py-3">{prospect.sector ?? "-"}</td>
                <td className="px-4 py-3"><ProspectStatusBadge status={prospect.status} /></td>
                <td className="px-4 py-3"><ScoreBadge score={prospect.score} /></td>
                <td className="px-4 py-3 text-zinc-400">
                  {prospect.next_follow_up_at ? formatDateTimeParis(prospect.next_follow_up_at) : "-"}
                </td>
                <td className="px-4 py-3 text-zinc-400">{prospect.source ?? "-"}</td>
                <td className="px-4 py-3">
                  <Link href={`/crm/${prospect.id}`} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
            {!prospects.length ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-zinc-400">
                  Aucun prospect pour le moment. Ajoutez un prospect ou importez une liste depuis Google Sheets.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

