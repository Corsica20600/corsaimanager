CREATE TABLE IF NOT EXISTS billing_settings (
  id BIGSERIAL PRIMARY KEY,
  legal_name TEXT,
  trade_name TEXT NOT NULL DEFAULT 'CorsaiManager',
  legal_status TEXT NOT NULL DEFAULT 'auto_entrepreneur',
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'France',
  siren_or_siret TEXT,
  vat_number TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  iban TEXT,
  bic TEXT,
  logo_url TEXT,
  default_currency TEXT NOT NULL DEFAULT 'EUR',
  default_vat_rate_basis_points INTEGER NOT NULL DEFAULT 0,
  default_payment_terms_days INTEGER NOT NULL DEFAULT 30,
  late_payment_penalties TEXT,
  recovery_fee_cents INTEGER NOT NULL DEFAULT 4000,
  quote_prefix TEXT NOT NULL DEFAULT 'DEV',
  invoice_prefix TEXT NOT NULL DEFAULT 'FAC',
  credit_note_prefix TEXT NOT NULL DEFAULT 'AV',
  default_quote_next_number INTEGER NOT NULL DEFAULT 1,
  default_invoice_next_number INTEGER NOT NULL DEFAULT 1,
  default_credit_note_next_number INTEGER NOT NULL DEFAULT 1,
  vat_exemption_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  vat_exemption_note TEXT NOT NULL DEFAULT 'TVA non applicable, article 293 B du CGI',
  default_terms TEXT,
  default_notes TEXT,
  pdf_primary_color TEXT NOT NULL DEFAULT '#22d3ee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_number_sequences (
  document_type TEXT NOT NULL,
  period_year INTEGER NOT NULL,
  prefix TEXT NOT NULL,
  next_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (document_type, period_year),
  CHECK (document_type IN ('quote', 'invoice', 'credit_note')),
  CHECK (next_number > 0)
);

CREATE TABLE IF NOT EXISTS billing_products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  internal_reference TEXT,
  type TEXT NOT NULL DEFAULT 'service',
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  vat_rate_basis_points INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unité',
  recurrence TEXT,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (type IN ('product', 'service')),
  CHECK (unit_price_cents >= 0),
  CHECK (vat_rate_basis_points >= 0)
);

CREATE TABLE IF NOT EXISTS billing_quotes (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE RESTRICT,
  number TEXT UNIQUE,
  public_token_hash TEXT UNIQUE,
  public_token_revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  currency TEXT NOT NULL DEFAULT 'EUR',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  deposit_cents INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  accepted_by_name TEXT,
  acceptance_ip TEXT,
  acceptance_user_agent TEXT,
  acceptance_comment TEXT,
  converted_invoice_id BIGINT,
  client_snapshot JSONB,
  billing_snapshot JSONB,
  metadata JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED', 'CANCELLED')),
  CHECK (subtotal_cents >= 0),
  CHECK (tax_cents >= 0),
  CHECK (total_cents >= 0),
  CHECK (discount_cents >= 0),
  CHECK (deposit_cents >= 0)
);

CREATE TABLE IF NOT EXISTS billing_quote_lines (
  id BIGSERIAL PRIMARY KEY,
  quote_id BIGINT NOT NULL REFERENCES billing_quotes(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES billing_products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity_milli INTEGER NOT NULL DEFAULT 1000,
  unit TEXT NOT NULL DEFAULT 'unité',
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  vat_rate_basis_points INTEGER NOT NULL DEFAULT 0,
  discount_basis_points INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (quantity_milli > 0),
  CHECK (unit_price_cents >= 0),
  CHECK (vat_rate_basis_points >= 0),
  CHECK (discount_basis_points >= 0)
);

CREATE TABLE IF NOT EXISTS billing_invoices (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE RESTRICT,
  number TEXT UNIQUE,
  origin TEXT NOT NULL DEFAULT 'MANUAL',
  quote_id BIGINT REFERENCES billing_quotes(id) ON DELETE SET NULL,
  customer_subscription_id BIGINT,
  stripe_invoice_id TEXT UNIQUE,
  stripe_invoice_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  issued_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  currency TEXT NOT NULL DEFAULT 'EUR',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  paid_cents INTEGER NOT NULL DEFAULT 0,
  remaining_cents INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  pdf_url TEXT,
  stripe_hosted_invoice_url TEXT,
  stripe_invoice_pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  reminder_disabled_at TIMESTAMPTZ,
  client_snapshot JSONB,
  billing_snapshot JSONB,
  e_invoice_platform_id TEXT,
  e_invoice_transmission_status TEXT,
  e_invoice_external_id TEXT,
  e_invoice_structured_format TEXT,
  e_invoice_recipient_status TEXT,
  e_invoice_rejection_reason TEXT,
  e_reporting_payload JSONB,
  e_invoice_transmission_log JSONB,
  metadata JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (origin IN ('MANUAL', 'QUOTE', 'SUBSCRIPTION', 'STRIPE', 'IMPORT')),
  CHECK (status IN ('DRAFT', 'FINALIZED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID', 'REFUNDED', 'CANCELLED')),
  CHECK (subtotal_cents >= 0),
  CHECK (tax_cents >= 0),
  CHECK (total_cents >= 0),
  CHECK (paid_cents >= 0),
  CHECK (remaining_cents >= 0)
);

CREATE TABLE IF NOT EXISTS billing_invoice_lines (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES billing_products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity_milli INTEGER NOT NULL DEFAULT 1000,
  unit TEXT NOT NULL DEFAULT 'unité',
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  vat_rate_basis_points INTEGER NOT NULL DEFAULT 0,
  discount_basis_points INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (quantity_milli > 0),
  CHECK (unit_price_cents >= 0),
  CHECK (vat_rate_basis_points >= 0),
  CHECK (discount_basis_points >= 0)
);

CREATE TABLE IF NOT EXISTS billing_credit_notes (
  id BIGSERIAL PRIMARY KEY,
  number TEXT UNIQUE,
  invoice_id BIGINT NOT NULL REFERENCES billing_invoices(id) ON DELETE RESTRICT,
  prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  issued_at TIMESTAMPTZ,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  pdf_url TEXT,
  client_snapshot JSONB,
  billing_snapshot JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('DRAFT', 'FINALIZED', 'SENT', 'VOID')),
  CHECK (subtotal_cents >= 0),
  CHECK (tax_cents >= 0),
  CHECK (total_cents >= 0)
);

