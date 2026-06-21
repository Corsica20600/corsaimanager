import { getNeonClient } from "@/lib/neon";
import {
  type FollowUpRow,
  type FollowUpStatus,
  type ProspectFilters,
  type ProspectImportInput,
  type ProspectInput,
  type ProspectRow,
  type ProspectStatus,
  prospectStatuses,
} from "@/lib/crm/types";

export async function ensureCrmTables() {
  const sql = getNeonClient();

  await sql`
    CREATE TABLE IF NOT EXISTS crm_prospects (
      id BIGSERIAL PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      city TEXT,
      sector TEXT,
      source TEXT,
      status TEXT NOT NULL DEFAULT 'nouveau',
      score INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      last_contacted_at TIMESTAMPTZ,
      next_follow_up_at TIMESTAMPTZ,
      archived_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS follow_ups (
      id BIGSERIAL PRIMARY KEY,
      prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'relance',
      due_date TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'prévue',
      channel TEXT NOT NULL DEFAULT 'email',
      template_key TEXT,
      sent_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_crm_prospects_email ON crm_prospects (LOWER(email))`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_prospects_website ON crm_prospects (LOWER(website))`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_prospects_status ON crm_prospects (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_prospects_sector ON crm_prospects (sector)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_prospects_city ON crm_prospects (city)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_prospects_next_follow_up ON crm_prospects (next_follow_up_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crm_prospects_archived ON crm_prospects (archived_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_follow_ups_prospect ON follow_ups (prospect_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_follow_ups_due_status ON follow_ups (due_date, status)`;
}

export async function getProspects(filters: ProspectFilters = {}) {
  await ensureCrmTables();
  const sql = getNeonClient();
  const query = normalizeOptional(filters.query);
  const status = filters.status && filters.status !== "all" ? filters.status : null;
  const sector = normalizeOptional(filters.sector);

  return (await sql`
    SELECT *
    FROM crm_prospects
    WHERE archived_at IS NULL
      AND (${query}::text IS NULL OR (
        LOWER(company_name) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(contact_name, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(city, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(sector, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(status, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
      ))
      AND (${status}::text IS NULL OR status = ${status})
      AND (${sector}::text IS NULL OR LOWER(COALESCE(sector, '')) = LOWER(${sector ?? ""}))
    ORDER BY
      CASE WHEN next_follow_up_at IS NULL THEN 1 ELSE 0 END,
      next_follow_up_at ASC,
      updated_at DESC
    LIMIT 500
  `) as ProspectRow[];
}

export async function getProspectById(id: number) {
  await ensureCrmTables();
  const sql = getNeonClient();
  const rows = (await sql`
    SELECT *
    FROM crm_prospects
    WHERE id = ${id} AND archived_at IS NULL
    LIMIT 1
  `) as ProspectRow[];
  return rows[0] ?? null;
}

export async function getFollowUpsByProspectId(prospectId: number) {
  await ensureCrmTables();
  const sql = getNeonClient();
  return (await sql`
    SELECT *
    FROM follow_ups
    WHERE prospect_id = ${prospectId}
    ORDER BY due_date ASC, created_at ASC
  `) as FollowUpRow[];
}

export async function createProspect(input: ProspectInput) {
  validateProspectInput(input);
  await ensureCrmTables();
  const sql = getNeonClient();

  const rows = (await sql`
    INSERT INTO crm_prospects (
      company_name,
      contact_name,
      email,
      phone,
      website,
      city,
      sector,
      source,
      status,
      score,
      notes,
      last_contacted_at,
      next_follow_up_at
    )
    VALUES (
      ${input.companyName.trim()},
      ${emptyToNull(input.contactName)},
      ${emptyToNull(input.email)},
      ${emptyToNull(input.phone)},
      ${normalizeWebsite(input.website)},
      ${emptyToNull(input.city)},
      ${emptyToNull(input.sector)},
      ${emptyToNull(input.source) ?? "manuel"},
      ${normalizeStatus(input.status)},
      ${normalizeScore(input.score)},
      ${emptyToNull(input.notes)},
      ${emptyToNull(input.lastContactedAt)},
      ${emptyToNull(input.nextFollowUpAt)}
    )
    RETURNING *
  `) as ProspectRow[];

  const created = rows[0];
  if (created && created.status === "contacté") {
    await createInitialFollowUp(created.id);
  }
  return created;
}

