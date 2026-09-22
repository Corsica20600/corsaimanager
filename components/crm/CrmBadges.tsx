import type { FollowUpStatus, ProspectStatus } from "@/lib/crm/types";

export function ProspectStatusBadge({ status }: { status: ProspectStatus | string }) {
  const styles: Record<string, string> = {
    nouveau: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
    a_enrichir: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    "à contacter": "border-blue-300/30 bg-blue-300/10 text-blue-200",
    contacté: "border-indigo-300/30 bg-indigo-300/10 text-indigo-200",
    "relance prévue": "border-amber-300/30 bg-amber-300/10 text-amber-200",
    "Relance 1 prévue": "border-amber-300/30 bg-amber-300/10 text-amber-200",
    "Relance 2 prévue": "border-amber-300/30 bg-amber-300/10 text-amber-200",
    "Email prévu": "border-blue-300/30 bg-blue-300/10 text-blue-200",
    "À requalifier": "border-violet-300/30 bg-violet-300/10 text-violet-100",
    "À enrichir": "border-amber-300/30 bg-amber-300/10 text-amber-200",
    "À qualifier": "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
    "Qualifié": "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    "Contacté": "border-indigo-300/30 bg-indigo-300/10 text-indigo-200",
    "Répondu": "border-teal-300/30 bg-teal-300/10 text-teal-200",
    "Dormant": "border-zinc-300/20 bg-zinc-300/10 text-zinc-300",
    "Bloqué": "border-rose-300/30 bg-rose-300/10 text-rose-200",
    "Archivé": "border-zinc-300/20 bg-zinc-300/10 text-zinc-300",
    "rendez-vous": "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    client: "border-teal-300/30 bg-teal-300/10 text-teal-200",
    perdu: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  };
  const label = status === "a_enrichir" ? "à enrichir" : status;
  return <span className={`inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs leading-5 ${styles[status] ?? styles.nouveau}`}>{label}</span>;
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
