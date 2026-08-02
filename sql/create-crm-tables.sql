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
