import type { LeadPriority } from "@/lib/lead-scoring";
import { getNeonClient } from "@/lib/neon";

export type AuditLeadInput = {
  nom: string;
  email: string;
  telephone: string;
  entreprise: string;
  secteur: string;
  besoin: string;
  message: string;
  status?: string;
  source?: string;
  score?: number;
  priority?: LeadPriority;
  scoreReasons?: string[];
  isSpam?: boolean;
};

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "closed" | "lost";

export type LeadRow = {
  id: number;
  created_at: string;
  nom: string;
  email: string;
  telephone: string | null;
  entreprise: string;
  activite: string;
  besoin: string;
  message: string | null;
  source: string;
  status: LeadStatus;
  score: number;
  priority: LeadPriority;
  score_reasons: string[] | null;
  last_contact_at: string | null;
  notes: string | null;
  reminder_step: number;
  reminder_last_sent_at: string | null;
  ai_summary: string | null;
  next_action_suggestion: string | null;
  ai_qualification: "low" | "medium" | "high" | "hot" | null;
  ai_detected_needs: string[] | null;
  ai_urgency: "low" | "medium" | "high" | null;
  ai_next_action: string | null;
  ai_suggested_reply: string | null;
  ai_confidence: number | null;
  ai_processed_at: string | null;
  is_spam: boolean;
};

export type LeadsFilters = {
  query?: string;
  status?: LeadStatus | "all";
  priority?: "all" | "low" | "medium" | "high" | "hot";
  sort?: "recent" | "score";
  spamFilter?: "all" | "valid" | "spam";
  includeSpam?: boolean;
};

export async function ensureLeadsTable() {
  const sql = getNeonClient();

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      nom TEXT NOT NULL,
      email TEXT NOT NULL,
      telephone TEXT,
      entreprise TEXT NOT NULL,
      activite TEXT NOT NULL,
      besoin TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      source TEXT NOT NULL DEFAULT 'audit-form',
      score INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'low',
      score_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      last_contact_at TIMESTAMPTZ,
      notes TEXT,
      pipeline_stage TEXT NOT NULL DEFAULT 'new',
      reminder_step INTEGER NOT NULL DEFAULT 0,
      reminder_last_sent_at TIMESTAMPTZ,
      ai_summary TEXT,
      next_action_suggestion TEXT,
      ai_qualification TEXT,
      ai_detected_needs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      ai_urgency TEXT,
      ai_next_action TEXT,
      ai_suggested_reply TEXT,
      ai_confidence INTEGER,
      ai_processed_at TIMESTAMPTZ,
      is_spam BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'low'`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'audit-form'`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new'`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS reminder_step INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS reminder_last_sent_at TIMESTAMPTZ`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_summary TEXT`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action_suggestion TEXT`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_qualification TEXT`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_detected_needs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_urgency TEXT`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_next_action TEXT`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_suggested_reply TEXT`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_confidence INTEGER`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`
    CREATE TABLE IF NOT EXISTS lead_submission_attempts (
      id BIGSERIAL PRIMARY KEY,
      ip_address TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_lead_submission_attempts_ip_created_at
    ON lead_submission_attempts (ip_address, created_at DESC)
  `;
}

export async function createAuditLead(input: AuditLeadInput) {
  const sql = getNeonClient();

  await ensureLeadsTable();

  const [created] = (await sql`
    INSERT INTO leads (
      nom,
      email,
      telephone,
      entreprise,
      activite,
      besoin,
      message,
      status,
      source,
      score,
      priority,
      score_reasons,
      last_contact_at,
      notes,
      pipeline_stage,
      reminder_step,
      reminder_last_sent_at,
      ai_summary,
      next_action_suggestion,
      ai_qualification,
      ai_detected_needs,
      ai_urgency,
      ai_next_action,
      ai_suggested_reply,
      ai_confidence,
      ai_processed_at,
      is_spam
    ) VALUES (
      ${input.nom},
      ${input.email},
      ${input.telephone || null},
      ${input.entreprise},
      ${input.secteur},
      ${input.besoin},
      ${input.message || null},
      ${input.status ?? "new"},
      ${input.source ?? "audit-form"},
      ${input.score ?? 0},
      ${input.priority ?? "low"},
      ${input.scoreReasons ?? []},
      ${null},
      ${null},
      ${"new"},
      ${0},
      ${null},
      ${null},
      ${null},
      ${null},
      ${[]},
      ${null},
      ${null},
      ${null},
      ${null},
      ${null},
      ${input.isSpam ?? false}
    )
    RETURNING id
  `) as Array<{ id: number }>;

  return created?.id ?? null;
}

export async function getLeadsStats() {
  const sql = getNeonClient();
  await ensureLeadsTable();

  const [stats] = (await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'new')::int AS new_count,
      COUNT(*) FILTER (WHERE priority = 'hot')::int AS hot_count,
      COUNT(*) FILTER (WHERE status IN ('closed', 'lost'))::int AS treated_count,
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS today_count,
      COUNT(*) FILTER (
        WHERE status IN ('new', 'contacted', 'qualified', 'proposal')
        AND (last_contact_at IS NULL OR last_contact_at < NOW() - INTERVAL '3 days')
      )::int AS no_reply_count,
      COUNT(*) FILTER (WHERE reminder_last_sent_at::date = CURRENT_DATE)::int AS reminders_today,
      CASE WHEN COUNT(*) FILTER (WHERE status IN ('won', 'closed', 'lost')) = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE status IN ('won','closed'))::numeric /
           NULLIF(COUNT(*) FILTER (WHERE status IN ('won','closed','lost')), 0)) * 100
        )::int
      END AS conversion_rate,
      COALESCE(ROUND(AVG(score))::int, 0) AS avg_score,
      COALESCE(
        (
          SELECT STRING_AGG(activity_label, ', ')
          FROM (
            SELECT activite AS activity_label, COUNT(*) AS c
            FROM leads
            GROUP BY activite
            ORDER BY c DESC
            LIMIT 3
          ) t
        ),
        ''
      ) AS top_activities,
      COALESCE(
        (
          SELECT STRING_AGG(need_label, ', ')
          FROM (
            SELECT besoin AS need_label, COUNT(*) AS c
            FROM leads
            GROUP BY besoin
            ORDER BY c DESC
            LIMIT 3
          ) t
        ),
        ''
      ) AS top_needs
    FROM leads
  `) as Array<{
    total: number;
    new_count: number;
    hot_count: number;
    treated_count: number;
    today_count: number;
    no_reply_count: number;
    reminders_today: number;
    conversion_rate: number;
    avg_score: number;
    top_activities: string;
    top_needs: string;
  }>;

  return (
    stats ?? {
      total: 0,
      new_count: 0,
      hot_count: 0,
      treated_count: 0,
      today_count: 0,
      no_reply_count: 0,
      reminders_today: 0,
      conversion_rate: 0,
      avg_score: 0,
      top_activities: "",
      top_needs: "",
    }
  );
}

