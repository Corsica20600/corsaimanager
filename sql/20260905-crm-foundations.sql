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
  kind TEXT NOT NULL CHECK (kind IN ('REPLIED','BOUNCED','REJECTED','DO_NOT_CONTACT')),
  occurred_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  payload_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_system,event_id)
);
CREATE INDEX IF NOT EXISTS idx_crm_contact_events_prospect ON crm_contact_events(prospect_id,occurred_at DESC);
-- Deliberately no conversion of status='perdu', no backfill of IDs 155/156.
COMMIT;
