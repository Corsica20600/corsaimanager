CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS lead_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT,
  summary TEXT,
  diagnosis TEXT,
  proposed_solution TEXT,
  scope TEXT,
  deliverables TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  estimated_timeline TEXT,
  estimated_budget TEXT,
  next_steps TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  ai_model TEXT,
  raw_ai_response JSONB
);

