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
