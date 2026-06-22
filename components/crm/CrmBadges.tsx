import type { FollowUpStatus, ProspectStatus } from "@/lib/crm/types";

export function ProspectStatusBadge({ status }: { status: ProspectStatus | string }) {
  const styles: Record<string, string> = {
    nouveau: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
    a_enrichir: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    "à contacter": "border-blue-300/30 bg-blue-300/10 text-blue-200",
    contacté: "border-indigo-300/30 bg-indigo-300/10 text-indigo-200",
    "relance prévue": "border-amber-300/30 bg-amber-300/10 text-amber-200",
    "rendez-vous": "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    client: "border-teal-300/30 bg-teal-300/10 text-teal-200",
    perdu: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  };
  const label = status === "a_enrichir" ? "à enrichir" : status;
  return <span className={`rounded-full border px-2.5 py-1 text-xs ${styles[status] ?? styles.nouveau}`}>{label}</span>;
}

export function FollowUpStatusBadge({ status }: { status: FollowUpStatus | string }) {
  const styles: Record<string, string> = {
    prévue: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    envoyée: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    annulée: "border-zinc-300/20 bg-zinc-300/10 text-zinc-300",
    échouée: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  };
  return <span className={`rounded-full border px-2.5 py-1 text-xs ${styles[status] ?? styles.prévue}`}>{status}</span>;
}

export function ScoreBadge({ score }: { score: number }) {
  const style =
    score >= 75
      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
      : score >= 45
        ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
        : "border-zinc-300/20 bg-zinc-300/10 text-zinc-300";
  return <span className={`rounded-full border px-2.5 py-1 text-xs ${style}`}>{score}/100</span>;
}
