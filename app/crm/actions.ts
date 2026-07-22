"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  archiveProspect,
  createProspect,
  getCommercialActionById,
  getEmailDraftById,
  getFollowUpById,
  getProspectById,
  importProspects,
  markFollowUpEmailFailed,
  markFollowUpEmailSent,
  markOpenClawEmailFailed,
  markOpenClawEmailSent,
  prepareOpenClawEmailForProspect,
  setProspectStatus,
  updateCommercialActionStatus,
  updateEmailDraftContent,
  updateEmailDraftStatus,
  updateFollowUpStatus,
  updateProspect,
} from "@/lib/crm/repository";
import { type FollowUpStatus, type ProspectImportInput, type ProspectInput, type ProspectStatus } from "@/lib/crm/types";
import { getMailerTransport } from "@/lib/mailer";

const openClawEmailFrom = "CorsaiManager <contact@corsaimanager.com>";
const crmEmailFrom = "CorsaiManager <contact@corsaimanager.com>";

export async function createProspectAction(formData: FormData) {
  await requireCrmAccess();
  const prospect = await createProspect(readProspectForm(formData));
  revalidateCrm(prospect?.id);
  redirect(prospect ? `/crm/${prospect.id}` : "/crm");
}

export async function updateProspectAction(formData: FormData) {
  await requireCrmAccess();
  const id = readId(formData, "id");
  await updateProspect(id, readProspectForm(formData));
  revalidateCrm(id);
}

export async function archiveProspectAction(formData: FormData) {
  await requireCrmAccess();
  const id = readId(formData, "id");
  await archiveProspect(id);
  revalidateCrm(id);
  redirect("/crm");
}

export async function setProspectStatusAction(formData: FormData) {
  await requireCrmAccess();
  const id = readId(formData, "id");
  const status = String(formData.get("status") ?? "") as ProspectStatus;
  await setProspectStatus(id, status);
  revalidateCrm(id);
}

export async function updateFollowUpStatusAction(formData: FormData) {
  await requireCrmAccess();
  const id = readId(formData, "id");
  const prospectId = readId(formData, "prospectId");
  const status = String(formData.get("status") ?? "") as FollowUpStatus;
  await updateFollowUpStatus(id, status);
  revalidateCrm(prospectId);
}

export async function sendProspectFollowUpEmailAction(formData: FormData) {
  await requireCrmAccess();
  const id = readId(formData, "id");
  const prospectId = readId(formData, "prospectId");

  const [prospect, followUp] = await Promise.all([
    getProspectById(prospectId),
    getFollowUpById(id),
  ]);

  if (!prospect) throw new Error("Prospect introuvable.");
  if (!followUp || Number(followUp.prospect_id) !== prospectId) throw new Error("Relance introuvable.");
  if (followUp.channel !== "email") throw new Error("Cette relance n'est pas configurée en email.");
  if (followUp.status === "envoyée") throw new Error("Cette relance est déjà envoyée.");
  if (!prospect.email) throw new Error("Aucun email prospect disponible.");

  const email = buildFollowUpEmail(prospect, followUp.template_key);

  try {
    const { transport } = getMailerTransport();
    const info = await transport.sendMail({
      from: crmEmailFrom,
      to: prospect.email,
      subject: email.subject,
      text: email.text,
      html: buildProspectionEmailHtml(email.text),
    });
    await markFollowUpEmailSent(id, getMessageId(info));
  } catch (error) {
    await markFollowUpEmailFailed(id, formatSmtpError(error));
    throw error;
  }

  revalidateCrm(prospectId);
}

export async function importProspectsAction(formData: FormData) {
  await requireCrmAccess();
  const payload = String(formData.get("payload") ?? "[]");
  const items = JSON.parse(payload) as ProspectImportInput[];
  const result = await importProspects(items);
  revalidateCrm();
  redirect(`/crm/prospection?imported=${result.created.length}&skipped=${result.skipped.length}`);
}

export async function prepareOpenClawEmailAction(formData: FormData) {
  await requireCrmAccess();
  const prospectId = readId(formData, "prospectId");
  await prepareOpenClawEmailForProspect(prospectId);
  revalidateCrm(prospectId);
  revalidatePath("/crm/agent-review");
}

export async function validateOpenClawActionAction(formData: FormData) {
  await requireCrmAccess();
  const actionId = readId(formData, "actionId");
  await updateCommercialActionStatus(actionId, "validée");
  revalidateCrm(readOptionalId(formData, "prospectId"));
  revalidatePath("/crm/agent-review");
}

export async function rejectOpenClawActionAction(formData: FormData) {
  await requireCrmAccess();
  const actionId = readId(formData, "actionId");
  await updateCommercialActionStatus(actionId, "rejetée");
  revalidateCrm(readOptionalId(formData, "prospectId"));
  revalidatePath("/crm/agent-review");
}

export async function validateOpenClawDraftAction(formData: FormData) {
  await requireCrmAccess();
  const draftId = readId(formData, "draftId");
  await updateEmailDraftStatus(draftId, "validé");
  revalidateCrm(readOptionalId(formData, "prospectId"));
  revalidatePath("/crm/agent-review");
}

export async function rejectOpenClawDraftAction(formData: FormData) {
  await requireCrmAccess();
  const draftId = readId(formData, "draftId");
  await updateEmailDraftStatus(draftId, "rejeté");
  revalidateCrm(readOptionalId(formData, "prospectId"));
  revalidatePath("/crm/agent-review");
}

export async function updateOpenClawDraftAction(formData: FormData) {
  await requireCrmAccess();
  const draftId = readId(formData, "draftId");
  const prospectId = readOptionalId(formData, "prospectId");
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!subject) throw new Error("Sujet d'email manquant.");
  if (!body) throw new Error("Corps d'email manquant.");

  await updateEmailDraftContent(draftId, subject, body);
  revalidateCrm(prospectId);
  revalidatePath("/crm/agent-review");
}

