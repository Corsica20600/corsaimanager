import Link from "next/link";
import type { ReactNode } from "react";
import {
  prepareOpenClawEmailAction,
  rejectOpenClawActionAction,
  rejectOpenClawDraftAction,
  sendValidatedOpenClawEmailAction,
  updateOpenClawDraftAction,
  validateOpenClawActionAction,
  validateOpenClawDraftAction,
} from "@/app/crm/actions";
import { ProspectStatusBadge, ScoreBadge } from "@/components/crm/CrmBadges";
import { getOpenClawReviewItems } from "@/lib/crm/repository";
import type { EmailPresenceFilter, OpenClawReviewItem } from "@/lib/crm/types";
import { formatDateTimeParis } from "@/lib/date";

type Props = {
  searchParams: Promise<{
    page?: string;
    email?: EmailPresenceFilter;
  }>;
};

export default async function AgentReviewPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params.page ?? "1", 10);
  const emailFilter = isEmailPresenceFilter(params.email) ? params.email : "all";
  const reviewPage = await getOpenClawReviewItems({
    page: Number.isFinite(currentPage) ? currentPage : 1,
    pageSize: 10,
    email: emailFilter,
  });
  const items = reviewPage.items;
  const enrichItems = items.filter((item) => isToEnrich(item));
  const readyItems = items.filter((item) => !isToEnrich(item));

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
        <div className="flex flex-wrap gap-2">
          <EmailFilterLink active={emailFilter === "all"} href={buildAgentReviewPageHref(1, "all")}>
            Tous
          </EmailFilterLink>
          <EmailFilterLink active={emailFilter === "with"} href={buildAgentReviewPageHref(1, "with")}>
            Avec email
          </EmailFilterLink>
          <EmailFilterLink active={emailFilter === "without"} href={buildAgentReviewPageHref(1, "without")}>
            Sans email
          </EmailFilterLink>
          <PaginationLink disabled={reviewPage.page <= 1} href={buildAgentReviewPageHref(reviewPage.page - 1, emailFilter)}>
            Précédent
          </PaginationLink>
          <PaginationLink disabled={reviewPage.page >= reviewPage.totalPages} href={buildAgentReviewPageHref(reviewPage.page + 1, emailFilter)}>
            Suivant
          </PaginationLink>
        </div>
      </div>

      <div className="grid gap-4">
        {enrichItems.length ? (
          <ReviewSection title="À enrichir" description="Prospects importés sans email. Ajoutez une adresse avant de générer ou envoyer un mail." items={enrichItems} />
        ) : null}
        {readyItems.length ? (
          <ReviewSection title="Prêts à traiter" description="Prospects avec email, action commerciale ou brouillon à relire." items={readyItems} />
        ) : null}

        {!items.length ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-zinc-400">
            Aucun prospect OpenClaw en attente.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReviewSection({ title, description, items }: { title: string; description: string; items: OpenClawReviewItem[] }) {
  return (
    <section className="grid gap-3">
      <div>
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      {items.map((item) => (
        <OpenClawReviewCard key={item.id} item={item} />
      ))}
    </section>
  );
}

function OpenClawReviewCard({ item }: { item: OpenClawReviewItem }) {
  const actionValidated = item.action_status === "validée" || item.action_status === "envoyée";
  const draftValidated = item.draft_status === "validé" || item.draft_status === "envoyé";
  const alreadySent = item.action_status === "envoyée" || item.draft_status === "envoyé";
  const canPrepare = Boolean(item.email) && (!item.action_id || !item.draft_id);
  const canSend = Boolean(item.email && item.action_id && item.draft_id && actionValidated && draftValidated && !alreadySent);
  const sendBlocker = getSendBlocker(item, actionValidated, draftValidated, alreadySent);

  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
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
            {!item.email ? (
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-xs text-amber-200">
                Email à enrichir
              </span>
            ) : null}
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
            <div className="mt-3 grid gap-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-3 text-sm text-amber-100">
              <p>{item.email ? "Aucun brouillon email associé à ce prospect." : "Aucun brouillon créé tant que l'email est absent."}</p>
              {canPrepare ? (
                <form action={prepareOpenClawEmailAction}>
                  <input type="hidden" name="prospectId" value={item.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100"
                  >
                    Préparer action + brouillon
                  </button>
                </form>
              ) : null}
            </div>
          )}
        </section>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h4 className="font-semibold text-zinc-100">Validation et envoi</h4>
        {item.action_smtp_error || item.draft_smtp_error ? (
          <div className="mt-3 rounded-lg border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
            Erreur SMTP : {item.action_smtp_error ?? item.draft_smtp_error}
          </div>
        ) : null}
        {item.action_smtp_message_id || item.draft_smtp_message_id ? (
          <p className="mt-3 text-xs text-zinc-500">
            Message ID SMTP : {item.action_smtp_message_id ?? item.draft_smtp_message_id}
          </p>
        ) : null}
        <div className="mt-3 grid gap-2 text-sm text-zinc-300 md:grid-cols-3">
          <WorkflowStep done={Boolean(item.email)} label="1. Email prospect" detail={item.email ?? "À ajouter dans Modifier"} />
          <WorkflowStep done={actionValidated} label="2. Action commerciale" detail={item.action_id ? formatReviewStatus(item.action_status) : "À préparer"} />
          <WorkflowStep done={draftValidated} label="3. Brouillon email" detail={item.draft_id ? formatReviewStatus(item.draft_status) : "À préparer"} />
        </div>
        {!item.email ? (
          <p className="mt-3 text-sm text-amber-200">
            Ajoutez d&apos;abord l&apos;email avec le bouton Modifier. Le mail ne peut pas être préparé ni envoyé tant que l&apos;email est vide.
          </p>
        ) : null}
        {canPrepare ? (
          <form action={prepareOpenClawEmailAction} className="mt-3">
            <input type="hidden" name="prospectId" value={item.id} />
            <button
              type="submit"
              className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100"
            >
              Préparer action + brouillon
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {item.action_id ? (
          <>
            <form action={validateOpenClawActionAction}>
              <input type="hidden" name="prospectId" value={item.id} />
              <input type="hidden" name="actionId" value={item.action_id} />
              <button
                type="submit"
                disabled={actionValidated || alreadySent}
                className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-200 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {actionValidated ? "Action validée" : "Valider l'action"}
              </button>
            </form>
            <form action={rejectOpenClawActionAction}>
              <input type="hidden" name="prospectId" value={item.id} />
              <input type="hidden" name="actionId" value={item.action_id} />
              <button
                type="submit"
                disabled={alreadySent}
                className="rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-sm font-medium text-rose-200 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Rejeter
              </button>
            </form>
            {item.draft_id ? (
              <>
                <form action={validateOpenClawDraftAction}>
                  <input type="hidden" name="prospectId" value={item.id} />
                  <input type="hidden" name="draftId" value={item.draft_id} />
                  <button
                    type="submit"
                    disabled={draftValidated || alreadySent}
                    className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {draftValidated ? "Brouillon validé" : "Valider brouillon email"}
                  </button>
                </form>
                <form action={rejectOpenClawDraftAction}>
                  <input type="hidden" name="prospectId" value={item.id} />
                  <input type="hidden" name="draftId" value={item.draft_id} />
                  <button
                    type="submit"
                    disabled={alreadySent}
                    className="rounded-full border border-zinc-300/20 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 disabled:cursor-not-allowed disabled:opacity-45"
                  >
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
                type="submit"
                disabled={!canSend}
                className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {alreadySent ? "Mail envoyé" : "Envoyer le mail"}
              </button>
            </form>
            {!canSend ? <p className="text-xs text-zinc-500">{sendBlocker}</p> : null}
          </>
        ) : (
          <p className="text-sm text-amber-200">
            Aucune action commerciale associée à ce prospect. {item.email ? "Cliquez sur Préparer action + brouillon." : "Ajoutez un email avant de préparer l'envoi."}
          </p>
        )}
      </div>
    </article>
  );
}

function WorkflowStep({ done, label, detail }: { done: boolean; label: string; detail: string | null }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${done ? "border-emerald-300/20 bg-emerald-300/10" : "border-white/10 bg-zinc-950/30"}`}>
      <p className={done ? "text-emerald-200" : "text-zinc-200"}>{label}</p>
      <p className="mt-1 truncate text-xs text-zinc-500">{detail ?? "-"}</p>
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

function getSendBlocker(item: OpenClawReviewItem, actionValidated: boolean, draftValidated: boolean, alreadySent: boolean) {
  if (alreadySent) return "Ce mail a déjà été envoyé.";
  if (!item.email) return "Ajoutez un email au prospect.";
  if (!item.action_id || !item.draft_id) return "Préparez l'action et le brouillon.";
  if (!actionValidated) return "Validez d'abord l'action commerciale.";
  if (!draftValidated) return "Validez ensuite le brouillon email.";
  return "";
}

function isToEnrich(item: OpenClawReviewItem) {
  return item.status === "a_enrichir" || !item.email;
}

function isEmailPresenceFilter(value: string | undefined): value is EmailPresenceFilter {
  return value === "all" || value === "with" || value === "without";
}

function EmailFilterLink({ active, href, children }: { active: boolean; href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 ${
        active ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/5 text-zinc-300"
      }`}
    >
      {children}
    </Link>
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

function buildAgentReviewPageHref(page: number, email: EmailPresenceFilter) {
  const search = new URLSearchParams();
  if (page > 1) search.set("page", String(page));
  if (email !== "all") search.set("email", email);
  const query = search.toString();
  return query ? `/crm/agent-review?${query}` : "/crm/agent-review";
}
