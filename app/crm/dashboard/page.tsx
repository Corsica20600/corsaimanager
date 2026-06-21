import Link from "next/link";
import { ProspectStatusBadge } from "@/components/crm/CrmBadges";
import { getCrmDashboard } from "@/lib/crm/repository";
import { formatDateTimeParis } from "@/lib/date";

export default async function CrmDashboardPage() {
  const report = await getCrmDashboard();
  const summary = report.summary;

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Tableau de bord commercial</h2>
        <p className="mt-2 text-sm text-zinc-400">Vue synthétique de la prospection, des relances et des conversions.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total prospects" value={summary.total} />
        <Metric label="Nouveaux prospects" value={summary.nouveaux} />
        <Metric label="Prospects contactés" value={summary.contactes} />
        <Metric label="Relances à faire aujourd'hui" value={summary.relances_aujourdhui} />
        <Metric label="Rendez-vous obtenus" value={summary.rendez_vous} />
        <Metric label="Clients" value={summary.clients} />
        <Metric label="Prospects perdus" value={summary.perdus} />
        <Metric label="Conversion contacté -> RDV" value={Number(summary.conversion_contact_rdv)} suffix="%" />
        <Metric label="Conversion RDV -> client" value={Number(summary.conversion_rdv_client)} suffix="%" />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="Prospects par statut">
          {report.byStatus.length ? report.byStatus.map((item) => (
            <div key={item.status} className="flex items-center justify-between border-b border-white/5 py-3">
              <ProspectStatusBadge status={item.status} />
              <span className="text-sm font-semibold text-zinc-100">{item.count}</span>
            </div>
          )) : <Empty />}
        </Panel>

        <Panel title="Prospects par secteur">
          {report.bySector.length ? report.bySector.map((item) => (
            <div key={item.sector} className="flex items-center justify-between border-b border-white/5 py-3">
              <span className="text-sm text-zinc-300">{item.sector}</span>
              <span className="text-sm font-semibold text-zinc-100">{item.count}</span>
            </div>
          )) : <Empty />}
        </Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="Relances en retard">
          {report.overdueFollowUps.length ? report.overdueFollowUps.map((followUp) => (
            <div key={followUp.id} className="border-b border-white/5 py-3">
              <Link href={`/crm/${followUp.prospect_id}`} className="font-medium text-cyan-200 hover:text-cyan-100">
                {followUp.company_name}
              </Link>
              <p className="mt-1 text-sm text-zinc-400">{followUp.template_key ?? "relance"} - échéance {formatDateTimeParis(followUp.due_date)}</p>
            </div>
          )) : <Empty label="Aucune relance en retard." />}
        </Panel>

        <Panel title="Dernières actions commerciales">
          {report.latestActions.length ? report.latestActions.map((action) => (
            <div key={action.id} className="border-b border-white/5 py-3">
              <div className="flex items-center justify-between gap-3">
                <Link href={`/crm/${action.id}`} className="font-medium text-cyan-200 hover:text-cyan-100">
                  {action.company_name}
                </Link>
                <ProspectStatusBadge status={action.status} />
              </div>
              <p className="mt-1 text-sm text-zinc-500">Mis à jour {formatDateTimeParis(action.updated_at)}</p>
            </div>
          )) : <Empty />}
        </Panel>
      </section>
    </div>
  );
}

function Metric({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-100">{value.toLocaleString("fr-FR")}{suffix}</p>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function Empty({ label = "Aucune donnée pour le moment." }: { label?: string }) {
  return <p className="py-6 text-sm text-zinc-400">{label}</p>;
}