export async function sendValidatedOpenClawEmailAction(formData: FormData) {
  await requireCrmAccess();
  const prospectId = readId(formData, "prospectId");
  const draftId = readId(formData, "draftId");
  const actionId = readOptionalId(formData, "actionId");

  const [prospect, draft, action] = await Promise.all([
    getProspectById(prospectId),
    getEmailDraftById(draftId),
    actionId ? getCommercialActionById(actionId) : Promise.resolve(null),
  ]);
  if (!prospect) throw new Error("Prospect introuvable.");
  if (!draft) throw new Error("Brouillon email introuvable.");
  if (!action) throw new Error("Action commerciale introuvable.");
  if (action.status !== "validée") throw new Error("Le prospect doit être validé avant envoi.");
  if (draft.status !== "validé") throw new Error("Le brouillon email doit être validé avant envoi.");
  if (!prospect.email) throw new Error("Aucun email prospect disponible.");
  if (!draft.subject || !draft.body) throw new Error("Sujet ou corps d'email manquant.");

  try {
    const { transport } = getMailerTransport();
    const info = await transport.sendMail({
      from: openClawEmailFrom,
      to: prospect.email,
      subject: draft.subject,
      text: draft.body,
      html: buildProspectionEmailHtml(draft.body),
    });

    await markOpenClawEmailSent(prospectId, draftId, action.id, getMessageId(info));
  } catch (error) {
    await markOpenClawEmailFailed(prospectId, draftId, action.id, formatSmtpError(error));
    throw error;
  }

  revalidateCrm(prospectId);
  revalidatePath("/crm/agent-review");
}

async function requireCrmAccess() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin");
}

function readProspectForm(formData: FormData): ProspectInput {
  return {
    companyName: String(formData.get("company_name") ?? ""),
    contactName: String(formData.get("contact_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    website: String(formData.get("website") ?? ""),
    country: String(formData.get("country") ?? "France"),
    region: String(formData.get("region") ?? ""),
    department: String(formData.get("department") ?? ""),
    city: String(formData.get("city") ?? ""),
    sector: String(formData.get("sector") ?? ""),
    source: String(formData.get("source") ?? ""),
    status: String(formData.get("status") ?? "nouveau") as ProspectStatus,
    score: Number.parseInt(String(formData.get("score") ?? "0"), 10),
    notes: String(formData.get("notes") ?? ""),
    lastContactedAt: String(formData.get("last_contacted_at") ?? ""),
    nextFollowUpAt: String(formData.get("next_follow_up_at") ?? ""),
  };
}

function readId(formData: FormData, key: string) {
  const id = Number.parseInt(String(formData.get(key) ?? ""), 10);
  if (!Number.isFinite(id)) throw new Error(`ID invalide: ${key}`);
  return id;
}

function readOptionalId(formData: FormData, key: string) {
  const value = formData.get(key);
  if (!value) return null;
  const id = Number.parseInt(String(value), 10);
  return Number.isFinite(id) ? id : null;
}

function revalidateCrm(id?: number | null) {
  revalidatePath("/crm");
  revalidatePath("/crm/dashboard");
  revalidatePath("/crm/prospection");
  if (id) revalidatePath(`/crm/${id}`);
}

function buildProspectionEmailHtml(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getMessageId(info: unknown) {
  const messageId = (info as { messageId?: unknown })?.messageId;
  return typeof messageId === "string" && messageId.trim() ? messageId.trim() : null;
}

function formatSmtpError(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Erreur SMTP inconnue.";
}

function buildFollowUpEmail(prospect: NonNullable<Awaited<ReturnType<typeof getProspectById>>>, templateKey: string | null) {
  const greeting = prospect.contact_name ? `Bonjour ${prospect.contact_name},` : "Bonjour,";
  const company = prospect.company_name;
  const sector = prospect.sector ? ` dans votre activité (${prospect.sector})` : "";
  const city = prospect.city ? ` à ${prospect.city}` : "";

  if (templateKey === "relance_j10") {
    return {
      subject: `Suite à mon message - ${company}`,
      text: [
        greeting,
        `Je me permets de revenir vers vous au sujet de ${company}${city}.`,
        `CorsaiManager aide les petites structures${sector} à mieux suivre leurs prospects, automatiser les relances et éviter les oublis commerciaux.`,
        "Est-ce qu'un échange rapide de 15 minutes pourrait vous intéresser ?",
        "Bien cordialement,",
        "Erwan - CorsaiManager",
      ].join("\n\n"),
    };
  }

  if (templateKey === "relance_j20") {
    return {
      subject: `Dernier message - ${company}`,
      text: [
        greeting,
        `Je vous écris une dernière fois au sujet de ${company}.`,
        "Si le sujet du suivi commercial ou des automatisations IA n'est pas prioritaire pour le moment, aucun souci.",
        "Je reste disponible si vous souhaitez en reparler plus tard.",
        "Bien cordialement,",
        "Erwan - CorsaiManager",
      ].join("\n\n"),
    };
  }

  return {
    subject: `Mieux suivre vos demandes clients - ${company}`,
    text: [
      greeting,
      `Je vous contacte au sujet de ${company}${city}.`,
      `CorsaiManager accompagne les PME et indépendants${sector} pour centraliser les contacts, préparer les relances et gagner du temps sur le suivi commercial.`,
      "L'idée est simple : ne plus laisser passer de demande, garder un historique propre et préparer les bons messages au bon moment.",
      "Seriez-vous disponible pour un échange rapide cette semaine ?",
      "Bien cordialement,",
      "Erwan - CorsaiManager",
    ].join("\n\n"),
  };
}
