"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  archiveProspect,
  createProspect,
  importProspects,
  setProspectStatus,
  updateFollowUpStatus,
  updateProspect,
} from "@/lib/crm/repository";
import { type FollowUpStatus, type ProspectImportInput, type ProspectInput, type ProspectStatus } from "@/lib/crm/types";

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

function revalidateCrm(id?: number | null) {
  revalidatePath("/crm");
  revalidatePath("/crm/dashboard");
  revalidatePath("/crm/prospection");
  if (id) revalidatePath(`/crm/${id}`);
}