export async function updateProspect(id: number, input: ProspectInput) {
  validateProspectInput(input);
  await ensureCrmTables();
  const sql = getNeonClient();
  const status = normalizeStatus(input.status);

  const rows = (await sql`
    UPDATE crm_prospects
    SET
      company_name = ${input.companyName.trim()},
      contact_name = ${emptyToNull(input.contactName)},
      email = ${emptyToNull(input.email)},
      phone = ${emptyToNull(input.phone)},
      website = ${normalizeWebsite(input.website)},
      city = ${emptyToNull(input.city)},
      sector = ${emptyToNull(input.sector)},
      source = ${emptyToNull(input.source) ?? "manuel"},
      status = ${status},
      score = ${normalizeScore(input.score)},
      notes = ${emptyToNull(input.notes)},
      last_contacted_at = ${emptyToNull(input.lastContactedAt)},
      next_follow_up_at = ${emptyToNull(input.nextFollowUpAt)},
      updated_at = NOW()
    WHERE id = ${id} AND archived_at IS NULL
    RETURNING *
  `) as ProspectRow[];

  const updated = rows[0] ?? null;
  if (updated && status === "contacté") {
    await createInitialFollowUp(id);
  }
  return updated;
}

export async function archiveProspect(id: number) {
  await ensureCrmTables();
  const sql = getNeonClient();
  await sql`
    UPDATE crm_prospects
    SET archived_at = NOW(), updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function setProspectStatus(id: number, status: ProspectStatus) {
  await ensureCrmTables();
  const sql = getNeonClient();
  const normalized = normalizeStatus(status);
  await sql`
    UPDATE crm_prospects
    SET
      status = ${normalized},
      last_contacted_at = CASE WHEN ${normalized} = 'contacté' THEN NOW() ELSE last_contacted_at END,
      updated_at = NOW()
    WHERE id = ${id} AND archived_at IS NULL
  `;

  if (normalized === "contacté") {
    await createInitialFollowUp(id);
  }
}

export async function createInitialFollowUp(prospectId: number) {
  return createFollowUpIfMissing({
    prospectId,
    daysFromNow: 3,
    templateKey: "relance_j3",
    notes: "Brouillon de première relance à préparer après le premier contact.",
  });
}

export async function createFollowUpIfMissing({
  prospectId,
  daysFromNow,
  templateKey,
  notes,
}: {
  prospectId: number;
  daysFromNow: number;
  templateKey: string;
  notes: string;
}) {
  await ensureCrmTables();
  const sql = getNeonClient();
  const existing = (await sql`
    SELECT id
    FROM follow_ups
    WHERE prospect_id = ${prospectId} AND template_key = ${templateKey}
    LIMIT 1
  `) as Array<{ id: number }>;

  if (existing.length) return null;

  const rows = (await sql`
    INSERT INTO follow_ups (prospect_id, type, due_date, status, channel, template_key, notes)
    VALUES (
      ${prospectId},
      ${"relance"},
      NOW() + (${daysFromNow}::text || ' days')::interval,
      ${"prévue"},
      ${"email"},
      ${templateKey},
      ${notes}
    )
    RETURNING *
  `) as FollowUpRow[];

  await syncProspectNextFollowUp(prospectId);
  return rows[0] ?? null;
}

export async function updateFollowUpStatus(id: number, status: FollowUpStatus) {
  await ensureCrmTables();
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE follow_ups
    SET
      status = ${status},
      sent_at = CASE WHEN ${status} = 'envoyée' THEN NOW() ELSE sent_at END
    WHERE id = ${id}
    RETURNING *
  `) as FollowUpRow[];

  const followUp = rows[0] ?? null;
  if (!followUp) return null;

  if (status === "envoyée") {
    if (followUp.template_key === "relance_j3") {
      await createFollowUpIfMissing({
        prospectId: followUp.prospect_id,
        daysFromNow: 10,
        templateKey: "relance_j10",
        notes: "Brouillon de deuxième relance à personnaliser avant envoi.",
      });
    }
    if (followUp.template_key === "relance_j10") {
      await createFollowUpIfMissing({
        prospectId: followUp.prospect_id,
        daysFromNow: 20,
        templateKey: "relance_j20",
        notes: "Brouillon de dernière relance à personnaliser avant envoi.",
      });
    }
  }

  await syncProspectNextFollowUp(followUp.prospect_id);
  return followUp;
}

