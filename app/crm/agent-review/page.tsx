import Link from "next/link";
import type { ReactNode } from "react";
import {
  rejectOpenClawActionAction,
  rejectOpenClawDraftAction,
  sendValidatedOpenClawEmailAction,
  updateOpenClawDraftAction,
  validateOpenClawActionAction,
  validateOpenClawDraftAction,
} from "@/app/crm/actions";
import { ProspectStatusBadge, ScoreBadge } from "@/components/crm/CrmBadges";
import { getOpenClawReviewItems } from "@/lib/crm/repository";
import { formatDateTimeParis } from "@/lib/date";

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function AgentReviewPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params.page ?? "1", 10);
  const reviewPage = await getOpenClawReviewItems({
    page: Number.isFinite(currentPage) ? currentPage : 1,
    pageSize: 10,
  });
  const items = reviewPage.items;

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Revue OpenClaw</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Prospects détectés par agent externe. Rien n&apos;est envoyé automatiquement : validez puis déclenchez l&apos;email manuellement.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
        <p>
          {reviewPage.total} prospect{reviewPage.total > 1 ? "s" : ""} OpenClaw - page {reviewPage.page} / {reviewPage.totalPages}
        </p>
        <div className="flex gap-2">
          <PaginationLink disabled={reviewPage.page <= 1} href={buildAgentReviewPageHref(reviewPage.page - 1)}>
            Précédent
          </PaginationLink>
          <PaginationLink disabled={reviewPage.page >= reviewPage.totalPages} href={buildAgentReviewPageHref(reviewPage.page + 1)}>
            Suivant
          </PaginationLink>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-zinc-100">{item.company_name}</h3>
                  <ProspectStatusBadge status={item.status} />
                  <ScoreBadge score={item.ai_score ?? item.score ?? 0} />
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                    Prospect: {formatReviewStatus(item.action_status)}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                    Brouillon: {formatReviewStatus(item.draft_status)}
                  </span>
                  {item.action_sent_at || item.draft_sent_at ? (
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-200">
                      Envoyé le {formatDateTimeParis(item.action_sent_at ?? item.draft_sent_at ?? "")}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {item.region ?? "Région non renseignée"} - {item.department ?? "Département non renseigné"} - {item.city ?? "Ville non renseignée"} - {item.sector ?? "Secteur non renseigné"} - importé le {formatDateTimeParis(item.created_at)}
                </p>
              </div>
              <Link href={`/crm/${item.id}`} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
                Modifier
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h4 className="font-semibold text-zinc-100">Résumé audit IA</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                  {item.latest_audit_summary ?? item.audit_summary ?? item.notes ?? "Aucun résumé fourni par OpenClaw."}
                </p>
                {item.latest_audit_recommendations?.length ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-zinc-100">Recommandations</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                      {item.latest_audit_recommendations.map((recommendation) => (
                        <li key={recommendation}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <dl className="mt-4 grid gap-2 text-sm text-zinc-400">
                  <Info label="Contact" value={item.contact_name ?? "-"} />
                  <Info label="Email" value={item.email ?? "-"} />
                  <Info label="Téléphone" value={item.phone ?? "-"} />
                  <Info label="Site" value={item.website ?? "-"} />
                  <Info label="Région" value={item.region ?? "-"} />
                  <Info label="Département" value={item.department ?? "-"} />
                  <Info label="Ville" value={item.city ?? "-"} />
                </dl>
              </section>

              <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h4 className="font-semibold text-zinc-100">Email proposé</h4>
                {item.draft_id ? (
                  <form action={updateOpenClawDraftAction} className="mt-3 grid gap-3">
                    <input type="hidden" name="prospectId" value={item.id} />
                    <input type="hidden" name="draftId" value={item.draft_id} />
                    <label className="grid gap-1 text-sm text-zinc-400">
                      Sujet
                      <input
                        name="subject"
                        defaultValue={item.draft_subject ?? item.suggested_email_subject ?? ""}
                        disabled={item.draft_status === "envoyé"}
                        className="rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>
                    <label className="grid gap-1 text-sm text-zinc-400">
                      Corps
                      <textarea
                        name="body"
                        defaultValue={item.draft_body ?? item.suggested_email_body ?? ""}
                        disabled={item.draft_status === "envoyé"}
                        rows={10}
                        className="max-h-72 rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm leading-6 text-zinc-200 outline-none focus:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        disabled={item.draft_status === "envoyé"}
                        className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Enregistrer le brouillon
                      </button>
                      <p className="text-xs text-zinc-500">
                        Toute modification repasse le brouillon en attente de validation.
                      </p>
                    </div>
                  </form>
                ) : (
                  <div className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
                    Aucun brouillon email associé à ce prospect.
                  </div>
                )}
              </section>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {item.action_id ? (
                <>
                  <form action={validateOpenClawActionAction}>
                    <input type="hidden" name="prospectId" value={item.id} />
                    <input type="hidden" name="actionId" value={item.action_id} />
                    <button className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-200">
                      Valider l&apos;action
                    </button>
                  </form>
                  <form action={rejectOpenClawActionAction}>
                    <input type="hidden" name="prospectId" value={item.id} />
                    <input type="hidden" name="actionId" value={item.action_id} />
                    <button className="rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-sm font-medium text-rose-200">
                      Rejeter
                    </button>
                  </form>
                  {item.draft_id ? (
                    <>
                      <form action={validateOpenClawDraftAction}>
                        <input type="hidden" name="prospectId" value={item.id} />
                        <input type="hidden" name="draftId" value={item.draft_id} />
                        <button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200">
                          Valider brouillon email
                        </button>
                      </form>
                      <form action={rejectOpenClawDraftAction}>
                        <input type="hidden" name="prospectId" value={item.id} />
                        <input type="hidden" name="draftId" value={item.draft_id} />
                        <button className="rounded-full border border-zinc-300/20 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200">
                          Rejeter brouillon email
                        </button>
                      </form>
                    </>
                  ) : null}
                  <form action={sendValidatedOpenClawEmailAction}>
                    <input type="hidden" name="prospectId" value={item.id} />
                    <input type="hidden" name="actionId" value={item.action_id} />
                    {item.draft_id ? <input type="hidden" name="draftId" value={item.draft_id} /> : null}
                    <button
                      disabled={item.action_status !== "validée" || item.draft_status !== "validé" || !item.email}
                      className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Envoyer le mail
                    </button>
                  </form>
                </>
              ) : (
                <p className="text-sm text-amber-200">Aucune action commerciale associée à ce prospect.</p>
              )}
            </div>
          </article>
        ))}

        {!items.length ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-zinc-400">
            Aucun prospect OpenClaw en attente.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="min-w-24 text-zinc-500">{label}</dt>
      <dd className="text-zinc-200">{value}</dd>
    </div>
  );
}

function formatReviewStatus(status: string | null) {
  if (!status) return "à créer";
  return status.replace("_", " ");
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

function buildAgentReviewPageHref(page: number) {
  return page > 1 ? `/crm/agent-review?page=${page}` : "/crm/agent-review";
}
