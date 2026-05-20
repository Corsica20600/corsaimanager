import { getNeonClient } from "@/lib/neon";

export type LeadActivityType =
  | "lead_created"
  | "email_sent"
  | "status_changed"
  | "note_added"
  | "reminder_sent";

export type LeadActivity = {
  id: number;
  lead_id: number;
  created_at: string;
  type: LeadActivityType;
  description: string;
  user_action: string | null;
  metadata: string | null;
};

export async function ensureLeadActivitiesTable() {
  const sql = getNeonClient();

  await sql`
    CREATE TABLE IF NOT EXISTS lead_activities (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      user_action TEXT,
      metadata JSONB
    )
  `;
}

export async function createLeadActivity(input: {
  leadId: number;
  type: LeadActivityType;
  description: string;
  userAction?: string;
  metadata?: Record<string, unknown>;
}) {
  const sql = getNeonClient();
  await ensureLeadActivitiesTable();

  await sql`
    INSERT INTO lead_activities (lead_id, type, description, user_action, metadata)
    VALUES (
      ${input.leadId},
      ${input.type},
      ${input.description},
      ${input.userAction ?? null},
      ${input.metadata ? JSON.stringify(input.metadata) : null}::jsonb
    )
  `;
}

export async function getLeadActivities(leadId: number) {
  const sql = getNeonClient();
  await ensureLeadActivitiesTable();

  const rows = (await sql`
    SELECT id, lead_id, created_at, type, description, user_action, metadata::text AS metadata
    FROM lead_activities
    WHERE lead_id = ${leadId}
    ORDER BY created_at DESC
    LIMIT 200
  `) as LeadActivity[];

  return rows;
}

