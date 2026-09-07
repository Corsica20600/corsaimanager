-- Additive, apply only after the existing leads and CRM foundations. No backfill.
BEGIN;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS crm_prospect_id BIGINT REFERENCES crm_prospects(id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_crm_prospect ON leads(crm_prospect_id);
COMMIT;