export async function getLeads(filters: LeadsFilters = {}) {
  const sql = getNeonClient();
  await ensureLeadsTable();

  const query = (filters.query ?? "").trim().toLowerCase();
  const status = filters.status && filters.status !== "all" ? filters.status : null;
  const priority = filters.priority && filters.priority !== "all" ? filters.priority : null;
  const sort = filters.sort ?? "recent";
  const spamFilter = filters.spamFilter ?? "valid";
  const includeSpam = filters.includeSpam ?? false;

  const rows = (await sql`
    SELECT
      id,
      created_at,
      nom,
      email,
      telephone,
      entreprise,
      activite,
      besoin,
      message,
      source,
      status,
      score,
      priority,
      score_reasons,
      last_contact_at,
      notes,
      reminder_step,
      reminder_last_sent_at,
      ai_summary,
      next_action_suggestion,
      ai_qualification,
      ai_detected_needs,
      ai_urgency,
      ai_next_action,
      ai_suggested_reply,
      ai_confidence,
      ai_processed_at,
      is_spam
    FROM leads
    WHERE
      (${status}::text IS NULL OR status = ${status})
      AND (${priority}::text IS NULL OR priority = ${priority})
      AND (
        (${includeSpam} = false AND is_spam = false)
        OR (${includeSpam} = true)
      )
      AND (
        ${spamFilter}::text = 'all'
        OR (${spamFilter}::text = 'valid' AND is_spam = false)
        OR (${spamFilter}::text = 'spam' AND is_spam = true)
      )
      AND (
        ${query}::text = ''
        OR LOWER(nom) LIKE ${`%${query}%`}
        OR LOWER(entreprise) LIKE ${`%${query}%`}
        OR LOWER(email) LIKE ${`%${query}%`}
      )
    ORDER BY
      CASE WHEN ${sort} = 'score' THEN score END DESC,
      created_at DESC
    LIMIT 250
  `) as LeadRow[];

  return rows;
}

