import { getNeonClient } from "@/lib/neon";

export type LeadProposalStatus = "draft" | "sent";

export type LeadProposal = {
  id: string;
  lead_id: number;
  created_at: string;
  updated_at: string;
  title: string;
  summary: string;
  diagnosis: string;
  proposed_solution: string;
  scope: string;
  deliverables: string[];
  estimated_timeline: string;
  estimated_budget: string;
  next_steps: string;
  status: LeadProposalStatus;
  ai_model: string | null;
  raw_ai_response: string | null;
};

export type LeadProposalInput = {
  title: string;
  summary: string;
  diagnosis: string;
  proposedSolution: string;
  scope: string;
  deliverables: string[];
  estimatedTimeline: string;
  estimatedBudget: string;
  nextSteps: string;
  aiModel?: string | null;
  rawAiResponse?: unknown;
};

export async function ensureLeadProposalsTable() {
  const sql = getNeonClient();
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
  await sql`
    CREATE TABLE IF NOT EXISTS lead_proposals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      title TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      diagnosis TEXT NOT NULL DEFAULT '',
      proposed_solution TEXT NOT NULL DEFAULT '',
      scope TEXT NOT NULL DEFAULT '',
      deliverables TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      estimated_timeline TEXT NOT NULL DEFAULT '',
      estimated_budget TEXT NOT NULL DEFAULT '',
      next_steps TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      ai_model TEXT,
      raw_ai_response JSONB
    )
  `;
}

export async function getProposalByLeadId(leadId: number) {
  const sql = getNeonClient();
  await ensureLeadProposalsTable();

  const rows = (await sql`
    SELECT
      id,
      lead_id,
      created_at,
      updated_at,
      title,
      summary,
      diagnosis,
      proposed_solution,
      scope,
      deliverables,
      estimated_timeline,
      estimated_budget,
      next_steps,
      status,
      ai_model,
      raw_ai_response::text AS raw_ai_response
    FROM lead_proposals
    WHERE lead_id = ${leadId}
    ORDER BY updated_at DESC
    LIMIT 1
  `) as LeadProposal[];

  return rows[0] ?? null;
}

export async function createProposalForLead(leadId: number, input: LeadProposalInput) {
  const sql = getNeonClient();
  await ensureLeadProposalsTable();

  const [created] = (await sql`
    INSERT INTO lead_proposals (
      lead_id,
      title,
      summary,
      diagnosis,
      proposed_solution,
      scope,
      deliverables,
      estimated_timeline,
      estimated_budget,
      next_steps,
      status,
      ai_model,
      raw_ai_response
    ) VALUES (
      ${leadId},
      ${input.title},
      ${input.summary},
      ${input.diagnosis},
      ${input.proposedSolution},
      ${input.scope},
      ${input.deliverables},
      ${input.estimatedTimeline},
      ${input.estimatedBudget},
      ${input.nextSteps},
      ${"draft"},
      ${input.aiModel ?? null},
      ${input.rawAiResponse ? JSON.stringify(input.rawAiResponse) : null}::jsonb
    )
    RETURNING
      id,
      lead_id,
      created_at,
      updated_at,
      title,
      summary,
      diagnosis,
      proposed_solution,
      scope,
      deliverables,
      estimated_timeline,
      estimated_budget,
      next_steps,
      status,
      ai_model,
      raw_ai_response::text AS raw_ai_response
  `) as LeadProposal[];

  return created;
}

export async function updateProposalById(
  proposalId: string,
  input: Partial<{
    title: string;
    summary: string;
    diagnosis: string;
    proposedSolution: string;
    scope: string;
    deliverables: string[];
    estimatedTimeline: string;
    estimatedBudget: string;
    nextSteps: string;
    status: LeadProposalStatus;
  }>,
) {
  const sql = getNeonClient();
  await ensureLeadProposalsTable();

  const [updated] = (await sql`
    UPDATE lead_proposals
    SET
      title = COALESCE(${input.title ?? null}, title),
      summary = COALESCE(${input.summary ?? null}, summary),
      diagnosis = COALESCE(${input.diagnosis ?? null}, diagnosis),
      proposed_solution = COALESCE(${input.proposedSolution ?? null}, proposed_solution),
      scope = COALESCE(${input.scope ?? null}, scope),
      deliverables = COALESCE(${input.deliverables ?? null}, deliverables),
      estimated_timeline = COALESCE(${input.estimatedTimeline ?? null}, estimated_timeline),
      estimated_budget = COALESCE(${input.estimatedBudget ?? null}, estimated_budget),
      next_steps = COALESCE(${input.nextSteps ?? null}, next_steps),
      status = COALESCE(${input.status ?? null}, status),
      updated_at = NOW()
    WHERE id = ${proposalId}
    RETURNING
      id,
      lead_id,
      created_at,
      updated_at,
      title,
      summary,
      diagnosis,
      proposed_solution,
      scope,
      deliverables,
      estimated_timeline,
      estimated_budget,
      next_steps,
      status,
      ai_model,
      raw_ai_response::text AS raw_ai_response
  `) as LeadProposal[];

  return updated ?? null;
}
