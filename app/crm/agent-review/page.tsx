import Link from "next/link";
import {
  rejectOpenClawActionAction,
  sendValidatedOpenClawEmailAction,
  validateOpenClawActionAction,
} from "@/app/crm/actions";
import { ProspectStatusBadge, ScoreBadge } from "@/components/crm/CrmBadges";
import { getOpenClawReviewItems } from "@/lib/crm/repository";
import { formatDateTimeParis } from "@/lib/date";

export default async function AgentReviewPage() {
  const items = await getOpenClawReviewItems();

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Revue OpenClaw</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Prospects détectés par agent externe. Rien n&apos;est envoyé automatiquement : validez puis déclenchez l&apos;email manuellement.
        </p>
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
                    Action: {item.action_status ?? "à créer"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {item.city ?? "Ville non renseignée"} - {item.sector ?? "Secteur non renseigné"} - importé le {formatDateTimeParis(item.created_at)}
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
                  {item.audit_summary ?? item.notes ?? "Aucun résumé fourni par OpenClaw."}
                </p>
                <dl className="mt-4 grid gap-2 text-sm text-zinc-400">
                  <Info label="Contact" value={item.contact_name ?? "-"} />
                  <Info label="Email" value={item.email ?? "-"} />
                  <Info label="Téléphone" value={item.phone ?? "-"} />
                  <Info label="Site" value={item.website ?? "-"} />
                </dl>
              </section>

              <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h4 className="font-semibold text-zinc-100">Email proposé</h4>
                <p className="mt-3 text-sm text-zinc-400">Sujet</p>
                <p className="mt-1 rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100">
                  {item.action_title ?? item.suggested_email_subject ?? "Sujet manquant"}
                </p>
                <p className="mt-3 text-sm text-zinc-400">Corps</p>
                <div className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm leading-6 text-zinc-200">
                  {item.action_body ?? item.suggested_email_body ?? "Corps d'email manquant"}
                </div>
              </section>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {item.action_id ? (
                <>
                  <form action={validateOpenClawActionAction}>
                    <input type="hidden" name="prospectId" value={item.id} />
                    <input type="hidden" name="actionId" value={item.action_id} />
                    <button className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-200">
                      Valider
                    </button>
                  </form>
                  <form action={rejectOpenClawActionAction}>
                    <input type="hidden" name="prospectId" value={item.id} />
                    <input type="hidden" name="actionId" value={item.action_id} />
                    <button className="rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-sm font-medium text-rose-200">
                      Rejeter
                    </button>
                  </form>
                  <form action={sendValidatedOpenClawEmailAction}>
                    <input type="hidden" name="prospectId" value={item.id} />
                    <input type="hidden" name="actionId" value={item.action_id} />
                    <button
                      disabled={item.action_status !== "validée" || !item.email}
                      className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Envoyer email après validation
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

