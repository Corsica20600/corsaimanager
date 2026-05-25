import Link from "next/link";
import { redirect } from "next/navigation";
import { adminLogoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { formatDateTimeParis } from "@/lib/date";
import { type LeadStatus, getLeads } from "@/lib/leads-repository";

const statuses: Array<LeadStatus | "all"> = ["all", "new", "contacted", "qualified", "proposal", "won", "lost"];

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: LeadStatus | "all";
    priority?: "all" | "low" | "medium" | "high" | "hot";
    sort?: "recent" | "score";
    spam?: "all" | "valid" | "spam";
    showSpam?: "0" | "1";
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
  const spam = params.spam ?? "valid";
  const showSpam = params.showSpam === "1";
  const leads = await getLeads({ query: q, status, priority, sort, spamFilter: spam, includeSpam: showSpam });
  const pipelineCols: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];

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

      <form className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur md:grid-cols-[1fr_auto_auto_auto_auto_auto_auto]">
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
        <select
          name="spam"
          defaultValue={spam}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 focus:border-cyan-300/60 focus:outline-none"
        >
          <option value="all" className="bg-zinc-900">Spam: Tous</option>
          <option value="valid" className="bg-zinc-900">Spam: Leads valides</option>
          <option value="spam" className="bg-zinc-900">Spam: Spam détecté</option>
        </select>
        <label className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-zinc-200">
          <input type="hidden" name="showSpam" value="0" />
          <input type="checkbox" name="showSpam" value="1" defaultChecked={showSpam} className="accent-cyan-300" />
          Afficher les spams
        </label>
        <button className="rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2.5 text-sm font-semibold text-zinc-950">
          Filtrer
        </button>
      </form>

      <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/45 p-4 md:grid-cols-6">
        {pipelineCols.map((col) => {
          const count = leads.filter((lead) => lead.status === col || (col === "won" && lead.status === "closed")).length;
          return (
            <div key={col} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-zinc-500">{col}</p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/50">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>
              {["Nom", "Entreprise", "Email", "Téléphone", "Activité", "Besoin", "IA", "Urgence IA", "Action IA", "Spam", "Statut", "Score", "Priorité", "Date", ""].map((h) => (
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
                <td className="px-4 py-3">
                  <div className="max-w-[220px]">
                    <AIQualificationBadge value={lead.ai_qualification} />
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{lead.ai_summary ?? "Analyse IA en attente"}</p>
                  </div>
                </td>
                <td className="px-4 py-3"><AIUrgencyBadge value={lead.ai_urgency} /></td>
                <td className="px-4 py-3">
                  <p className="line-clamp-2 max-w-[200px] text-xs text-zinc-300">{lead.ai_next_action ?? "-"}</p>
                </td>
                <td className="px-4 py-3"><SpamBadge isSpam={lead.is_spam} /></td>
                <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                <td className="px-4 py-3"><ScoreBadge score={lead.score} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={lead.priority} /></td>
                <td className="px-4 py-3 text-zinc-400">{formatDateTimeParis(lead.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-zinc-400" colSpan={15}>Aucun lead trouvé.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpamBadge({ isSpam }: { isSpam: boolean }) {
  if (isSpam) {
    return <span className="rounded-full border border-rose-300/40 bg-rose-300/15 px-2.5 py-1 text-xs text-rose-200">Spam</span>;
  }
  return <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-200">Valide</span>;
}

function AIQualificationBadge({ value }: { value: string | null }) {
  const styles: Record<string, string> = {
    low: "border-zinc-300/20 bg-zinc-300/10 text-zinc-300",
    medium: "border-blue-300/30 bg-blue-300/10 text-blue-200",
    high: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    hot: "border-rose-300/40 bg-rose-300/15 text-rose-200 shadow-[0_0_14px_rgba(251,113,133,0.35)]",
  };
  const v = value ?? "low";
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] ${styles[v] ?? styles.low}`}>IA: {v}</span>;
}

function AIUrgencyBadge({ value }: { value: string | null }) {
  const styles: Record<string, string> = {
    low: "border-zinc-300/20 bg-zinc-300/10 text-zinc-300",
    medium: "border-blue-300/30 bg-blue-300/10 text-blue-200",
    high: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  };
  const v = value ?? "low";
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] ${styles[v] ?? styles.low}`}>{v}</span>;
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const styles: Record<LeadStatus, string> = {
    new: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
    contacted: "border-blue-300/30 bg-blue-300/10 text-blue-200",
    qualified: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    proposal: "border-violet-300/30 bg-violet-300/10 text-violet-200",
    won: "border-teal-300/30 bg-teal-300/10 text-teal-200",
    closed: "border-teal-300/30 bg-teal-300/10 text-teal-200",
    lost: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  };
  const label = status === "closed" ? "won" : status;
  return <span className={`rounded-full border px-2.5 py-1 text-xs ${styles[status]}`}>{label}</span>;
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
