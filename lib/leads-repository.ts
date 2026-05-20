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
};

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "closed" | "lost";

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
  priority: string;
  last_contact_at: string | null;
  notes: string | null;
};

export type LeadsFilters = {
  query?: string;
  status?: LeadStatus | "all";
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
      priority TEXT NOT NULL DEFAULT 'normal',
      last_contact_at TIMESTAMPTZ,
      notes TEXT,
      pipeline_stage TEXT NOT NULL DEFAULT 'new',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function createAuditLead(input: AuditLeadInput) {
  const sql = getNeonClient();

  await ensureLeadsTable();

  await sql`
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
      last_contact_at,
      notes,
      pipeline_stage
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
      ${0},
      ${"normal"},
      ${null},
      ${null},
      ${"new"}
    )
  `;
}

export async function getLeadsStats() {
  const sql = getNeonClient();
  await ensureLeadsTable();

  const [stats] = (await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'new')::int AS new_count,
      COUNT(*) FILTER (WHERE score >= 70 OR priority = 'high')::int AS hot_count,
      COUNT(*) FILTER (WHERE status IN ('closed', 'lost'))::int AS treated_count
    FROM leads
  `) as Array<{
    total: number;
    new_count: number;
    hot_count: number;
    treated_count: number;
  }>;

  return stats ?? { total: 0, new_count: 0, hot_count: 0, treated_count: 0 };
}

export async function getLeads(filters: LeadsFilters = {}) {
  const sql = getNeonClient();
  await ensureLeadsTable();

  const query = (filters.query ?? "").trim().toLowerCase();
  const status = filters.status && filters.status !== "all" ? filters.status : null;

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
      last_contact_at,
      notes
    FROM leads
    WHERE
      (${status}::text IS NULL OR status = ${status})
      AND (
        ${query}::text = ''
        OR LOWER(nom) LIKE ${`%${query}%`}
        OR LOWER(entreprise) LIKE ${`%${query}%`}
        OR LOWER(email) LIKE ${`%${query}%`}
      )
    ORDER BY created_at DESC
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
      last_contact_at,
      notes
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
        WHEN ${status} IN ('contacted', 'qualified', 'proposal', 'closed')
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
