import Link from "next/link";
import { notFound } from "next/navigation";
import {
  archiveProspectAction,
  setProspectStatusAction,
  updateFollowUpStatusAction,
} from "@/app/crm/actions";
import { FollowUpStatusBadge, ProspectStatusBadge } from "@/components/crm/CrmBadges";
import { ProspectForm } from "@/components/crm/ProspectForm";
import { getFollowUpsByProspectId, getProspectById } from "@/lib/crm/repository";
import { followUpStatuses, prospectStatuses } from "@/lib/crm/types";
import { formatDateTimeParis } from "@/lib/date";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProspectDetailPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id)) notFound();

  const [prospect, followUps] = await Promise.all([getProspectById(id), getFollowUpsByProspectId(id)]);
  if (!prospect) notFound();

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/crm" className="text-sm text-cyan-200 hover:text-cyan-100">Retour aux prospects</Link>
          <h2 className="mt-3 text-3xl font-semibold text-zinc-100">{prospect.company_name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <ProspectStatusBadge status={prospect.status} />
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
              Score {prospect.score}/100
            </span>
          </div>
        </div>
        <form action={archiveProspectAction}>
          <input type="hidden" name="id" value={prospect.id} />
          <button className="rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-sm text-rose-200">
            Archiver
          </button>
        </form>
      </div>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-4">
        <Info label="Contact" value={prospect.contact_name ?? "-"} />
        <Info label="Email" value={prospect.email ?? "-"} />
        <Info label="Téléphone" value={prospect.phone ?? "-"} />
        <Info label="Site" value={prospect.website ?? "-"} />
        <Info label="Pays" value={prospect.country ?? "France"} />
        <Info label="Région" value={prospect.region ?? "-"} />
        <Info label="Département" value={prospect.department ?? "-"} />
        <Info label="Ville" value={prospect.city ?? "-"} />
        <Info label="Secteur" value={prospect.sector ?? "-"} />
        <Info label="Dernier contact" value={prospect.last_contacted_at ? formatDateTimeParis(prospect.last_contacted_at) : "-"} />
        <Info label="Prochaine relance" value={prospect.next_follow_up_at ? formatDateTimeParis(prospect.next_follow_up_at) : "-"} />
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h3 className="text-xl font-semibold text-zinc-100">Changer le statut</h3>
        <form action={setProspectStatusAction} className="flex flex-wrap gap-3">
          <input type="hidden" name="id" value={prospect.id} />
          <select
            name="status"
            defaultValue={prospect.status}
            className="rounded-xl border border-white/15 bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 focus:border-cyan-300/60 focus:outline-none"
          >
            {prospectStatuses.map((status) => (
              <option key={status} value={status} className="bg-zinc-900">{status}</option>
            ))}
          </select>
          <button className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-zinc-100 hover:bg-white/15">
            Mettre à jour
          </button>
        </form>
        <p className="text-xs text-zinc-500">Passer en contacté prépare automatiquement une relance à J+3.</p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <div>
          <h3 className="text-xl font-semibold text-zinc-100">Relances préparées</h3>
          <p className="mt-1 text-sm text-zinc-400">Aucun email n&apos;est envoyé automatiquement. Marquez une relance comme envoyée pour préparer la suivante.</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-zinc-300">
              <tr>
                {["Échéance", "Canal", "Template", "Statut", "Notes", "Action"].map((head) => (
                  <th key={head} className="px-4 py-3 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {followUps.map((followUp) => (
                <tr key={followUp.id} className="border-b border-white/5 text-zinc-200">
                  <td className="px-4 py-3">{formatDateTimeParis(followUp.due_date)}</td>
                  <td className="px-4 py-3">{followUp.channel}</td>
                  <td className="px-4 py-3">{followUp.template_key ?? "-"}</td>
                  <td className="px-4 py-3"><FollowUpStatusBadge status={followUp.status} /></td>
                  <td className="px-4 py-3 text-zinc-400">{followUp.notes ?? "-"}</td>
                  <td className="px-4 py-3">
                    <form action={updateFollowUpStatusAction} className="flex gap-2">
                      <input type="hidden" name="id" value={followUp.id} />
                      <input type="hidden" name="prospectId" value={prospect.id} />
                      <select name="status" defaultValue={followUp.status} className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-1.5 text-xs text-zinc-100">
                        {followUpStatuses.map((status) => <option key={status} value={status} className="bg-zinc-900">{status}</option>)}
                      </select>
                      <button className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-zinc-100">OK</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!followUps.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-zinc-400">Aucune relance préparée.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xl font-semibold text-zinc-100">Modifier la fiche</h3>
        <ProspectForm prospect={prospect} />
      </section>
    </div>
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