CREATE TABLE IF NOT EXISTS billing_credit_note_lines (
  id BIGSERIAL PRIMARY KEY,
  credit_note_id BIGINT NOT NULL REFERENCES billing_credit_notes(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES billing_products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity_milli INTEGER NOT NULL DEFAULT 1000,
  unit TEXT NOT NULL DEFAULT 'unité',
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  vat_rate_basis_points INTEGER NOT NULL DEFAULT 0,
  discount_basis_points INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_payments (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE RESTRICT,
  invoice_id BIGINT REFERENCES billing_invoices(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  paid_at TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'PENDING',
  reference TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  comment TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (amount_cents >= 0),
  CHECK (method IN ('card', 'bank_transfer', 'direct_debit', 'cash', 'check', 'stripe', 'other')),
  CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'))
);

CREATE TABLE IF NOT EXISTS billing_subscription_plans (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  trial_days INTEGER NOT NULL DEFAULT 0,
  setup_fee_cents INTEGER NOT NULL DEFAULT 0,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  vat_rate_basis_points INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (price_cents >= 0),
  CHECK (setup_fee_cents >= 0),
  CHECK (trial_days >= 0),
  CHECK (frequency IN ('monthly', 'yearly'))
);

CREATE TABLE IF NOT EXISTS billing_customer_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id) ON DELETE RESTRICT,
  plan_id BIGINT REFERENCES billing_subscription_plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'INCOMPLETE',
  started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  current_period_starts_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ,
  next_invoice_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  cancellation_mode TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('INCOMPLETE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'UNPAID', 'CANCELLED', 'EXPIRED'))
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'billing_invoices_customer_subscription_fk'
  ) THEN
    ALTER TABLE billing_invoices
    ADD CONSTRAINT billing_invoices_customer_subscription_fk
    FOREIGN KEY (customer_subscription_id) REFERENCES billing_customer_subscriptions(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS billing_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id TEXT,
  source TEXT NOT NULL DEFAULT 'system',
  before_data JSONB,
  after_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source IN ('user', 'system', 'stripe', 'cron'))
);

CREATE TABLE IF NOT EXISTS billing_stripe_events (
  id BIGSERIAL PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  payload JSONB,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('received', 'processed', 'failed', 'ignored'))
);

CREATE INDEX IF NOT EXISTS idx_billing_products_active ON billing_products (is_active, archived_at);
CREATE INDEX IF NOT EXISTS idx_billing_products_reference ON billing_products (internal_reference);
CREATE INDEX IF NOT EXISTS idx_billing_quotes_prospect_status ON billing_quotes (prospect_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_quotes_number ON billing_quotes (number);
CREATE INDEX IF NOT EXISTS idx_billing_quote_lines_quote ON billing_quote_lines (quote_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_prospect_status ON billing_invoices (prospect_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_due_status ON billing_invoices (due_at, status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_number ON billing_invoices (number);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe_invoice ON billing_invoices (stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoice_lines_invoice ON billing_invoice_lines (invoice_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_billing_credit_notes_invoice ON billing_credit_notes (invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_invoice_status ON billing_payments (invoice_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_payments_prospect_paid ON billing_payments (prospect_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_subscription_plans_active ON billing_subscription_plans (is_active, archived_at);
CREATE INDEX IF NOT EXISTS idx_billing_customer_subscriptions_prospect ON billing_customer_subscriptions (prospect_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_customer_subscriptions_stripe_customer ON billing_customer_subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_entity ON billing_events (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_events_type_created ON billing_events (event_type, created_at DESC);
