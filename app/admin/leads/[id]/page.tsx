import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  setLeadStatusAction,
  touchLastContactAction,
  updateLeadNotesAction,
} from "@/app/admin/actions";
import { CopyButton } from "@/components/ui/copy-button";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getLeadActivities } from "@/lib/lead-activities-repository";
import { type LeadStatus, getLeadById } from "@/lib/leads-repository";

type Props = {
  params: Promise<{ id: string }>;
};

const statuses: LeadStatus[] = ["contacted", "qualified", "proposal", "won", "lost"];

export default async function AdminLeadDetailPage({ params }: Props) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin");

  const { id } = await params;
  const leadId = Number.parseInt(id, 10);
  if (!Number.isFinite(leadId)) notFound();

  const lead = await getLeadById(leadId);
  if (!lead) notFound();
  const activities = await getLeadActivities(leadId);

  const whatsappUrl = lead.telephone
    ? `https://wa.me/${lead.telephone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
        `Bonjour ${lead.nom}, suite à votre demande d'audit IA, nous revenons vers vous.`,
      )}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Lead #{lead.id}</h1>
        <Link href="/admin/leads" className="text-sm text-cyan-200 hover:text-cyan-100">
          Retour liste
        </Link>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur">
          <h2 className="text-xl font-medium text-zinc-100">Informations</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-zinc-300">
            <p><span className="text-zinc-500">Nom:</span> {lead.nom}</p>
            <p><span className="text-zinc-500">Entreprise:</span> {lead.entreprise}</p>
            <p><span className="text-zinc-500">Email:</span> {lead.email}</p>
            <p><span className="text-zinc-500">Téléphone:</span> {lead.telephone ?? "-"}</p>
            <p><span className="text-zinc-500">Activité:</span> {lead.activite}</p>
            <p><span className="text-zinc-500">Besoin:</span> {lead.besoin}</p>
            <p><span className="text-zinc-500">Source:</span> {lead.source}</p>
            <p><span className="text-zinc-500">Créé le:</span> {new Date(lead.created_at).toLocaleString("fr-FR")}</p>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-zinc-500 text-sm">Message</p>
            <p className="mt-2 text-sm text-zinc-200 whitespace-pre-wrap">{lead.message || "Aucun message"}</p>
          </div>
        </section>

        <section className="space-y-4">
          <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur">
            <h2 className="text-lg font-medium text-zinc-100">Qualification</h2>
            <p className="mt-2 text-sm text-zinc-300">Statut: <span className="text-cyan-200">{lead.status}</span></p>
            <p className="mt-1 text-sm text-zinc-300">Score: <span className="text-cyan-200">{lead.score}</span></p>
            <p className="mt-1 text-sm text-zinc-300">Priorité: <span className="text-cyan-200">{lead.priority === "hot" ? "🔥 Lead chaud" : lead.priority}</span></p>
            <p className="mt-1 text-sm text-zinc-300">Dernier contact: <span className="text-cyan-200">{lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleString("fr-FR") : "-"}</span></p>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Pourquoi ce score</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                {(lead.score_reasons && lead.score_reasons.length > 0 ? lead.score_reasons : ["Aucune raison enregistrée."]).map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {statuses.map((status) => (
                <form key={status} action={setLeadStatusAction}>
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="status" value={status} />
                  <button className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:border-cyan-300/50">
                    {labelForStatus(status)}
                  </button>
                </form>
              ))}
              <form action={touchLastContactAction}>
                <input type="hidden" name="id" value={lead.id} />
                <button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-200">
                  Marquer contacté
                </button>
              </form>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur">
            <h2 className="text-lg font-medium text-zinc-100">Notes internes</h2>
            <form action={updateLeadNotesAction} className="mt-3">
              <input type="hidden" name="id" value={lead.id} />
              <textarea
                name="notes"
                rows={5}
                defaultValue={lead.notes ?? ""}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
                placeholder="Ajouter vos notes..."
              />
              <button className="mt-3 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-2 text-sm font-semibold text-zinc-950">
                Enregistrer notes
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur">
            <h2 className="text-lg font-medium text-zinc-100">Actions rapides</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`mailto:${lead.email}`} className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:border-cyan-300/50">
                Répondre par email
              </a>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-200"
                >
                  Ouvrir WhatsApp
                </a>
              ) : null}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur">
            <h2 className="text-lg font-medium text-zinc-100">Historique</h2>
            <div className="mt-3 space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-zinc-400">Aucune activité.</p>
              ) : (
                activities.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <p className="text-xs text-zinc-500">{new Date(item.created_at).toLocaleString("fr-FR")}</p>
                    <p className="mt-1 text-sm text-zinc-200">{item.description}</p>
                    <p className="mt-1 text-xs text-cyan-200">{item.type}</p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur">
            <h2 className="text-lg font-medium text-zinc-100">Analyse IA</h2>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              <p><span className="text-zinc-500">Résumé:</span> {lead.ai_summary ?? "Non disponible"}</p>
              <p><span className="text-zinc-500">Qualification:</span> {lead.ai_qualification ?? "Non disponible"}</p>
              <p><span className="text-zinc-500">Urgence:</span> {lead.ai_urgency ?? "Non disponible"}</p>
              <p><span className="text-zinc-500">Besoins détectés:</span> {(lead.ai_detected_needs && lead.ai_detected_needs.length > 0) ? lead.ai_detected_needs.join(", ") : "Non disponible"}</p>
              <p><span className="text-zinc-500">Prochaine action:</span> {lead.ai_next_action ?? "Non disponible"}</p>
              <p><span className="text-zinc-500">Confiance IA:</span> {lead.ai_confidence ?? 0}%</p>
              <p><span className="text-zinc-500">Analysé le:</span> {lead.ai_processed_at ? new Date(lead.ai_processed_at).toLocaleString("fr-FR") : "Non disponible"}</p>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Réponse suggérée</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">{lead.ai_suggested_reply ?? "Non disponible"}</p>
            </div>
            {lead.ai_suggested_reply ? (
              <div className="mt-3">
                <CopyButton value={lead.ai_suggested_reply} />
              </div>
            ) : null}
          </article>
        </section>
      </div>
    </div>
  );
}

function labelForStatus(status: LeadStatus) {
  const labels: Record<LeadStatus, string> = {
    new: "Nouveau",
    contacted: "Marquer contacté",
    qualified: "Qualifier",
    proposal: "Proposition envoyée",
    won: "Clôturé gagné",
    closed: "Clôturé",
    lost: "Perdu",
  };
  return labels[status];
}
