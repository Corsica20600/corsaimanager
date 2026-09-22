import Link from "next/link";
import type { ReactNode } from "react";
import { getOpenClawReviewItems } from "@/lib/crm/repository";
import type { EmailPresenceFilter, OpenClawReviewItem } from "@/lib/crm/types";
import { formatDateTimeParis } from "@/lib/date";

type Props = { searchParams: Promise<{ page?: string; email?: EmailPresenceFilter }> };

/** Normal OpenClaw imports belong in the CRM; this is the exception queue. */
export default async function AgentReviewPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const email = params.email === "with" || params.email === "without" ? params.email : "all";
  const review = await getOpenClawReviewItems({ page: Number.isFinite(page) ? page : 1, pageSize: 20, email });
  return <div className="grid gap-5">
    <div><h2 className="text-2xl font-semibold text-zinc-100">Agent review</h2><p className="mt-2 text-sm text-zinc-400">Cas nécessitant une vérification humaine avant intégration ou poursuite du traitement automatique.</p></div>
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
      <p>{review.total} exception{review.total > 1 ? "s" : ""} à traiter</p>
      <div className="flex flex-wrap gap-2">
        <FilterLink active={email === "all"} href={href(1, "all")}>Toutes</FilterLink>
        <FilterLink active={email === "without"} href={href(1, "without")}>Email manquant</FilterLink>
        <FilterLink active={email === "with"} href={href(1, "with")}>Autres vérifications</FilterLink>
        <PageLink disabled={review.page <= 1} href={href(review.page - 1, email)}>Précédent</PageLink>
        <PageLink disabled={review.page >= review.totalPages} href={href(review.page + 1, email)}>Suivant</PageLink>
      </div>
    </div>
    <section className="grid gap-3">
      {review.items.map((item) => <ExceptionCard key={item.id} item={item} />)}
      {!review.items.length ? <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-zinc-400">Aucune exception OpenClaw active. Les prospects importés restent suivis dans Prospects.</div> : null}
    </section>
  </div>;
}

function ExceptionCard({ item }: { item: OpenClawReviewItem }) {
  const reason = !item.email ? "Email manquant" : "Donnée à enrichir";
  return <article className="rounded-2xl border border-amber-300/20 bg-zinc-900/60 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div>
    <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold text-zinc-100">{item.company_name}</h3><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-xs text-amber-100">{reason}</span></div>
    <p className="mt-2 text-sm text-zinc-400">{item.city ?? "Localisation à confirmer"} · {item.sector ?? "Secteur à confirmer"} · importé le {formatDateTimeParis(item.created_at)}</p>
    <p className="mt-3 text-sm text-zinc-300">{!item.email ? "Ajouter ou vérifier une adresse email fiable avant toute qualification commerciale." : "Vérifier les informations indiquées avant de laisser le pipeline poursuivre."}</p>
  </div><Link href={`/crm/${item.id}`} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">Ouvrir la fiche</Link></div></article>;
}
function FilterLink({ active, href: target, children }: { active: boolean; href: string; children: ReactNode }) {
  return <Link href={target} className={`rounded-full border px-3 py-1.5 ${active ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/5 text-zinc-300"}`}>{children}</Link>;
}
function PageLink({ disabled, href: target, children }: { disabled: boolean; href: string; children: ReactNode }) {
  return disabled ? <span className="rounded-full border border-white/10 px-3 py-1.5 text-zinc-600">{children}</span> : <FilterLink active={false} href={target}>{children}</FilterLink>;
}
function href(page: number, email: EmailPresenceFilter) {
  const query = new URLSearchParams(); if (page > 1) query.set("page", String(page)); if (email !== "all") query.set("email", email);
  return query.size ? `/crm/agent-review?${query}` : "/crm/agent-review";
}
