"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, setAdminSession } from "@/lib/admin-auth";
import { generateLeadProposal } from "@/lib/ai/proposal-generator";
import {
  type LeadStatus,
  getLeadById,
  touchLeadLastContactAt,
  updateLeadNotes,
  updateLeadStatus,
} from "@/lib/leads-repository";
import { createLeadActivity } from "@/lib/lead-activities-repository";
import {
  createProposalForLead,
  getProposalByLeadId,
  updateProposalById,
} from "@/lib/lead-proposals-repository";

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
  redirect("/admin");
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

export async function generateProposalForLead(leadId: number) {
  if (!Number.isFinite(leadId)) {
    throw new Error("ID lead invalide");
  }

  const lead = await getLeadById(leadId);
  if (!lead) {
    throw new Error("Lead introuvable");
  }

  const existing = await getProposalByLeadId(leadId);
  const { proposal, aiModel, rawResponse } = await generateLeadProposal(lead);

  if (existing) {
    await updateProposalById(existing.id, {
      title: proposal.title,
      summary: proposal.summary,
      diagnosis: proposal.diagnosis,
      proposedSolution: proposal.proposedSolution,
      scope: proposal.scope,
      deliverables: proposal.deliverables,
      estimatedTimeline: proposal.estimatedTimeline,
      estimatedBudget: proposal.estimatedBudget,
      nextSteps: proposal.nextSteps,
      status: "draft",
    });
  } else {
    await createProposalForLead(leadId, {
      title: proposal.title,
      summary: proposal.summary,
      diagnosis: proposal.diagnosis,
      proposedSolution: proposal.proposedSolution,
      scope: proposal.scope,
      deliverables: proposal.deliverables,
      estimatedTimeline: proposal.estimatedTimeline,
      estimatedBudget: proposal.estimatedBudget,
      nextSteps: proposal.nextSteps,
      aiModel,
      rawAiResponse: rawResponse,
    });
  }

  await createLeadActivity({
    leadId,
    type: "proposal_generated",
    description: "Proposition commerciale IA générée",
    userAction: "admin",
    metadata: { aiModel },
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function generateProposalForLeadAction(formData: FormData) {
  const leadId = Number.parseInt(String(formData.get("leadId") ?? ""), 10);
  await generateProposalForLead(leadId);
}

export async function getProposalForLead(leadId: number) {
  if (!Number.isFinite(leadId)) {
    throw new Error("ID lead invalide");
  }
  return getProposalByLeadId(leadId);
}

export async function updateProposal(
  leadId: number,
  proposalId: string,
  data: {
    title: string;
    summary: string;
    diagnosis: string;
    proposedSolution: string;
    scope: string;
    deliverables: string[];
    estimatedTimeline: string;
    estimatedBudget: string;
    nextSteps: string;
    status: "draft" | "sent";
  },
) {
  if (!Number.isFinite(leadId)) {
    throw new Error("ID lead invalide");
  }
  if (!proposalId) {
    throw new Error("ID proposition invalide");
  }

  await updateProposalById(proposalId, {
    title: data.title,
    summary: data.summary,
    diagnosis: data.diagnosis,
    proposedSolution: data.proposedSolution,
    scope: data.scope,
    deliverables: data.deliverables,
    estimatedTimeline: data.estimatedTimeline,
    estimatedBudget: data.estimatedBudget,
    nextSteps: data.nextSteps,
    status: data.status,
  });

  await createLeadActivity({
    leadId,
    type: "proposal_updated",
    description: "Proposition commerciale mise à jour",
    userAction: "admin",
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function updateProposalAction(formData: FormData) {
  const leadId = Number.parseInt(String(formData.get("leadId") ?? ""), 10);
  const proposalId = String(formData.get("proposalId") ?? "");
  const deliverablesRaw = String(formData.get("deliverables") ?? "");
  const deliverables = deliverablesRaw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  await updateProposal(leadId, proposalId, {
    title: String(formData.get("title") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    diagnosis: String(formData.get("diagnosis") ?? "").trim(),
    proposedSolution: String(formData.get("proposedSolution") ?? "").trim(),
    scope: String(formData.get("scope") ?? "").trim(),
    deliverables,
    estimatedTimeline: String(formData.get("estimatedTimeline") ?? "").trim(),
    estimatedBudget: String(formData.get("estimatedBudget") ?? "").trim(),
    nextSteps: String(formData.get("nextSteps") ?? "").trim(),
    status: (String(formData.get("status") ?? "draft").trim() as "draft" | "sent") || "draft",
  });
}

export async function markProposalSent(leadId: number, proposalId: string) {
  if (!Number.isFinite(leadId)) {
    throw new Error("ID lead invalide");
  }
  if (!proposalId) {
    throw new Error("ID proposition invalide");
  }

  await updateProposalById(proposalId, { status: "sent" });
  await createLeadActivity({
    leadId,
    type: "proposal_marked_sent",
    description: "Proposition marquée comme envoyée",
    userAction: "admin",
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function markProposalSentAction(formData: FormData) {
  const leadId = Number.parseInt(String(formData.get("leadId") ?? ""), 10);
  const proposalId = String(formData.get("proposalId") ?? "");
  await markProposalSent(leadId, proposalId);
}
