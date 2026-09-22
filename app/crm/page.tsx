import Link from "next/link";
import type { ReactNode } from "react";
import { ProspectStatusBadge, ScoreBadge } from "@/components/crm/CrmBadges";
import { getProspectFilterOptions, getProspects } from "@/lib/crm/repository";
import { type ProspectStatus, prospectStatuses } from "@/lib/crm/types";
import { formatDateTimeParis } from "@/lib/date";
import { presentEmailReliability, presentProspectStatus } from "@/lib/crm/historical-classification";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: ProspectStatus | "all";
    region?: string;
    department?: string;
    city?: string;
    sector?: string;
    source?: string;
    emailState?: "UNKNOWN" | "INVALID" | "BOUNCED" | "MISSING" | "all";
    page?: string;
  }>;
};

export default async function CrmProspectsPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params.page ?? "1", 10);
  const [prospectsPage, filterOptions] = await Promise.all([
    getProspects({
      query: params.q ?? "",
      status: params.status ?? "all",
      region: params.region ?? "",
      department: params.department ?? "",
      city: params.city ?? "",
      sector: params.sector ?? "",
      source: params.source ?? "",
      emailState: params.emailState ?? "all",
      page: Number.isFinite(currentPage) ? currentPage : 1,
      pageSize: 25,
    }),
    getProspectFilterOptions(),
  ]);
  const prospects = prospectsPage.items;

  return (
    <div className="grid gap-5">
      <form className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur md:grid-cols-2 xl:grid-cols-4">
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
            <option key={status} value={status} className="bg-zinc-900">{statusLabel(status)}</option>
          ))}
        </select>
        <select name="source" defaultValue={params.source ?? ""} className="rounded-xl border border-white/15 bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 focus:border-cyan-300/60 focus:outline-none">
          <option value="" className="bg-zinc-900">Toutes sources</option>
          {filterOptions.sources.map((source) => <option key={source} value={source} className="bg-zinc-900">{source}</option>)}
        </select>
        <select name="emailState" defaultValue={params.emailState ?? "all"} className="rounded-xl border border-white/15 bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 focus:border-cyan-300/60 focus:outline-none">
          <option value="all" className="bg-zinc-900">Tous emails</option>
          <option value="MISSING" className="bg-zinc-900">Email manquant</option>
          <option value="INVALID" className="bg-zinc-900">Email invalide</option>
          <option value="BOUNCED" className="bg-zinc-900">Email bounced</option>
          <option value="UNKNOWN" className="bg-zinc-900">Email à vérifier</option>
        </select>
        <input
          name="region"
          defaultValue={params.region ?? ""}
          list="crm-regions"
          placeholder="Région"
          className="rounded-xl border border-white/15 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
        />
        <datalist id="crm-regions">
          {filterOptions.regions.map((region) => <option key={region} value={region} />)}
        </datalist>
        <input
          name="department"
          defaultValue={params.department ?? ""}
          list="crm-departments"
          placeholder="Département"
          className="rounded-xl border border-white/15 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
        />
        <datalist id="crm-departments">
          {filterOptions.departments.map((department) => <option key={department} value={department} />)}
        </datalist>
        <input
          name="city"
          defaultValue={params.city ?? ""}
          list="crm-cities"
          placeholder="Ville"
          className="rounded-xl border border-white/15 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
        />
        <datalist id="crm-cities">
          {filterOptions.cities.map((city) => <option key={city} value={city} />)}
        </datalist>
        <input
          name="sector"
          defaultValue={params.sector ?? ""}
          list="crm-sectors"
          placeholder="Secteur"
          className="rounded-xl border border-white/15 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
        />
        <datalist id="crm-sectors">
          {filterOptions.sectors.map((sector) => <option key={sector} value={sector} />)}
        </datalist>
        <input type="hidden" name="page" value="1" />
        <button className="rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2.5 text-sm font-semibold text-zinc-950">
          Filtrer
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
        <p>
          {prospectsPage.total} prospect{prospectsPage.total > 1 ? "s" : ""} - page {prospectsPage.page} / {prospectsPage.totalPages}
        </p>
        <div className="flex gap-2">
          <PaginationLink disabled={prospectsPage.page <= 1} href={buildPageHref(params, prospectsPage.page - 1)}>
            Précédent
          </PaginationLink>
          <PaginationLink disabled={prospectsPage.page >= prospectsPage.totalPages} href={buildPageHref(params, prospectsPage.page + 1)}>
            Suivant
          </PaginationLink>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50">
        <div className="overflow-x-auto">
        <table className="min-w-[1100px] table-fixed text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>
              <th className="w-[210px] px-3 py-3 font-medium">Entreprise</th>
              <th className="w-[110px] px-3 py-3 font-medium">Contact</th>
              <th className="w-[130px] px-3 py-3 font-medium">Localisation</th>
              <th className="w-[160px] px-3 py-3 font-medium">Secteur</th>
              <th className="w-[130px] px-3 py-3 font-medium">Statut</th>
              <th className="w-[70px] px-3 py-3 font-medium">Score</th>
              <th className="w-[125px] px-3 py-3 font-medium">Prochaine action</th>
              <th className="w-[80px] px-3 py-3 font-medium">Source</th>
              <th className="sticky right-0 z-20 w-[85px] border-l border-white/10 bg-zinc-900/50 px-3 py-3 font-medium">Ouvrir</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((prospect) => (
              <tr key={prospect.id} className="border-b border-white/5 align-top text-zinc-200">
                {(() => {
                  const presentation = presentProspectStatus({ status: prospect.status, email: prospect.email, nextFollowUpAt: prospect.next_follow_up_at, nextActionAt: prospect.next_action_at, followUpCount: prospect.follow_up_count, commercialState: prospect.commercial_state, rehabilitationClassification: prospect.rehabilitation_classification, doNotContact: prospect.do_not_contact, bounced: Boolean(prospect.bounced_at), replied: Boolean(prospect.replied_at) });
                  const emailState = presentEmailReliability({ email: prospect.email, bounced: Boolean(prospect.bounced_at) });
                  return <>
                <td className="px-3 py-3">
                  <div className="font-medium text-zinc-100">{prospect.company_name}</div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500"><span>{prospect.email ?? prospect.website ?? "Coordonnées à compléter"}</span><span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px]">{emailState}</span></div>
                </td>
                <td className="px-3 py-3">{prospect.contact_name ?? "-"}</td>
                <td className="px-3 py-3">
                  <div>{prospect.city ?? "-"}</div>
                  <div className="text-xs text-zinc-500">{[prospect.postal_code, prospect.department, prospect.region].filter(Boolean).join(" - ") || "-"}</div>
                </td>
                <td className="px-3 py-3">{prospect.sector ?? "-"}</td>
                <td className="px-3 py-3"><ProspectStatusBadge status={presentation.label} /></td>
                <td className="px-3 py-3"><ScoreBadge score={prospect.score} /></td>
                <td className="px-3 py-3 text-zinc-400">
                  {presentation.nextActionAt ? formatDateTimeParis(presentation.nextActionAt) : "-"}
                </td>
                <td className="px-3 py-3 text-zinc-400">{prospect.source ?? "-"}</td>
                <td className="sticky right-0 z-10 border-l border-white/10 bg-zinc-900/50 px-3 py-3">
                  <Link href={`/crm/${prospect.id}`} className="inline-flex whitespace-nowrap rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                    Ouvrir
                  </Link>
                </td>
                  </>;
                })()}
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
        </div>
      </section>
    </div>
  );
}

function PaginationLink({ disabled, href, children }: { disabled: boolean; href: string; children: ReactNode }) {
  if (disabled) {
    return <span className="rounded-full border border-white/10 px-3 py-1.5 text-zinc-600">{children}</span>;
  }

  return (
    <Link href={href} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-cyan-200">
      {children}
    </Link>
  );
}

function buildPageHref(params: Awaited<Props["searchParams"]>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key !== "page" && value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/crm?${query}` : "/crm";
}

function statusLabel(status: ProspectStatus) {
  return ({ nouveau: "À qualifier", a_enrichir: "À enrichir", "à contacter": "Email prévu", contacté: "Contacté", "relance prévue": "Relance prévue", "rendez-vous": "Qualifié", client: "Client", perdu: "Bloqué" } as const)[status];
}