export async function syncProspectNextFollowUp(prospectId: number) {
  await ensureCrmTables();
  const sql = getNeonClient();
  await sql`
    UPDATE crm_prospects
    SET next_follow_up_at = (
      SELECT MIN(due_date)
      FROM follow_ups
      WHERE prospect_id = ${prospectId} AND status = 'prévue'
    ),
    status = CASE
      WHEN status IN ('client', 'perdu', 'rendez-vous') THEN status
      WHEN (
        SELECT MIN(due_date)
        FROM follow_ups
        WHERE prospect_id = ${prospectId} AND status = 'prévue'
      ) IS NOT NULL THEN 'relance prévue'
      ELSE status
    END,
    updated_at = NOW()
    WHERE id = ${prospectId}
  `;
}

export async function getCrmDashboard() {
  await ensureCrmTables();
  const sql = getNeonClient();
  const [summaryRows, statusRows, sectorRows, overdueRows, actionRows] = await Promise.all([
    sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'nouveau')::int AS nouveaux,
        COUNT(*) FILTER (WHERE status = 'contacté')::int AS contactes,
        COUNT(*) FILTER (WHERE status = 'rendez-vous')::int AS rendez_vous,
        COUNT(*) FILTER (WHERE status = 'client')::int AS clients,
        COUNT(*) FILTER (WHERE status = 'perdu')::int AS perdus,
        COUNT(*) FILTER (WHERE next_follow_up_at::date <= NOW()::date AND status NOT IN ('client', 'perdu'))::int AS relances_aujourdhui,
        ROUND(
          COALESCE(
            COUNT(*) FILTER (WHERE status IN ('rendez-vous', 'client'))::numeric
            / NULLIF(COUNT(*) FILTER (WHERE status IN ('contacté', 'relance prévue', 'rendez-vous', 'client', 'perdu')), 0),
            0
          ) * 100,
          1
        ) AS conversion_contact_rdv,
        ROUND(
          COALESCE(
            COUNT(*) FILTER (WHERE status = 'client')::numeric
            / NULLIF(COUNT(*) FILTER (WHERE status IN ('rendez-vous', 'client', 'perdu')), 0),
            0
          ) * 100,
          1
        ) AS conversion_rdv_client
      FROM crm_prospects
      WHERE archived_at IS NULL
    `,
    sql`
      SELECT status, COUNT(*)::int AS count
      FROM crm_prospects
      WHERE archived_at IS NULL
      GROUP BY status
      ORDER BY count DESC
    `,
    sql`
      SELECT COALESCE(NULLIF(sector, ''), 'Non renseigné') AS sector, COUNT(*)::int AS count
      FROM crm_prospects
      WHERE archived_at IS NULL
      GROUP BY COALESCE(NULLIF(sector, ''), 'Non renseigné')
      ORDER BY count DESC
      LIMIT 12
    `,
    sql`
      SELECT f.*, p.company_name
      FROM follow_ups f
      JOIN crm_prospects p ON p.id = f.prospect_id
      WHERE f.status = 'prévue' AND f.due_date < NOW() AND p.archived_at IS NULL
      ORDER BY f.due_date ASC
      LIMIT 12
    `,
    sql`
      SELECT id, company_name, status, updated_at, next_follow_up_at
      FROM crm_prospects
      WHERE archived_at IS NULL
      ORDER BY updated_at DESC
      LIMIT 10
    `,
  ]);

  return {
    summary: (summaryRows as Array<{
      total: number;
      nouveaux: number;
      contactes: number;
      rendez_vous: number;
      clients: number;
      perdus: number;
      relances_aujourdhui: number;
      conversion_contact_rdv: string;
      conversion_rdv_client: string;
    }>)[0] ?? {
      total: 0,
      nouveaux: 0,
      contactes: 0,
      rendez_vous: 0,
      clients: 0,
      perdus: 0,
      relances_aujourdhui: 0,
      conversion_contact_rdv: "0",
      conversion_rdv_client: "0",
    },
    byStatus: statusRows as Array<{ status: string; count: number }>,
    bySector: sectorRows as Array<{ sector: string; count: number }>,
    overdueFollowUps: overdueRows as Array<FollowUpRow & { company_name: string }>,
    latestActions: actionRows as Array<Pick<ProspectRow, "id" | "company_name" | "status" | "updated_at" | "next_follow_up_at">>,
  };
}

export async function findDuplicateProspects(items: ProspectImportInput[]) {
  await ensureCrmTables();
  const sql = getNeonClient();
  const emails = items.map((item) => item.email?.trim().toLowerCase()).filter(Boolean);
  const websites = items.map((item) => normalizeWebsite(item.website)?.toLowerCase()).filter(Boolean);

  if (!emails.length && !websites.length) return [];

  return (await sql`
    SELECT id, company_name, email, website
    FROM crm_prospects
    WHERE archived_at IS NULL
      AND (
        (${emails}::text[] <> ARRAY[]::text[] AND LOWER(COALESCE(email, '')) = ANY(${emails}::text[]))
        OR (${websites}::text[] <> ARRAY[]::text[] AND LOWER(COALESCE(website, '')) = ANY(${websites}::text[]))
      )
  `) as Array<Pick<ProspectRow, "id" | "company_name" | "email" | "website">>;
}

export async function importProspects(items: ProspectImportInput[]) {
  const duplicates = await findDuplicateProspects(items);
  const duplicateEmails = new Set(duplicates.map((item) => item.email?.toLowerCase()).filter(Boolean));
  const duplicateWebsites = new Set(duplicates.map((item) => item.website?.toLowerCase()).filter(Boolean));
  const created: ProspectRow[] = [];
  const skipped: ProspectImportInput[] = [];

  for (const item of items) {
    const website = normalizeWebsite(item.website);
    const email = item.email?.trim().toLowerCase();
    const isDuplicate = (email && duplicateEmails.has(email)) || (website && duplicateWebsites.has(website.toLowerCase()));
    if (isDuplicate) {
      skipped.push(item);
      continue;
    }

    const prospect = await createProspect({
      ...item,
      website: website ?? undefined,
      source: "import-google-sheets",
      status: "nouveau",
    });
    if (prospect) created.push(prospect);
  }

  return { created, skipped, duplicates };
}

function validateProspectInput(input: ProspectInput) {
  if (!input.companyName?.trim()) {
    throw new Error("Le nom de l'entreprise est obligatoire.");
  }
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    throw new Error("Email invalide.");
  }
  if (input.status && !prospectStatuses.includes(input.status)) {
    throw new Error("Statut prospect invalide.");
  }
}

function normalizeStatus(status?: ProspectStatus) {
  return status && prospectStatuses.includes(status) ? status : "nouveau";
}

function normalizeScore(score?: number) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score ?? 0)));
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeWebsite(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
}
