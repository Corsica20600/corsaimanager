-- TEST BASELINE ONLY: consolidated pre-rehabilitation schema, 2026-09-07.
-- Historical SQL files are immutable references; never executed by release tests.
-- Contact-event CHECK is created once with the already established email event kinds.
CREATE TABLE IF NOT EXISTS crm_prospects (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  siren_or_siret TEXT,
  vat_number TEXT,
  country TEXT,
  region TEXT,
  department TEXT,
  city TEXT,
  sector TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau',
  score INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  ai_score INTEGER,
  audit_summary TEXT,
  suggested_email_subject TEXT,
  suggested_email_body TEXT,
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_commercial_actions (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'à valider',
  title TEXT,
  body TEXT,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_email_drafts (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'à_valider',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_ai_audits (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE CASCADE,
  score INTEGER,
  summary TEXT,
  recommendations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS ai_score INTEGER;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS audit_summary TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS suggested_email_subject TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS suggested_email_body TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS siren_or_siret TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE crm_prospects ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE crm_commercial_actions ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE crm_email_drafts ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

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
);

CREATE INDEX IF NOT EXISTS idx_crm_prospects_email ON crm_prospects (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_crm_prospects_website ON crm_prospects (LOWER(website));
CREATE INDEX IF NOT EXISTS idx_crm_prospects_email_raw ON crm_prospects (email);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_website_raw ON crm_prospects (website);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_status ON crm_prospects (status);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_source ON crm_prospects (source);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_created_at ON crm_prospects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_country ON crm_prospects (country);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_region ON crm_prospects (region);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_department ON crm_prospects (department);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_sector ON crm_prospects (sector);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_city ON crm_prospects (city);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_next_follow_up ON crm_prospects (next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_archived ON crm_prospects (archived_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_prospect ON follow_ups (prospect_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_status ON follow_ups (due_date, status);
CREATE INDEX IF NOT EXISTS idx_crm_commercial_actions_prospect ON crm_commercial_actions (prospect_id);
CREATE INDEX IF NOT EXISTS idx_crm_commercial_actions_status ON crm_commercial_actions (status);
CREATE INDEX IF NOT EXISTS idx_crm_commercial_actions_created_at ON crm_commercial_actions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_commercial_actions_prospect_type_created ON crm_commercial_actions (prospect_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_email_drafts_prospect ON crm_email_drafts (prospect_id);
CREATE INDEX IF NOT EXISTS idx_crm_email_drafts_status ON crm_email_drafts (status);
CREATE INDEX IF NOT EXISTS idx_crm_email_drafts_prospect_source_created ON crm_email_drafts (prospect_id, source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_ai_audits_prospect ON crm_ai_audits (prospect_id);
CREATE INDEX IF NOT EXISTS idx_crm_ai_audits_source ON crm_ai_audits (source);
CREATE INDEX IF NOT EXISTS idx_crm_ai_audits_prospect_source_created ON crm_ai_audits (prospect_id, source, created_at DESC);

-- Additive foundations. Apply once before deploying the accompanying application.
BEGIN;
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);
ALTER TABLE crm_prospects
  ADD COLUMN IF NOT EXISTS do_not_contact BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS do_not_contact_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS do_not_contact_reason TEXT,
  ADD COLUMN IF NOT EXISTS do_not_contact_source TEXT,
  ADD COLUMN IF NOT EXISTS source_system TEXT,
  ADD COLUMN IF NOT EXISTS source_entity_id TEXT,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS commercial_score INTEGER CHECK (commercial_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS emma_summary TEXT,
  ADD COLUMN IF NOT EXISTS provenance JSONB,
  ADD COLUMN IF NOT EXISTS origin_metadata JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_source_identity ON crm_prospects(source_system,source_entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_import_key ON crm_prospects(source_system,idempotency_key);
CREATE TABLE IF NOT EXISTS crm_contact_events (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE RESTRICT,
  source_system TEXT NOT NULL,
  event_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('REPLIED','BOUNCED','REJECTED','DO_NOT_CONTACT','EMAIL_SENT','EMAIL_REPLIED','EMAIL_BOUNCED','EMAIL_REJECTED','FOLLOW_UP_SENT','FOLLOW_UP_SKIPPED','PROSPECT_DORMANT')),
  occurred_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  payload_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_system,event_id)
);
CREATE INDEX IF NOT EXISTS idx_crm_contact_events_prospect ON crm_contact_events(prospect_id,occurred_at DESC);
-- Deliberately no conversion of status='perdu', no backfill of IDs 155/156.
COMMIT;

BEGIN;
ALTER TABLE crm_prospects
 ADD COLUMN IF NOT EXISTS commercial_state TEXT,
 ADD COLUMN IF NOT EXISTS next_action_at TIMESTAMPTZ,
 ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ,
 ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
 ADD COLUMN IF NOT EXISTS dormant_at TIMESTAMPTZ,
 ADD COLUMN IF NOT EXISTS follow_up_count INTEGER NOT NULL DEFAULT 0,
 ADD COLUMN IF NOT EXISTS opportunity_suggested BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE crm_contact_events ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';
-- Existing kinds remain accepted for deployed clients during transition.
COMMIT;

CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  activity TEXT,
  need TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'audit-form',
  status TEXT NOT NULL DEFAULT 'new',
  score INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'low',
  score_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  last_contact_at TIMESTAMPTZ,
  notes TEXT,
  reminder_step INTEGER NOT NULL DEFAULT 0,
  reminder_last_sent_at TIMESTAMPTZ,
  ai_summary TEXT,
  ai_qualification TEXT,
  ai_detected_needs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ai_urgency TEXT,
  ai_next_action TEXT,
  ai_suggested_reply TEXT,
  ai_confidence INTEGER,
  ai_processed_at TIMESTAMPTZ,
  is_spam BOOLEAN NOT NULL DEFAULT FALSE,
  review_needed BOOLEAN NOT NULL DEFAULT FALSE,
  spam_score INTEGER NOT NULL DEFAULT 0,
  spam_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  next_action_suggestion TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pipeline_stage TEXT NOT NULL DEFAULT 'new'
);

-- Backward-compatible fields used in current app:
ALTER TABLE leads ADD COLUMN IF NOT EXISTS nom TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS telephone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS entreprise TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS activite TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS besoin TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS reminder_step INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS reminder_last_sent_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_qualification TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_detected_needs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_urgency TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_next_action TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_suggested_reply TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_confidence INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS review_needed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS spam_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS spam_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action_suggestion TEXT;

CREATE TABLE IF NOT EXISTS lead_activities (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_action TEXT,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS lead_submission_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_submission_attempts_ip_created_at
ON lead_submission_attempts (ip_address, created_at DESC);

-- Additive, apply only after the existing leads and CRM foundations. No backfill.
BEGIN;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS crm_prospect_id BIGINT REFERENCES crm_prospects(id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_crm_prospect ON leads(crm_prospect_id);
COMMIT;
