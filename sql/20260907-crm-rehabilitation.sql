-- Additive, deliberately does not seed or modify historical prospects.
CREATE TABLE IF NOT EXISTS crm_rehabilitation_jobs (
  prospect_id BIGINT PRIMARY KEY REFERENCES crm_prospects(id) ON DELETE RESTRICT,
  state TEXT NOT NULL DEFAULT 'WAITING' CHECK (state IN ('WAITING','RUNNING','RETRY','COMPLETED','EXHAUSTED')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lease_token TEXT,
  lease_until TIMESTAMPTZ,
  checkpoint JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
-- Result application receipt; nullable for jobs prepared before this extension.
ALTER TABLE crm_rehabilitation_jobs ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;
ALTER TABLE crm_rehabilitation_jobs ADD COLUMN IF NOT EXISTS application_key TEXT;
ALTER TABLE crm_rehabilitation_jobs ADD COLUMN IF NOT EXISTS application_result JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_rehabilitation_application_key ON crm_rehabilitation_jobs(application_key)
  WHERE application_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_rehabilitation_due ON crm_rehabilitation_jobs(next_attempt_at,prospect_id)
  WHERE state IN ('WAITING','RETRY','RUNNING');
CREATE TABLE IF NOT EXISTS crm_rehabilitation_cursor (
  name TEXT PRIMARY KEY CHECK (name = 'historical-v1'),
  last_id BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS crm_rehabilitation_attempts (
  prospect_id BIGINT NOT NULL REFERENCES crm_rehabilitation_jobs(prospect_id) ON DELETE RESTRICT,
  lease_token TEXT NOT NULL,
  outcome TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(prospect_id,lease_token)
);
