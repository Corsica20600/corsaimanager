import Link from "next/link";
import { redirect } from "next/navigation";
import { adminLogoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { type LeadStatus, getLeads } from "@/lib/leads-repository";

const statuses: Array<LeadStatus | "all"> = ["all", "new", "contacted", "qualified", "proposal", "closed", "lost"];

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: LeadStatus | "all";
    priority?: "all" | "low" | "medium" | "high" | "hot";
    sort?: "recent" | "score";
  }>;
};

export default async function AdminLeadsPage({ searchParams }: Props) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin");

  const params = await searchParams;
  const q = params.q ?? "";
  const status = params.status ?? "all";
  const priority = params.priority ?? "all";
  const sort = params.sort ?? "recent";
  const leads = await getLeads({ query: q, status, priority, sort });

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Leads</h1>
        <form action={adminLogoutAction}>
          <button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:border-cyan-300/50">
            Déconnexion
          </button>
        </form>
      </div>

      <form className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur md:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Recherche nom / entreprise / email"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 focus:border-cyan-300/60 focus:outline-none"
        >
          {statuses.map((s) => (
            <option key={s} value={s} className="bg-zinc-900">
              {s}
            </option>
          ))}
        </select>
        <select
          name="priority"
          defaultValue={priority}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 focus:border-cyan-300/60 focus:outline-none"
        >
          {["all", "low", "medium", "high", "hot"].map((p) => (
            <option key={p} value={p} className="bg-zinc-900">
              priorité: {p}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 focus:border-cyan-300/60 focus:outline-none"
        >
          <option value="recent" className="bg-zinc-900">Tri: plus récent</option>
          <option value="score" className="bg-zinc-900">Tri: score décroissant</option>
        </select>
        <button className="rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2.5 text-sm font-semibold text-zinc-950">
          Filtrer
        </button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/50">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>
              {["Nom", "Entreprise", "Email", "Téléphone", "Activité", "Besoin", "Statut", "Score", "Priorité", "Date", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-4 py-3">{lead.nom}</td>
                <td className="px-4 py-3">{lead.entreprise}</td>
                <td className="px-4 py-3">{lead.email}</td>
                <td className="px-4 py-3">{lead.telephone ?? "-"}</td>
                <td className="px-4 py-3">{lead.activite}</td>
                <td className="px-4 py-3">{lead.besoin}</td>
                <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                <td className="px-4 py-3"><ScoreBadge score={lead.score} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={lead.priority} /></td>
                <td className="px-4 py-3 text-zinc-400">{new Date(lead.created_at).toLocaleString("fr-FR")}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-zinc-400" colSpan={11}>Aucun lead trouvé.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const styles: Record<LeadStatus, string> = {
    new: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
    contacted: "border-blue-300/30 bg-blue-300/10 text-blue-200",
    qualified: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    proposal: "border-violet-300/30 bg-violet-300/10 text-violet-200",
    closed: "border-teal-300/30 bg-teal-300/10 text-teal-200",
    lost: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  };
  return <span className={`rounded-full border px-2.5 py-1 text-xs ${styles[status]}`}>{status}</span>;
}

function ScoreBadge({ score }: { score: number }) {
  const style =
    score >= 70
      ? "border-rose-300/30 bg-rose-300/10 text-rose-200"
      : score >= 40
        ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
        : "border-zinc-300/20 bg-zinc-300/10 text-zinc-300";
  return <span className={`rounded-full border px-2.5 py-1 text-xs ${style}`}>{score}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: "border-zinc-300/20 bg-zinc-300/10 text-zinc-300",
    medium: "border-blue-300/30 bg-blue-300/10 text-blue-200",
    high: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    hot: "border-rose-300/40 bg-rose-300/15 text-rose-200 shadow-[0_0_16px_rgba(251,113,133,0.35)]",
  };
  const content = priority === "hot" ? "🔥 Lead chaud" : priority;
  return <span className={`rounded-full border px-2.5 py-1 text-xs ${styles[priority] ?? styles.low}`}>{content}</span>;
}
