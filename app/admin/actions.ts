"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, setAdminSession } from "@/lib/admin-auth";
import {
  type LeadStatus,
  touchLeadLastContactAt,
  updateLeadNotes,
  updateLeadStatus,
} from "@/lib/leads-repository";
import { createLeadActivity } from "@/lib/lead-activities-repository";

export async function adminLoginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    throw new Error("ADMIN_PASSWORD manquant côté serveur.");
  }

  if (password !== expected) {
    redirect("/admin?error=1");
  }

  await setAdminSession();
  redirect("/admin/leads");
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function setLeadStatusAction(formData: FormData) {
  const id = Number.parseInt(String(formData.get("id") ?? ""), 10);
  const status = String(formData.get("status") ?? "") as LeadStatus;

  if (!Number.isFinite(id)) {
    throw new Error("ID lead invalide");
  }

  await updateLeadStatus(id, status);
  await createLeadActivity({
    leadId: id,
    type: "status_changed",
    description: `Statut mis à jour: ${status}`,
    userAction: "admin",
    metadata: { status },
  });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function updateLeadNotesAction(formData: FormData) {
  const id = Number.parseInt(String(formData.get("id") ?? ""), 10);
  const notes = String(formData.get("notes") ?? "");

  if (!Number.isFinite(id)) {
    throw new Error("ID lead invalide");
  }

  await updateLeadNotes(id, notes);
  await createLeadActivity({
    leadId: id,
    type: "note_added",
    description: "Notes internes mises à jour",
    userAction: "admin",
  });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function touchLastContactAction(formData: FormData) {
  const id = Number.parseInt(String(formData.get("id") ?? ""), 10);
  if (!Number.isFinite(id)) {
    throw new Error("ID lead invalide");
  }

  await touchLeadLastContactAt(id);
  await createLeadActivity({
    leadId: id,
    type: "status_changed",
    description: "Dernier contact mis à jour",
    userAction: "admin",
  });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}
