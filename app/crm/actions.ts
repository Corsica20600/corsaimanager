"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  archiveProspect,
  createProspect,
  getCommercialActionById,
  getProspectById,
  importProspects,
  markOpenClawEmailSent,
  setProspectStatus,
  updateCommercialActionStatus,
  updateFollowUpStatus,
  updateProspect,
} from "@/lib/crm/repository";
import { type FollowUpStatus, type ProspectImportInput, type ProspectInput, type ProspectStatus } from "@/lib/crm/types";
import { getMailerTransport } from "@/lib/mailer";

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

export async function importProspectsAction(formData: FormData) {
  await requireCrmAccess();
  const payload = String(formData.get("payload") ?? "[]");
  const items = JSON.parse(payload) as ProspectImportInput[];
  const result = await importProspects(items);
  revalidateCrm();
  redirect(`/crm/prospection?imported=${result.created.length}&skipped=${result.skipped.length}`);
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

export async function sendValidatedOpenClawEmailAction(formData: FormData) {
  await requireCrmAccess();
  const prospectId = readId(formData, "prospectId");
  const actionId = readId(formData, "actionId");

  const [prospect, action] = await Promise.all([getProspectById(prospectId), getCommercialActionById(actionId)]);
  if (!prospect) throw new Error("Prospect introuvable.");
  if (!action) throw new Error("Action commerciale introuvable.");
  if (action.status !== "validée") throw new Error("L'email doit être validé avant envoi.");
  if (!prospect.email) throw new Error("Aucun email prospect disponible.");
  if (!action.title || !action.body) throw new Error("Sujet ou corps d'email manquant.");

  const { transport, from } = getMailerTransport();
  await transport.sendMail({
    from,
    to: prospect.email,
    subject: action.title,
    text: action.body,
    html: buildProspectionEmailHtml(action.body),
  });

  await markOpenClawEmailSent(prospectId, actionId);
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