export async function getLeadById(id: number) {
  const sql = getNeonClient();
  await ensureLeadsTable();

  const rows = (await sql`
    SELECT
      id,
      created_at,
      nom,
      email,
      telephone,
      entreprise,
      activite,
      besoin,
      message,
      source,
      status,
      score,
      priority,
      score_reasons,
      last_contact_at,
      notes,
      reminder_step,
      reminder_last_sent_at,
      ai_summary,
      next_action_suggestion,
      ai_qualification,
      ai_detected_needs,
      ai_urgency,
      ai_next_action,
      ai_suggested_reply,
      ai_confidence,
      ai_processed_at,
      is_spam
    FROM leads
    WHERE id = ${id}
    LIMIT 1
  `) as LeadRow[];

  return rows[0] ?? null;
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  const sql = getNeonClient();
  await ensureLeadsTable();

  await sql`
    UPDATE leads
    SET
      status = ${status},
      updated_at = NOW(),
      last_contact_at = CASE
        WHEN ${status} IN ('contacted', 'qualified', 'proposal', 'closed', 'won')
        THEN NOW()
        ELSE last_contact_at
      END
    WHERE id = ${id}
  `;
}

export async function updateLeadNotes(id: number, notes: string) {
  const sql = getNeonClient();
  await ensureLeadsTable();

  await sql`
    UPDATE leads
    SET
      notes = ${notes || null},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function touchLeadLastContactAt(id: number) {
  const sql = getNeonClient();
  await ensureLeadsTable();

  await sql`
    UPDATE leads
    SET
      last_contact_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function getLeadsForReminders() {
  const sql = getNeonClient();
  await ensureLeadsTable();

  const rows = (await sql`
    SELECT
      id,
      created_at,
      nom,
      email,
      telephone,
      entreprise,
      activite,
      besoin,
      message,
      source,
      status,
      score,
      priority,
      score_reasons,
      last_contact_at,
      notes,
      reminder_step,
      reminder_last_sent_at,
      ai_summary,
      next_action_suggestion,
      ai_qualification,
      ai_detected_needs,
      ai_urgency,
      ai_next_action,
      ai_suggested_reply,
      ai_confidence,
      ai_processed_at,
      is_spam
    FROM leads
    WHERE status NOT IN ('won', 'closed', 'lost')
    ORDER BY created_at ASC
  `) as LeadRow[];

  return rows;
}

export async function markLeadReminderSent(id: number, step: number) {
  const sql = getNeonClient();
  await ensureLeadsTable();

  await sql`
    UPDATE leads
    SET
      reminder_step = ${step},
      reminder_last_sent_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function updateLeadAIAnalysis(
  id: number,
  analysis: {
    summary: string;
    qualification: "low" | "medium" | "high" | "hot";
    detectedNeeds: string[];
    urgency: "low" | "medium" | "high";
    nextAction: string;
    suggestedReply: string;
    confidence: number;
  },
) {
  const sql = getNeonClient();
  await ensureLeadsTable();

  await sql`
    UPDATE leads
    SET
      ai_summary = ${analysis.summary},
      ai_qualification = ${analysis.qualification},
      ai_detected_needs = ${analysis.detectedNeeds},
      ai_urgency = ${analysis.urgency},
      ai_next_action = ${analysis.nextAction},
      ai_suggested_reply = ${analysis.suggestedReply},
      ai_confidence = ${analysis.confidence},
      ai_processed_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function enforceLeadSubmissionRateLimit(ipAddress: string, maxPerHour = 3) {
  const sql = getNeonClient();
  await ensureLeadsTable();

  const [row] = (await sql`
    SELECT COUNT(*)::int AS attempts
    FROM lead_submission_attempts
    WHERE ip_address = ${ipAddress}
      AND created_at >= NOW() - INTERVAL '1 hour'
  `) as Array<{ attempts: number }>;

  const attempts = row?.attempts ?? 0;
  if (attempts >= maxPerHour) {
    return { allowed: false, attempts };
  }

  await sql`
    INSERT INTO lead_submission_attempts (ip_address)
    VALUES (${ipAddress})
  `;

  return { allowed: true, attempts: attempts + 1 };
}
