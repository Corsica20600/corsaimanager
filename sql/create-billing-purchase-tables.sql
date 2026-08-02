CREATE TABLE IF NOT EXISTS billing_suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  email TEXT,
  website TEXT,
  vat_number TEXT,
  siren_or_siret TEXT,
  default_category TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (default_category IS NULL OR default_category IN ('hosting', 'domain_name', 'advertising', 'publication_fees', 'software', 'bank_fees', 'subcontracting', 'other'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_suppliers_normalized_name_unique
  ON billing_suppliers (normalized_name);

CREATE TABLE IF NOT EXISTS billing_purchase_invoices (
  id BIGSERIAL PRIMARY KEY,
  supplier_id BIGINT NOT NULL REFERENCES billing_suppliers(id) ON DELETE RESTRICT,
  entity TEXT NOT NULL DEFAULT 'CORSAIMANAGER',
  status TEXT NOT NULL DEFAULT 'NEEDS_REVIEW',
  category TEXT NOT NULL DEFAULT 'other',
  invoice_number TEXT,
  invoice_date DATE,
  due_at DATE,
  currency TEXT NOT NULL DEFAULT 'EUR',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  paid_at TIMESTAMPTZ,
  source_mailbox TEXT,
  source_message_id TEXT,
  blob_url TEXT,
  blob_path TEXT,
  ai_confidence INTEGER,
  ai_summary TEXT,
  ai_raw_extraction JSONB,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (entity IN ('CORSAIMANAGER', 'SENTIERU', 'TRAKNIO')),
  CHECK (status IN ('DETECTED', 'NEEDS_REVIEW', 'VALIDATED', 'REJECTED', 'PAID')),
  CHECK (category IN ('hosting', 'domain_name', 'advertising', 'publication_fees', 'software', 'bank_fees', 'subcontracting', 'other')),
  CHECK (subtotal_cents >= 0),
  CHECK (tax_cents >= 0),
  CHECK (total_cents >= 0),
  CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 100))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_purchase_source_message_unique
  ON billing_purchase_invoices (source_mailbox, source_message_id)
  WHERE source_mailbox IS NOT NULL AND source_message_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_purchase_supplier_number_unique
  ON billing_purchase_invoices (supplier_id, invoice_number)
  WHERE invoice_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS billing_purchase_invoice_lines (
  id BIGSERIAL PRIMARY KEY,
  purchase_invoice_id BIGINT NOT NULL REFERENCES billing_purchase_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity_milli INTEGER NOT NULL DEFAULT 1000,
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  vat_rate_basis_points INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (quantity_milli > 0),
  CHECK (unit_price_cents >= 0),
  CHECK (vat_rate_basis_points >= 0),
  CHECK (total_cents >= 0)
);

CREATE TABLE IF NOT EXISTS billing_purchase_email_imports (
  id BIGSERIAL PRIMARY KEY,
  mailbox TEXT NOT NULL,
  provider TEXT NOT NULL,
  message_id TEXT NOT NULL,
  subject TEXT,
  sender TEXT,
  received_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'SCANNED',
  purchase_invoice_id BIGINT REFERENCES billing_purchase_invoices(id) ON DELETE SET NULL,
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (provider IN ('gmail', 'imap')),
  CHECK (status IN ('SCANNED', 'IGNORED', 'EXTRACTED', 'FAILED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_purchase_email_message_unique
  ON billing_purchase_email_imports (mailbox, message_id);

CREATE TABLE IF NOT EXISTS billing_purchase_attachments (
  id BIGSERIAL PRIMARY KEY,
  purchase_invoice_id BIGINT REFERENCES billing_purchase_invoices(id) ON DELETE SET NULL,
  email_import_id BIGINT REFERENCES billing_purchase_email_imports(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  blob_url TEXT NOT NULL,
  blob_path TEXT NOT NULL,
  checksum_sha256 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (size_bytes IS NULL OR size_bytes >= 0)
);

CREATE INDEX IF NOT EXISTS idx_billing_purchase_invoices_status_created
  ON billing_purchase_invoices (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_billing_purchase_invoices_entity_status
  ON billing_purchase_invoices (entity, status);

CREATE INDEX IF NOT EXISTS idx_billing_purchase_invoices_supplier
  ON billing_purchase_invoices (supplier_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_billing_purchase_invoices_category
  ON billing_purchase_invoices (category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_billing_purchase_lines_invoice
  ON billing_purchase_invoice_lines (purchase_invoice_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_billing_purchase_attachments_invoice
  ON billing_purchase_attachments (purchase_invoice_id);
