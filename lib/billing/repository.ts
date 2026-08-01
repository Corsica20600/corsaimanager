import { getNeonClient } from "../neon";
import { calculateDocumentTotals } from "./calculations";
import { assertQuoteStatusTransition, isQuoteExpired } from "./quote-status";
import { assertCreditAmountAllowed, assertInvoiceStatusTransition, assertPaymentAllowed, computeInvoiceBalance, computeInvoiceStatus } from "./invoice-status";
import { mapStripeInvoiceStatus, mapStripeSubscriptionStatus, stripeId, toIsoFromStripeTimestamp } from "./stripe-sync";
import { generateQuotePublicToken, hashQuotePublicToken } from "./quote-token";
import { buildBillingSnapshot, buildClientSnapshot } from "./quote-snapshots";
import { validateCreditNoteDraftInput, validateInvoiceDraftInput, validatePaymentInput } from "./invoice-validation";
import { validateQuoteDraftInput } from "./quote-validation";
import type Stripe from "stripe";
import type {
  BillingDashboardSummary,
  BillingCreditNoteLineRow,
  BillingCreditNoteListRow,
  BillingCreditNoteRow,
  BillingCustomerSubscriptionRow,
  BillingEventRow,
  BillingInvoiceLineRow,
  BillingInvoiceListRow,
  BillingInvoiceRow,
  BillingPaymentListRow,
  BillingPaymentRow,
  BillingProductRow,
  BillingQuoteLineRow,
  BillingQuoteListRow,
  BillingQuoteRow,
  BillingSettingsRow,
  BillingStripeEventRow,
  BillingSubscriptionPlanRow,
  CreditNoteDetails,
  CreditNoteDraftInput,
  InvoiceDetails,
  InvoiceDraftInput,
  InvoiceFilters,
  PaginatedBillingQuotes,
  PaginatedBillingCreditNotes,
  PaginatedBillingInvoices,
  PaginatedBillingPayments,
  PaymentInput,
  QuoteDetails,
  QuoteDraftInput,
  QuoteFilters,
  QuoteProspectOption,
  QuoteStatus,
} from "./types";

let billingTablesReady: Promise<void> | null = null;

export async function ensureBillingTables() {
  billingTablesReady ??= ensureBillingTablesOnce();
  return billingTablesReady;
}

async function ensureBillingTablesOnce() {
  const sql = getNeonClient();

  await sql`
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
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS billing_number_sequences (
      document_type TEXT NOT NULL,
      period_year INTEGER NOT NULL,
      prefix TEXT NOT NULL,
      next_number INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (document_type, period_year)
    )
  `;

  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
    )
  `;

  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS billing_stripe_events (
      id BIGSERIAL PRIMARY KEY,
      stripe_event_id TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'received',
      payload JSONB,
      processed_at TIMESTAMPTZ,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
  `;

  await createBillingIndexes();
}

export async function assertProspectIsBillingClient(prospectId: number) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`
    SELECT id, company_name, status
    FROM crm_prospects
    WHERE id = ${prospectId} AND archived_at IS NULL
    LIMIT 1
  `) as Array<{ id: number; company_name: string; status: string }>;
  const prospect = rows[0];
  if (!prospect) throw new Error("Client introuvable.");
  if (prospect.status !== "client") throw new Error("Le prospect doit avoir le statut client pour la facturation.");
  return prospect;
}

export async function assertProspectCanReceiveQuote(prospectId: number) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`
    SELECT id, company_name, contact_name, email, phone, country, region, department, city, status, website
    FROM crm_prospects
    WHERE id = ${prospectId} AND archived_at IS NULL
    LIMIT 1
  `) as QuoteDetails["prospect"][];
  const prospect = rows[0];
  if (!prospect) throw new Error("Prospect introuvable.");
  if (!prospect.company_name?.trim()) throw new Error("La raison sociale est obligatoire pour créer un devis.");
  return prospect;
}

export async function getQuoteProspectOptions(query = "", selectedId?: number | null) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const normalizedQuery = nullable(query);
  return (await sql`
    SELECT
      p.id,
      p.company_name,
      p.contact_name,
      p.email,
      p.phone,
      p.country,
      p.region,
      p.department,
      p.city,
      p.status,
      p.website,
      COUNT(q.id)::int AS quote_count
    FROM crm_prospects p
    LEFT JOIN billing_quotes q ON q.prospect_id = p.id
    WHERE p.archived_at IS NULL
      AND (
        ${normalizedQuery}::text IS NULL
        OR LOWER(p.company_name) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
        OR LOWER(COALESCE(p.contact_name, '')) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
        OR LOWER(COALESCE(p.email, '')) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
        OR p.id = ${selectedId ?? -1}
      )
    GROUP BY p.id
    ORDER BY
      CASE WHEN p.id = ${selectedId ?? -1} THEN 0 ELSE 1 END,
      CASE WHEN p.status = 'client' THEN 0 ELSE 1 END,
      p.updated_at DESC
    LIMIT 100
  `) as QuoteProspectOption[];
}

export async function getBillingSettings() {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`
    SELECT *
    FROM billing_settings
    ORDER BY id ASC
    LIMIT 1
  `) as BillingSettingsRow[];
  return rows[0] ?? null;
}

export async function upsertBillingSettings(input: Partial<BillingSettingsRow>) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`
    INSERT INTO billing_settings (
      id,
      legal_name,
      trade_name,
      address_line1,
      address_line2,
      postal_code,
      city,
      country,
      siren_or_siret,
      vat_number,
      email,
      phone,
      website,
      iban,
      bic,
      logo_url,
      default_currency,
      default_vat_rate_basis_points,
      default_payment_terms_days,
      quote_prefix,
      vat_exemption_enabled,
      vat_exemption_note,
      default_terms,
      default_notes,
      pdf_primary_color
    )
    VALUES (
      1,
      ${nullable(input.legal_name)},
      ${textOrDefault(input.trade_name, "CorsaiManager")},
      ${nullable(input.address_line1)},
      ${nullable(input.address_line2)},
      ${nullable(input.postal_code)},
      ${nullable(input.city)},
      ${textOrDefault(input.country, "France")},
      ${nullable(input.siren_or_siret)},
      ${nullable(input.vat_number)},
      ${nullable(input.email)},
      ${nullable(input.phone)},
      ${nullable(input.website)},
      ${nullable(input.iban)},
      ${nullable(input.bic)},
      ${nullable(input.logo_url)},
      ${textOrDefault(input.default_currency, "EUR")},
      ${integerOrDefault(input.default_vat_rate_basis_points, 0)},
      ${integerOrDefault(input.default_payment_terms_days, 30)},
      ${textOrDefault(input.quote_prefix, "DEV")},
      ${input.vat_exemption_enabled ?? true},
      ${textOrDefault(input.vat_exemption_note, "TVA non applicable, article 293 B du CGI")},
      ${nullable(input.default_terms)},
      ${nullable(input.default_notes)},
      ${textOrDefault(input.pdf_primary_color, "#22d3ee")}
    )
    ON CONFLICT (id) DO UPDATE SET
      legal_name = EXCLUDED.legal_name,
      trade_name = EXCLUDED.trade_name,
      address_line1 = EXCLUDED.address_line1,
      address_line2 = EXCLUDED.address_line2,
      postal_code = EXCLUDED.postal_code,
      city = EXCLUDED.city,
      country = EXCLUDED.country,
      siren_or_siret = EXCLUDED.siren_or_siret,
      vat_number = EXCLUDED.vat_number,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      website = EXCLUDED.website,
      iban = EXCLUDED.iban,
      bic = EXCLUDED.bic,
      logo_url = EXCLUDED.logo_url,
      default_currency = EXCLUDED.default_currency,
      default_vat_rate_basis_points = EXCLUDED.default_vat_rate_basis_points,
      default_payment_terms_days = EXCLUDED.default_payment_terms_days,
      quote_prefix = EXCLUDED.quote_prefix,
      vat_exemption_enabled = EXCLUDED.vat_exemption_enabled,
      vat_exemption_note = EXCLUDED.vat_exemption_note,
      default_terms = EXCLUDED.default_terms,
      default_notes = EXCLUDED.default_notes,
      pdf_primary_color = EXCLUDED.pdf_primary_color,
      updated_at = NOW()
    RETURNING *
  `) as BillingSettingsRow[];
  return rows[0] ?? null;
}

export async function getBillingProducts() {
  await ensureBillingTables();
  const sql = getNeonClient();
  return (await sql`
    SELECT *
    FROM billing_products
    WHERE archived_at IS NULL
    ORDER BY is_active DESC, name ASC
  `) as BillingProductRow[];
}

export async function listBillingProducts({
  query = "",
  status = "active",
}: {
  query?: string;
  status?: "active" | "archived" | "all";
} = {}) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const normalizedQuery = nullable(query);
  return (await sql`
    SELECT *
    FROM billing_products
    WHERE
      (
        ${status}::text = 'all'
        OR (${status}::text = 'active' AND archived_at IS NULL AND is_active = TRUE)
        OR (${status}::text = 'archived' AND (archived_at IS NOT NULL OR is_active = FALSE))
      )
      AND (
        ${normalizedQuery}::text IS NULL
        OR LOWER(name) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
        OR LOWER(COALESCE(description, '')) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
        OR LOWER(COALESCE(internal_reference, '')) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
      )
    ORDER BY archived_at NULLS FIRST, name ASC
    LIMIT 200
  `) as BillingProductRow[];
}

export async function upsertBillingProduct(input: Partial<BillingProductRow> & { name: string }) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const id = Number.isInteger(input.id) && input.id ? input.id : null;
  const values = {
    name: input.name.trim(),
    description: nullable(input.description),
    internal_reference: nullable(input.internal_reference),
    type: input.type === "product" ? "product" : "service",
    unit_price_cents: integerOrDefault(input.unit_price_cents, 0),
    vat_rate_basis_points: integerOrDefault(input.vat_rate_basis_points, 0),
    unit: textOrDefault(input.unit, "unité"),
    is_active: input.is_active ?? true,
    archived_at: input.archived_at ?? null,
  };
  const rows = id
    ? ((await sql`
        UPDATE billing_products
        SET name = ${values.name},
            description = ${values.description},
            internal_reference = ${values.internal_reference},
            type = ${values.type},
            unit_price_cents = ${values.unit_price_cents},
            vat_rate_basis_points = ${values.vat_rate_basis_points},
            unit = ${values.unit},
            is_active = ${values.is_active},
            archived_at = ${values.archived_at},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `) as BillingProductRow[])
    : ((await sql`
        INSERT INTO billing_products (
          name,
          description,
          internal_reference,
          type,
          unit_price_cents,
          vat_rate_basis_points,
          unit,
          is_active,
          archived_at
        )
        VALUES (
          ${values.name},
          ${values.description},
          ${values.internal_reference},
          ${values.type},
          ${values.unit_price_cents},
          ${values.vat_rate_basis_points},
          ${values.unit},
          ${values.is_active},
          ${values.archived_at}
        )
        RETURNING *
      `) as BillingProductRow[]);
  return rows[0] ?? null;
}

export async function setBillingProductArchived(id: number, archived: boolean) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_products
    SET archived_at = CASE WHEN ${archived}::boolean THEN NOW() ELSE NULL END,
        is_active = CASE WHEN ${archived}::boolean THEN FALSE ELSE TRUE END,
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as BillingProductRow[];
  return rows[0] ?? null;
}

export async function getQuotes(filters: QuoteFilters = {}): Promise<PaginatedBillingQuotes> {
  await ensureBillingTables();
  const sql = getNeonClient();
  const query = nullable(filters.query);
  const status = filters.status && filters.status !== "all" ? filters.status : null;
  const pageSize = normalizePageSize(filters.pageSize);
  const page = normalizePage(filters.page);
  const offset = (page - 1) * pageSize;
  const sort = filters.sort ?? "created_desc";
  const rows = (await sql`
    SELECT
      q.*,
      p.company_name,
      p.contact_name,
      p.email,
      COUNT(l.id)::int AS line_count,
      COUNT(*) OVER()::int AS total_count
    FROM billing_quotes q
    JOIN crm_prospects p ON p.id = q.prospect_id
    LEFT JOIN billing_quote_lines l ON l.quote_id = q.id
    WHERE p.archived_at IS NULL
      AND (${status}::text IS NULL OR q.status = ${status})
      AND (
        ${query}::text IS NULL
        OR LOWER(COALESCE(q.number, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(p.company_name) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(p.contact_name, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(p.email, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
      )
    GROUP BY q.id, p.company_name, p.contact_name, p.email
    ORDER BY
      CASE WHEN ${sort} = 'created_asc' THEN q.created_at END ASC,
      CASE WHEN ${sort} = 'expires_asc' THEN q.expires_at END ASC NULLS LAST,
      CASE WHEN ${sort} = 'expires_desc' THEN q.expires_at END DESC NULLS LAST,
      CASE WHEN ${sort} = 'amount_asc' THEN q.total_cents END ASC,
      CASE WHEN ${sort} = 'amount_desc' THEN q.total_cents END DESC,
      q.created_at DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `) as Array<BillingQuoteListRow & { total_count: number }>;
  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map(stripTotalCount),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getQuoteDetails(id: number): Promise<QuoteDetails | null> {
  await ensureBillingTables();
  const sql = getNeonClient();
  const quoteRows = (await sql`
    SELECT *
    FROM billing_quotes
    WHERE id = ${id}
    LIMIT 1
  `) as QuoteDetails["quote"][];
  const quote = quoteRows[0];
  if (!quote) return null;
  const [lineRows, prospectRows] = await Promise.all([
    sql`
      SELECT *
      FROM billing_quote_lines
      WHERE quote_id = ${id}
      ORDER BY sort_order ASC, id ASC
    `,
    sql`
      SELECT id, company_name, contact_name, email, phone, country, region, department, city, status, website
      FROM crm_prospects
      WHERE id = ${quote.prospect_id}
      LIMIT 1
    `,
  ]);
  const lines = lineRows as BillingQuoteLineRow[];
  const prospect = (prospectRows as QuoteDetails["prospect"][])[0];
  if (!prospect) return null;
  return { quote, lines, prospect };
}

export async function getQuoteByPublicToken(token: string): Promise<QuoteDetails | null> {
  await ensureBillingTables();
  const tokenHash = hashQuotePublicToken(token);
  const sql = getNeonClient();
  const rows = (await sql`
    SELECT id
    FROM billing_quotes
    WHERE public_token_hash = ${tokenHash}
      AND public_token_revoked_at IS NULL
    LIMIT 1
  `) as Array<{ id: number }>;
  return rows[0] ? getQuoteDetails(rows[0].id) : null;
}

export async function createQuoteDraft(input: QuoteDraftInput) {
  const normalized = validateQuoteDraftInput(input);
  await assertProspectCanReceiveQuote(normalized.prospect_id);
  await ensureBillingTables();
  const totals = calculateDocumentTotals(normalized.lines);
  const sql = getNeonClient();
  const rows = (await sql.transaction((tx) => [
    tx`
      INSERT INTO billing_quotes (
        prospect_id,
        expires_at,
        status,
        currency,
        subtotal_cents,
        tax_cents,
        total_cents,
        discount_cents,
        notes,
        terms
      )
      VALUES (
        ${normalized.prospect_id},
        ${normalized.expires_at},
        'DRAFT',
        ${normalized.currency},
        ${totals.subtotal_cents},
        ${totals.tax_cents},
        ${totals.total_cents},
        ${totals.discount_cents},
        ${normalized.notes},
        ${normalized.terms}
      )
      RETURNING *
    `,
  ])) as [QuoteDetails["quote"][]];
  const quote = rows[0][0];
  if (!quote) throw new Error("Création du devis impossible.");
  await replaceQuoteLines(quote.id, normalized.lines);
  await createBillingEvent({
    eventType: "quote.created",
    entityType: "quote",
    entityId: String(quote.id),
    source: "user",
    afterData: { status: "DRAFT", total_cents: totals.total_cents },
  });
  return quote;
}

export async function updateQuoteDraft(id: number, input: QuoteDraftInput) {
  const normalized = validateQuoteDraftInput(input);
  await assertProspectCanReceiveQuote(normalized.prospect_id);
  await ensureBillingTables();
  const current = await getQuoteDetails(id);
  if (!current) throw new Error("Devis introuvable.");
  if (current.quote.status !== "DRAFT") throw new Error("Seul un devis brouillon peut être modifié.");
  if (current.quote.number) throw new Error("Un devis émis ne peut plus être modifié comme brouillon.");
  const totals = calculateDocumentTotals(normalized.lines);
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_quotes
    SET
      prospect_id = ${normalized.prospect_id},
      expires_at = ${normalized.expires_at},
      currency = ${normalized.currency},
      subtotal_cents = ${totals.subtotal_cents},
      tax_cents = ${totals.tax_cents},
      total_cents = ${totals.total_cents},
      discount_cents = ${totals.discount_cents},
      notes = ${normalized.notes},
      terms = ${normalized.terms},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as QuoteDetails["quote"][];
  await replaceQuoteLines(id, normalized.lines);
  await createBillingEvent({
    eventType: "quote.updated",
    entityType: "quote",
    entityId: String(id),
    source: "user",
    beforeData: { total_cents: current.quote.total_cents },
    afterData: { total_cents: totals.total_cents },
  });
  return rows[0] ?? null;
}

export async function deleteDraftQuote(id: number) {
  await ensureBillingTables();
  const details = await getQuoteDetails(id);
  if (!details) throw new Error("Devis introuvable.");
  if (details.quote.status !== "DRAFT" || details.quote.number || details.quote.sent_at) {
    throw new Error("Seul un brouillon jamais envoyé peut être supprimé.");
  }
  const sql = getNeonClient();
  await sql`DELETE FROM billing_quotes WHERE id = ${id}`;
}

export async function duplicateQuoteAsDraft(id: number) {
  const details = await getQuoteDetails(id);
  if (!details) throw new Error("Devis introuvable.");
  const quote = await createQuoteDraft({
    prospect_id: details.quote.prospect_id,
    currency: details.quote.currency,
    expires_at: null,
    notes: details.quote.notes,
    terms: details.quote.terms,
    lines: details.lines.map((line, index) => ({
      product_id: line.product_id,
      description: line.description,
      quantity_milli: line.quantity_milli,
      unit: line.unit,
      unit_price_cents: line.unit_price_cents,
      vat_rate_basis_points: line.vat_rate_basis_points,
      discount_basis_points: line.discount_basis_points,
      sort_order: index,
    })),
  });
  await createBillingEvent({
    eventType: "quote.duplicated",
    entityType: "quote",
    entityId: String(quote.id),
    source: "user",
    metadata: { source_quote_id: id },
  });
  return quote;
}

export async function cancelQuote(id: number) {
  return markQuoteStatus(id, "CANCELLED");
}

export async function markQuoteStatus(id: number, status: QuoteStatus, extra?: Record<string, unknown>) {
  const details = await getQuoteDetails(id);
  if (!details) throw new Error("Devis introuvable.");
  const nextStatus = status === "EXPIRED" && details.quote.status === "DRAFT" ? "CANCELLED" : status;
  assertQuoteStatusTransition(details.quote.status, nextStatus);
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_quotes
    SET
      status = ${nextStatus},
      accepted_at = CASE WHEN ${nextStatus} = 'ACCEPTED' THEN NOW() ELSE accepted_at END,
      rejected_at = CASE WHEN ${nextStatus} = 'REJECTED' THEN NOW() ELSE rejected_at END,
      accepted_by_name = COALESCE(${typeof extra?.accepted_by_name === "string" ? extra.accepted_by_name : null}, accepted_by_name),
      acceptance_comment = COALESCE(${typeof extra?.acceptance_comment === "string" ? extra.acceptance_comment : null}, acceptance_comment),
      acceptance_ip = COALESCE(${typeof extra?.acceptance_ip === "string" ? extra.acceptance_ip : null}, acceptance_ip),
      acceptance_user_agent = COALESCE(${typeof extra?.acceptance_user_agent === "string" ? extra.acceptance_user_agent : null}, acceptance_user_agent),
      updated_at = NOW()
    WHERE id = ${id}
      AND status = ${details.quote.status}
    RETURNING *
  `) as QuoteDetails["quote"][];
  const updated = rows[0];
  if (!updated) throw new Error("Le devis a déjà changé de statut.");
  await createBillingEvent({
    eventType: `quote.${nextStatus.toLowerCase()}`,
    entityType: "quote",
    entityId: String(id),
    source: "user",
    beforeData: { status: details.quote.status },
    afterData: { status: nextStatus },
    metadata: extra,
  });
  return updated;
}

export async function syncQuoteExpiration(id: number) {
  const details = await getQuoteDetails(id);
  if (!details) return null;
  if ((details.quote.status === "SENT" || details.quote.status === "VIEWED") && isQuoteExpired(details.quote.expires_at)) {
    return markQuoteStatus(id, "EXPIRED");
  }
  return details.quote;
}

export async function markQuoteViewed(details: QuoteDetails) {
  if (details.quote.status !== "SENT") return details.quote;
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_quotes
    SET status = 'VIEWED', updated_at = NOW()
    WHERE id = ${details.quote.id} AND status = 'SENT'
    RETURNING *
  `) as QuoteDetails["quote"][];
  const updated = rows[0];
  if (updated) {
    await createBillingEvent({
      eventType: "quote.viewed",
      entityType: "quote",
      entityId: String(details.quote.id),
      source: "system",
    });
  }
  return updated ?? details.quote;
}

export async function prepareQuoteForSending(id: number) {
  const details = await getQuoteDetails(id);
  if (!details) throw new Error("Devis introuvable.");
  if (details.quote.status !== "DRAFT" && details.quote.status !== "SENT" && details.quote.status !== "VIEWED") {
    throw new Error("Ce devis ne peut plus être envoyé.");
  }
  if (!details.lines.length) throw new Error("Ajoutez au moins une ligne au devis avant l'envoi.");
  if (!details.prospect.email) throw new Error("Ajoutez un email au prospect avant l'envoi.");

  const settings = await getBillingSettings();
  const token = generateQuotePublicToken();
  const tokenHash = hashQuotePublicToken(token);
  const clientSnapshot = details.quote.client_snapshot ?? buildClientSnapshot(details.prospect);
  const billingSnapshot = details.quote.billing_snapshot ?? buildBillingSnapshot(settings);
  const issuedAt = new Date();
  const prefix = settings?.quote_prefix ?? "DEV";
  const periodYear = issuedAt.getFullYear();
  const sql = getNeonClient();
  const rows = (await sql.transaction((tx) => [
    tx`
      WITH target AS (
        SELECT id, number
        FROM billing_quotes
        WHERE id = ${id}
        FOR UPDATE
      ),
      seq AS (
        INSERT INTO billing_number_sequences (document_type, period_year, prefix, next_number)
        SELECT 'quote', ${periodYear}, ${prefix}, 2
        WHERE EXISTS (SELECT 1 FROM target WHERE number IS NULL)
        ON CONFLICT (document_type, period_year)
        DO UPDATE SET
          next_number = billing_number_sequences.next_number + 1,
          prefix = EXCLUDED.prefix,
          updated_at = NOW()
        RETURNING prefix, period_year, next_number - 1 AS sequence_number
      )
      UPDATE billing_quotes q
      SET
        number = COALESCE(
          q.number,
          (
            SELECT CONCAT(seq.prefix, '-', seq.period_year, '-', LPAD(seq.sequence_number::text, 4, '0'))
            FROM seq
          )
        ),
        issued_at = COALESCE(q.issued_at, NOW()),
        public_token_hash = ${tokenHash},
        public_token_revoked_at = NULL,
        client_snapshot = COALESCE(q.client_snapshot, ${clientSnapshot}),
        billing_snapshot = COALESCE(q.billing_snapshot, ${billingSnapshot}),
        updated_at = NOW()
      FROM target
      WHERE q.id = target.id
      RETURNING q.*
    `,
  ], { isolationLevel: "Serializable" })) as [QuoteDetails["quote"][]];
  const quote = rows[0][0];
  if (!quote?.number) throw new Error("Émission du devis impossible.");
  await createBillingEvent({
    eventType: "quote.issued",
    entityType: "quote",
    entityId: String(id),
    source: "user",
    afterData: { number: quote.number },
  });
  return { quote, token };
}

export async function markQuoteSent(id: number, messageId: string | null, email: { to: string; subject: string }) {
  const details = await getQuoteDetails(id);
  if (!details) throw new Error("Devis introuvable.");
  if (details.quote.status !== "DRAFT" && details.quote.status !== "SENT" && details.quote.status !== "VIEWED") {
    throw new Error("Ce devis ne peut plus être envoyé.");
  }
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_quotes
    SET status = 'SENT',
        sent_at = NOW(),
        updated_at = NOW()
    WHERE id = ${id}
      AND status IN ('DRAFT', 'SENT', 'VIEWED')
    RETURNING *
  `) as QuoteDetails["quote"][];
  const quote = rows[0];
  if (!quote) throw new Error("Statut du devis modifié pendant l'envoi.");
  await createBillingEvent({
    eventType: details.quote.sent_at ? "quote.resent" : "quote.sent",
    entityType: "quote",
    entityId: String(id),
    source: "user",
    afterData: { status: "SENT", sent_at: new Date().toISOString() },
    metadata: { smtp_message_id: messageId, to: email.to, subject: email.subject },
  });
  return quote;
}

export async function recordQuoteSendFailure(id: number, error: string) {
  await createBillingEvent({
    eventType: "quote.send_failed",
    entityType: "quote",
    entityId: String(id),
    source: "user",
    metadata: { error: error.slice(0, 1000) },
  });
}

export async function acceptPublicQuote(id: number, input: { name: string; comment?: string | null; ip?: string | null; userAgent?: string | null }) {
  const details = await getQuoteDetails(id);
  if (!details) throw new Error("Devis introuvable.");
  if (!details.quote.expires_at || isQuoteExpired(details.quote.expires_at)) {
    if (details.quote.status === "SENT" || details.quote.status === "VIEWED") await markQuoteStatus(id, "EXPIRED");
    throw new Error("Ce devis est expiré.");
  }
  if (details.quote.status !== "SENT" && details.quote.status !== "VIEWED") {
    throw new Error("Ce devis ne peut plus être accepté.");
  }
  const name = input.name.trim();
  if (!name) throw new Error("Le nom de la personne qui accepte le devis est obligatoire.");
  return markQuoteStatus(id, "ACCEPTED", {
    accepted_by_name: name.slice(0, 200),
    acceptance_comment: input.comment?.trim().slice(0, 1000) ?? null,
    acceptance_ip: input.ip ?? null,
    acceptance_user_agent: input.userAgent?.slice(0, 300) ?? null,
  });
}

export async function rejectPublicQuote(id: number, input: { name: string; comment?: string | null; ip?: string | null; userAgent?: string | null }) {
  const details = await getQuoteDetails(id);
  if (!details) throw new Error("Devis introuvable.");
  if (!details.quote.expires_at || isQuoteExpired(details.quote.expires_at)) {
    if (details.quote.status === "SENT" || details.quote.status === "VIEWED") await markQuoteStatus(id, "EXPIRED");
    throw new Error("Ce devis est expiré.");
  }
  if (details.quote.status !== "SENT" && details.quote.status !== "VIEWED") {
    throw new Error("Ce devis ne peut plus être refusé.");
  }
  const name = input.name.trim();
  if (!name) throw new Error("Le nom de la personne qui refuse le devis est obligatoire.");
  return markQuoteStatus(id, "REJECTED", {
    accepted_by_name: name.slice(0, 200),
    acceptance_comment: input.comment?.trim().slice(0, 1000) ?? null,
    acceptance_ip: input.ip ?? null,
    acceptance_user_agent: input.userAgent?.slice(0, 300) ?? null,
  });
}

export async function getInvoices(filters: InvoiceFilters = {}): Promise<PaginatedBillingInvoices> {
  await ensureBillingTables();
  const sql = getNeonClient();
  const query = nullable(filters.query);
  const status = filters.status && filters.status !== "all" ? filters.status : null;
  const payment = filters.payment ?? "all";
  const origin = filters.origin && filters.origin !== "all" ? filters.origin : null;
  const pageSize = normalizePageSize(filters.pageSize);
  const page = normalizePage(filters.page);
  const offset = (page - 1) * pageSize;
  const sort = filters.sort ?? "issued_desc";
  const rows = (await sql`
    SELECT
      i.*,
      p.company_name,
      p.contact_name,
      p.email,
      COALESCE(SUM(cn.total_cents) FILTER (WHERE cn.status IN ('FINALIZED', 'SENT')), 0)::int AS credit_total_cents,
      COUNT(*) OVER()::int AS total_count
    FROM billing_invoices i
    JOIN crm_prospects p ON p.id = i.prospect_id
    LEFT JOIN billing_credit_notes cn ON cn.invoice_id = i.id
    WHERE p.archived_at IS NULL
      AND (${status}::text IS NULL OR i.status = ${status})
      AND (${origin}::text IS NULL OR i.origin = ${origin})
      AND (
        ${payment}::text = 'all'
        OR (${payment}::text = 'paid' AND i.remaining_cents = 0 AND i.status = 'PAID')
        OR (${payment}::text = 'partial' AND i.paid_cents > 0 AND i.remaining_cents > 0)
        OR (${payment}::text = 'unpaid' AND i.paid_cents = 0 AND i.remaining_cents > 0)
        OR (${payment}::text = 'overdue' AND i.status = 'OVERDUE')
      )
      AND (
        ${query}::text IS NULL
        OR LOWER(COALESCE(i.number, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(p.company_name) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(p.contact_name, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(p.email, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
      )
    GROUP BY i.id, p.company_name, p.contact_name, p.email
    ORDER BY
      CASE WHEN ${sort} = 'issued_asc' THEN i.issued_at END ASC NULLS LAST,
      CASE WHEN ${sort} = 'due_asc' THEN i.due_at END ASC NULLS LAST,
      CASE WHEN ${sort} = 'due_desc' THEN i.due_at END DESC NULLS LAST,
      CASE WHEN ${sort} = 'amount_asc' THEN i.total_cents END ASC,
      CASE WHEN ${sort} = 'amount_desc' THEN i.total_cents END DESC,
      i.issued_at DESC NULLS LAST,
      i.created_at DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `) as Array<BillingInvoiceListRow & { total_count: number }>;
  const total = rows[0]?.total_count ?? 0;
  return { items: rows.map(stripTotalCount), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getInvoiceDetails(id: number): Promise<InvoiceDetails | null> {
  await ensureBillingTables();
  const sql = getNeonClient();
  const invoiceRows = (await sql`SELECT * FROM billing_invoices WHERE id = ${id} LIMIT 1`) as BillingInvoiceRow[];
  const invoice = invoiceRows[0];
  if (!invoice) return null;
  const [lineRows, paymentRows, creditRows, prospectRows, quoteRows] = await Promise.all([
    sql`SELECT * FROM billing_invoice_lines WHERE invoice_id = ${id} ORDER BY sort_order ASC, id ASC`,
    sql`SELECT * FROM billing_payments WHERE invoice_id = ${id} ORDER BY paid_at DESC NULLS LAST, created_at DESC`,
    sql`SELECT * FROM billing_credit_notes WHERE invoice_id = ${id} ORDER BY issued_at DESC NULLS LAST, created_at DESC`,
    sql`
      SELECT id, company_name, contact_name, email, phone, country, region, department, city, status, website
      FROM crm_prospects
      WHERE id = ${invoice.prospect_id}
      LIMIT 1
    `,
    invoice.quote_id ? sql`SELECT * FROM billing_quotes WHERE id = ${invoice.quote_id} LIMIT 1` : Promise.resolve([]),
  ]);
  const prospect = (prospectRows as QuoteDetails["prospect"][])[0];
  if (!prospect) return null;
  return {
    invoice,
    lines: lineRows as BillingInvoiceLineRow[],
    payments: paymentRows as BillingPaymentRow[],
    creditNotes: creditRows as BillingCreditNoteRow[],
    prospect,
    quote: ((quoteRows as BillingQuoteRow[])[0] ?? null),
  };
}

export async function createInvoiceDraft(input: InvoiceDraftInput) {
  const normalized = validateInvoiceDraftInput(input);
  const prospect = await assertProspectCanReceiveQuote(normalized.prospect_id);
  await ensureBillingTables();
  const totals = calculateDocumentTotals(normalized.lines);
  const sql = getNeonClient();
  const rows = (await sql`
    INSERT INTO billing_invoices (
      prospect_id, origin, quote_id, due_at, status, currency,
      subtotal_cents, tax_cents, total_cents, remaining_cents, notes, terms
    )
    VALUES (
      ${normalized.prospect_id}, ${normalized.origin}, ${normalized.quote_id}, ${normalized.due_at}, 'DRAFT', ${normalized.currency},
      ${totals.subtotal_cents}, ${totals.tax_cents}, ${totals.total_cents}, ${totals.total_cents}, ${normalized.notes}, ${normalized.terms}
    )
    RETURNING *
  `) as BillingInvoiceRow[];
  const invoice = rows[0];
  if (!invoice) throw new Error("Création de la facture impossible.");
  await replaceInvoiceLines(invoice.id, normalized.lines);
  await createBillingEvent({
    eventType: "invoice.created",
    entityType: "invoice",
    entityId: String(invoice.id),
    source: "user",
    afterData: { status: "DRAFT", prospect_id: prospect.id, total_cents: totals.total_cents },
  });
  return invoice;
}

export async function createInvoiceDraftFromQuote(quoteId: number) {
  const details = await getQuoteDetails(quoteId);
  if (!details) throw new Error("Devis introuvable.");
  if (details.quote.status !== "ACCEPTED") throw new Error("Seul un devis accepté peut être facturé.");
  await ensureBillingTables();
  const sql = getNeonClient();
  const existing = (await sql`
    SELECT id FROM billing_invoices
    WHERE quote_id = ${quoteId}
      AND origin = 'QUOTE'
      AND status <> 'CANCELLED'
    LIMIT 1
  `) as Array<{ id: number }>;
  if (existing[0]) throw new Error("Une facture existe déjà pour ce devis.");
  const rows = (await sql`
    INSERT INTO billing_invoices (
      prospect_id, origin, quote_id, status, currency,
      subtotal_cents, tax_cents, total_cents, remaining_cents,
      notes, terms, client_snapshot, billing_snapshot
    )
    VALUES (
      ${details.quote.prospect_id}, 'QUOTE', ${quoteId}, 'DRAFT', ${details.quote.currency},
      ${details.quote.subtotal_cents}, ${details.quote.tax_cents}, ${details.quote.total_cents}, ${details.quote.total_cents},
      ${details.quote.notes}, ${details.quote.terms}, ${details.quote.client_snapshot}, ${details.quote.billing_snapshot}
    )
    RETURNING *
  `) as BillingInvoiceRow[];
  const invoice = rows[0];
  if (!invoice) throw new Error("Création de la facture impossible.");
  await replaceInvoiceLines(invoice.id, details.lines);
  await createBillingEvent({
    eventType: "invoice.created_from_quote",
    entityType: "invoice",
    entityId: String(invoice.id),
    source: "user",
    metadata: { quote_id: quoteId },
  });
  return invoice;
}

export async function updateInvoiceDraft(id: number, input: InvoiceDraftInput) {
  const normalized = validateInvoiceDraftInput(input);
  await ensureBillingTables();
  const current = await getInvoiceDetails(id);
  if (!current) throw new Error("Facture introuvable.");
  if (current.invoice.status !== "DRAFT" || current.invoice.number) throw new Error("Seule une facture brouillon peut être modifiée.");
  const totals = calculateDocumentTotals(normalized.lines);
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_invoices
    SET prospect_id = ${normalized.prospect_id},
        quote_id = ${normalized.quote_id},
        origin = ${normalized.origin},
        due_at = ${normalized.due_at},
        currency = ${normalized.currency},
        subtotal_cents = ${totals.subtotal_cents},
        tax_cents = ${totals.tax_cents},
        total_cents = ${totals.total_cents},
        remaining_cents = ${totals.total_cents},
        notes = ${normalized.notes},
        terms = ${normalized.terms},
        updated_at = NOW()
    WHERE id = ${id} AND status = 'DRAFT'
    RETURNING *
  `) as BillingInvoiceRow[];
  await replaceInvoiceLines(id, normalized.lines);
  await createBillingEvent({
    eventType: "invoice.updated",
    entityType: "invoice",
    entityId: String(id),
    source: "user",
    beforeData: { total_cents: current.invoice.total_cents },
    afterData: { total_cents: totals.total_cents },
  });
  return rows[0] ?? null;
}

export async function finalizeInvoice(id: number) {
  const details = await getInvoiceDetails(id);
  if (!details) throw new Error("Facture introuvable.");
  if (details.invoice.status !== "DRAFT") throw new Error("Seul un brouillon peut être finalisé.");
  if (!details.lines.length) throw new Error("Ajoutez au moins une ligne avant finalisation.");
  const settings = await getBillingSettings();
  const issuedAt = new Date();
  const dueAt = details.invoice.due_at ?? addDaysIso(issuedAt, settings?.default_payment_terms_days ?? 30);
  const clientSnapshot = details.invoice.client_snapshot ?? buildClientSnapshot(details.prospect);
  const billingSnapshot = details.invoice.billing_snapshot ?? buildBillingSnapshot(settings);
  const prefix = settings?.invoice_prefix ?? "FAC";
  const periodYear = issuedAt.getFullYear();
  const sql = getNeonClient();
  const rows = (await sql.transaction((tx) => [
    tx`
      WITH target AS (
        SELECT id, number FROM billing_invoices WHERE id = ${id} AND status = 'DRAFT' FOR UPDATE
      ),
      seq AS (
        INSERT INTO billing_number_sequences (document_type, period_year, prefix, next_number)
        SELECT 'invoice', ${periodYear}, ${prefix}, 2
        WHERE EXISTS (SELECT 1 FROM target WHERE number IS NULL)
        ON CONFLICT (document_type, period_year)
        DO UPDATE SET next_number = billing_number_sequences.next_number + 1, prefix = EXCLUDED.prefix, updated_at = NOW()
        RETURNING prefix, period_year, next_number - 1 AS sequence_number
      )
      UPDATE billing_invoices i
      SET number = COALESCE(i.number, (SELECT CONCAT(seq.prefix, '-', seq.period_year, '-', LPAD(seq.sequence_number::text, 4, '0')) FROM seq)),
          issued_at = COALESCE(i.issued_at, NOW()),
          finalized_at = COALESCE(i.finalized_at, NOW()),
          due_at = COALESCE(i.due_at, ${dueAt}),
          status = 'FINALIZED',
          remaining_cents = GREATEST(0, i.total_cents - i.paid_cents),
          client_snapshot = COALESCE(i.client_snapshot, ${clientSnapshot}),
          billing_snapshot = COALESCE(i.billing_snapshot, ${billingSnapshot}),
          updated_at = NOW()
      FROM target
      WHERE i.id = target.id
      RETURNING i.*
    `,
  ], { isolationLevel: "Serializable" })) as [BillingInvoiceRow[]];
  const invoice = rows[0][0];
  if (!invoice?.number) throw new Error("Finalisation de la facture impossible.");
  await createBillingEvent({
    eventType: "invoice.finalized",
    entityType: "invoice",
    entityId: String(id),
    source: "user",
    afterData: { status: "FINALIZED", number: invoice.number },
  });
  return invoice;
}

export async function markInvoiceSent(id: number, messageId: string | null, email: { to: string; subject: string }) {
  const details = await getInvoiceDetails(id);
  if (!details) throw new Error("Facture introuvable.");
  if (!["FINALIZED", "SENT", "OVERDUE"].includes(details.invoice.status)) throw new Error("Cette facture ne peut pas être envoyée.");
  const nextStatus = details.invoice.status === "OVERDUE" ? "OVERDUE" : "SENT";
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_invoices
    SET status = ${nextStatus}, sent_at = COALESCE(sent_at, NOW()), updated_at = NOW()
    WHERE id = ${id} AND status IN ('FINALIZED', 'SENT', 'OVERDUE')
    RETURNING *
  `) as BillingInvoiceRow[];
  const invoice = rows[0];
  if (!invoice) throw new Error("Statut de facture modifié pendant l'envoi.");
  await createBillingEvent({
    eventType: details.invoice.sent_at ? "invoice.resent" : "invoice.sent",
    entityType: "invoice",
    entityId: String(id),
    source: "user",
    afterData: { status: nextStatus },
    metadata: { smtp_message_id: messageId, to: email.to, subject: email.subject },
  });
  return invoice;
}

export async function recordInvoiceSendFailure(id: number, error: string) {
  await createBillingEvent({ eventType: "invoice.send_failed", entityType: "invoice", entityId: String(id), source: "user", metadata: { error: error.slice(0, 1000) } });
}

export async function recordManualPayment(input: PaymentInput) {
  const normalized = validatePaymentInput(input);
  await ensureBillingTables();
  const details = await getInvoiceDetails(normalized.invoice_id);
  if (!details) throw new Error("Facture introuvable.");
  assertPaymentAllowed({
    amount_cents: normalized.amount_cents,
    remaining_cents: details.invoice.remaining_cents,
    status: details.invoice.status,
    paymentStatus: normalized.status,
  });
  const paidCents = details.invoice.paid_cents + normalized.amount_cents;
  const { remaining_cents } = computeInvoiceBalance({ total_cents: details.invoice.total_cents, paid_cents: paidCents });
  const nextStatus = computeInvoiceStatus({
    currentStatus: details.invoice.status,
    total_cents: details.invoice.total_cents,
    paid_cents: paidCents,
    remaining_cents,
    due_at: details.invoice.due_at,
  });
  assertInvoiceStatusTransition(details.invoice.status, nextStatus);
  const sql = getNeonClient();
  const [paymentRows, invoiceRows] = (await sql.transaction((tx) => [
    tx`
      INSERT INTO billing_payments (prospect_id, invoice_id, amount_cents, currency, paid_at, method, status, reference, comment)
      VALUES (${details.invoice.prospect_id}, ${details.invoice.id}, ${normalized.amount_cents}, ${details.invoice.currency}, ${normalized.paid_at}, ${normalized.method}, ${normalized.status}, ${normalized.reference}, ${normalized.comment})
      RETURNING *
    `,
    tx`
      UPDATE billing_invoices
      SET paid_cents = ${paidCents},
          remaining_cents = ${remaining_cents},
          status = ${nextStatus},
          paid_at = CASE WHEN ${nextStatus} = 'PAID' THEN COALESCE(paid_at, NOW()) ELSE paid_at END,
          updated_at = NOW()
      WHERE id = ${details.invoice.id}
      RETURNING *
    `,
  ], { isolationLevel: "Serializable" })) as [BillingPaymentRow[], BillingInvoiceRow[]];
  await createBillingEvent({
    eventType: "payment.recorded",
    entityType: "invoice",
    entityId: String(details.invoice.id),
    source: "user",
    afterData: { paid_cents: invoiceRows[0]?.paid_cents, remaining_cents: invoiceRows[0]?.remaining_cents, status: invoiceRows[0]?.status },
    metadata: { payment_id: paymentRows[0]?.id },
  });
  return { payment: paymentRows[0], invoice: invoiceRows[0] };
}

export async function syncInvoiceOverdue(id: number) {
  const details = await getInvoiceDetails(id);
  if (!details) return null;
  const nextStatus = computeInvoiceStatus({
    currentStatus: details.invoice.status,
    total_cents: details.invoice.total_cents,
    paid_cents: details.invoice.paid_cents,
    remaining_cents: details.invoice.remaining_cents,
    due_at: details.invoice.due_at,
  });
  if (nextStatus === details.invoice.status) return details.invoice;
  assertInvoiceStatusTransition(details.invoice.status, nextStatus);
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_invoices SET status = ${nextStatus}, updated_at = NOW()
    WHERE id = ${id} AND status = ${details.invoice.status}
    RETURNING *
  `) as BillingInvoiceRow[];
  return rows[0] ?? details.invoice;
}

export async function voidInvoice(id: number) {
  const details = await getInvoiceDetails(id);
  if (!details) throw new Error("Facture introuvable.");
  if (!["FINALIZED", "SENT", "OVERDUE"].includes(details.invoice.status) || details.invoice.paid_cents > 0) {
    throw new Error("Seule une facture finalisée sans paiement peut être rendue nulle.");
  }
  assertInvoiceStatusTransition(details.invoice.status, "VOID");
  const sql = getNeonClient();
  const rows = (await sql`UPDATE billing_invoices SET status = 'VOID', voided_at = NOW(), updated_at = NOW() WHERE id = ${id} RETURNING *`) as BillingInvoiceRow[];
  await createBillingEvent({ eventType: "invoice.voided", entityType: "invoice", entityId: String(id), source: "user" });
  return rows[0];
}

export async function duplicateInvoiceAsDraft(id: number) {
  const details = await getInvoiceDetails(id);
  if (!details) throw new Error("Facture introuvable.");
  return createInvoiceDraft({
    prospect_id: details.invoice.prospect_id,
    origin: "MANUAL",
    currency: details.invoice.currency,
    notes: details.invoice.notes,
    terms: details.invoice.terms,
    lines: details.lines.map((line, index) => ({ ...line, product_id: line.product_id, sort_order: index })),
  });
}

export async function createCreditNoteDraftFromInvoice(invoiceId: number, reason = "Correction de facture") {
  const details = await getInvoiceDetails(invoiceId);
  if (!details) throw new Error("Facture introuvable.");
  if (!["FINALIZED", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE"].includes(details.invoice.status)) throw new Error("Un avoir doit être lié à une facture finalisée.");
  return createCreditNoteDraft({
    invoice_id: invoiceId,
    reason,
    lines: details.lines.map((line, index) => ({ ...line, product_id: line.product_id, sort_order: index })),
  });
}

export async function createCreditNoteDraft(input: CreditNoteDraftInput) {
  const normalized = validateCreditNoteDraftInput(input);
  const details = await getInvoiceDetails(normalized.invoice_id);
  if (!details) throw new Error("Facture introuvable.");
  const totals = calculateDocumentTotals(normalized.lines);
  const alreadyCredited = details.creditNotes.filter((note) => note.status !== "VOID").reduce((sum, note) => sum + note.total_cents, 0);
  assertCreditAmountAllowed({ credit_cents: totals.total_cents, invoice_total_cents: details.invoice.total_cents, already_credited_cents: alreadyCredited });
  const sql = getNeonClient();
  const rows = (await sql`
    INSERT INTO billing_credit_notes (
      invoice_id, prospect_id, reason, status, subtotal_cents, tax_cents, total_cents,
      client_snapshot, billing_snapshot
    )
    VALUES (
      ${details.invoice.id}, ${details.invoice.prospect_id}, ${normalized.reason}, 'DRAFT',
      ${totals.subtotal_cents}, ${totals.tax_cents}, ${totals.total_cents},
      ${details.invoice.client_snapshot}, ${details.invoice.billing_snapshot}
    )
    RETURNING *
  `) as BillingCreditNoteRow[];
  const creditNote = rows[0];
  if (!creditNote) throw new Error("Création de l'avoir impossible.");
  await replaceCreditNoteLines(creditNote.id, normalized.lines);
  await createBillingEvent({ eventType: "credit_note.created", entityType: "credit_note", entityId: String(creditNote.id), source: "user", metadata: { invoice_id: details.invoice.id } });
  return creditNote;
}

export async function getCreditNoteDetails(id: number): Promise<CreditNoteDetails | null> {
  await ensureBillingTables();
  const sql = getNeonClient();
  const creditRows = (await sql`SELECT * FROM billing_credit_notes WHERE id = ${id} LIMIT 1`) as BillingCreditNoteRow[];
  const creditNote = creditRows[0];
  if (!creditNote) return null;
  const [lineRows, invoiceRows, prospectRows] = await Promise.all([
    sql`SELECT * FROM billing_credit_note_lines WHERE credit_note_id = ${id} ORDER BY sort_order ASC, id ASC`,
    sql`SELECT * FROM billing_invoices WHERE id = ${creditNote.invoice_id} LIMIT 1`,
    sql`
      SELECT id, company_name, contact_name, email, phone, country, region, department, city, status, website
      FROM crm_prospects WHERE id = ${creditNote.prospect_id} LIMIT 1
    `,
  ]);
  const invoice = (invoiceRows as BillingInvoiceRow[])[0];
  const prospect = (prospectRows as QuoteDetails["prospect"][])[0];
  if (!invoice || !prospect) return null;
  return { creditNote, lines: lineRows as BillingCreditNoteLineRow[], invoice, prospect };
}

export async function finalizeCreditNote(id: number) {
  const details = await getCreditNoteDetails(id);
  if (!details) throw new Error("Avoir introuvable.");
  if (details.creditNote.status !== "DRAFT") throw new Error("Seul un brouillon d'avoir peut être émis.");
  const invoiceDetails = await getInvoiceDetails(details.invoice.id);
  if (!invoiceDetails) throw new Error("Facture introuvable.");
  const alreadyCredited = invoiceDetails.creditNotes.filter((note) => note.id !== id && note.status !== "VOID").reduce((sum, note) => sum + note.total_cents, 0);
  assertCreditAmountAllowed({ credit_cents: details.creditNote.total_cents, invoice_total_cents: details.invoice.total_cents, already_credited_cents: alreadyCredited });
  const settings = await getBillingSettings();
  const prefix = settings?.credit_note_prefix ?? "AV";
  const periodYear = new Date().getFullYear();
  const sql = getNeonClient();
  const [creditRows, invoiceRows] = (await sql.transaction((tx) => [
    tx`
      WITH target AS (SELECT id, number FROM billing_credit_notes WHERE id = ${id} AND status = 'DRAFT' FOR UPDATE),
      seq AS (
        INSERT INTO billing_number_sequences (document_type, period_year, prefix, next_number)
        SELECT 'credit_note', ${periodYear}, ${prefix}, 2
        WHERE EXISTS (SELECT 1 FROM target WHERE number IS NULL)
        ON CONFLICT (document_type, period_year)
        DO UPDATE SET next_number = billing_number_sequences.next_number + 1, prefix = EXCLUDED.prefix, updated_at = NOW()
        RETURNING prefix, period_year, next_number - 1 AS sequence_number
      )
      UPDATE billing_credit_notes c
      SET number = COALESCE(c.number, (SELECT CONCAT(seq.prefix, '-', seq.period_year, '-', LPAD(seq.sequence_number::text, 4, '0')) FROM seq)),
          status = 'FINALIZED',
          issued_at = COALESCE(issued_at, NOW()),
          updated_at = NOW()
      FROM target
      WHERE c.id = target.id
      RETURNING c.*
    `,
    tx`
      UPDATE billing_invoices
      SET remaining_cents = GREATEST(0, remaining_cents - ${details.creditNote.total_cents}),
          status = CASE WHEN GREATEST(0, remaining_cents - ${details.creditNote.total_cents}) = 0 THEN 'REFUNDED' ELSE status END,
          updated_at = NOW()
      WHERE id = ${details.invoice.id}
      RETURNING *
    `,
  ], { isolationLevel: "Serializable" })) as [BillingCreditNoteRow[], BillingInvoiceRow[]];
  const creditNote = creditRows[0];
  if (!creditNote?.number) throw new Error("Émission de l'avoir impossible.");
  await createBillingEvent({ eventType: "credit_note.finalized", entityType: "credit_note", entityId: String(id), source: "user", afterData: { number: creditNote.number }, metadata: { invoice_id: invoiceRows[0]?.id } });
  return creditNote;
}

export async function getPayments(filters: { query?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedBillingPayments> {
  await ensureBillingTables();
  const sql = getNeonClient();
  const query = nullable(filters.query);
  const pageSize = normalizePageSize(filters.pageSize);
  const page = normalizePage(filters.page);
  const offset = (page - 1) * pageSize;
  const rows = (await sql`
    SELECT pay.*, i.number AS invoice_number, p.company_name, p.email, COUNT(*) OVER()::int AS total_count
    FROM billing_payments pay
    JOIN crm_prospects p ON p.id = pay.prospect_id
    LEFT JOIN billing_invoices i ON i.id = pay.invoice_id
    WHERE ${query}::text IS NULL
      OR LOWER(COALESCE(i.number, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
      OR LOWER(p.company_name) LIKE LOWER(${"%" + (query ?? "") + "%"})
      OR LOWER(COALESCE(pay.reference, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
    ORDER BY pay.paid_at DESC NULLS LAST, pay.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `) as Array<BillingPaymentListRow & { total_count: number }>;
  const total = rows[0]?.total_count ?? 0;
  return { items: rows.map(stripTotalCount), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getCreditNotes(filters: { query?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedBillingCreditNotes> {
  await ensureBillingTables();
  const sql = getNeonClient();
  const query = nullable(filters.query);
  const pageSize = normalizePageSize(filters.pageSize);
  const page = normalizePage(filters.page);
  const offset = (page - 1) * pageSize;
  const rows = (await sql`
    SELECT cn.*, i.number AS invoice_number, p.company_name, p.email, COUNT(*) OVER()::int AS total_count
    FROM billing_credit_notes cn
    JOIN billing_invoices i ON i.id = cn.invoice_id
    JOIN crm_prospects p ON p.id = cn.prospect_id
    WHERE ${query}::text IS NULL
      OR LOWER(COALESCE(cn.number, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
      OR LOWER(COALESCE(i.number, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
      OR LOWER(p.company_name) LIKE LOWER(${"%" + (query ?? "") + "%"})
    ORDER BY cn.issued_at DESC NULLS LAST, cn.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `) as Array<BillingCreditNoteListRow & { total_count: number }>;
  const total = rows[0]?.total_count ?? 0;
  return { items: rows.map(stripTotalCount), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getBillingSummaryForProspect(prospectId: number) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const invoiceRows = (await sql`
    SELECT *
    FROM billing_invoices
    WHERE prospect_id = ${prospectId}
      AND status <> 'CANCELLED'
    ORDER BY created_at DESC
    LIMIT 8
  `) as BillingInvoiceRow[];
  return {
    invoices: invoiceRows,
    invoiced_cents: invoiceRows.filter((invoice) => invoice.status !== "DRAFT" && invoice.status !== "VOID").reduce((sum, invoice) => sum + invoice.total_cents, 0),
    paid_cents: invoiceRows.reduce((sum, invoice) => sum + invoice.paid_cents, 0),
  };
}

export async function listSubscriptionPlans({ includeArchived = false }: { includeArchived?: boolean } = {}) {
  await ensureBillingTables();
  const sql = getNeonClient();
  return (await sql`
    SELECT *
    FROM billing_subscription_plans
    WHERE ${includeArchived}::boolean OR archived_at IS NULL
    ORDER BY is_active DESC, frequency ASC, price_cents ASC, name ASC
  `) as BillingSubscriptionPlanRow[];
}

export async function upsertSubscriptionPlan(input: Partial<BillingSubscriptionPlanRow> & { name: string }) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const id = Number.isInteger(input.id) && input.id ? input.id : null;
  const values = {
    name: input.name.trim(),
    description: nullable(input.description),
    price_cents: integerOrDefault(input.price_cents, 0),
    currency: textOrDefault(input.currency, "EUR").toUpperCase().slice(0, 3),
    frequency: input.frequency === "yearly" ? "yearly" : "monthly",
    trial_days: integerOrDefault(input.trial_days, 0),
    setup_fee_cents: integerOrDefault(input.setup_fee_cents, 0),
    stripe_product_id: nullable(input.stripe_product_id),
    stripe_price_id: nullable(input.stripe_price_id),
    features: Array.isArray(input.features) ? input.features : [],
    vat_rate_basis_points: integerOrDefault(input.vat_rate_basis_points, 0),
    is_active: input.is_active ?? true,
  };
  const rows = id
    ? ((await sql`
        UPDATE billing_subscription_plans
        SET name = ${values.name},
            description = ${values.description},
            price_cents = ${values.price_cents},
            currency = ${values.currency},
            frequency = ${values.frequency},
            trial_days = ${values.trial_days},
            setup_fee_cents = ${values.setup_fee_cents},
            stripe_product_id = ${values.stripe_product_id},
            stripe_price_id = ${values.stripe_price_id},
            features = ${values.features},
            vat_rate_basis_points = ${values.vat_rate_basis_points},
            is_active = ${values.is_active},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `) as BillingSubscriptionPlanRow[])
    : ((await sql`
        INSERT INTO billing_subscription_plans (
          name, description, price_cents, currency, frequency, trial_days, setup_fee_cents,
          stripe_product_id, stripe_price_id, features, vat_rate_basis_points, is_active
        )
        VALUES (
          ${values.name}, ${values.description}, ${values.price_cents}, ${values.currency}, ${values.frequency},
          ${values.trial_days}, ${values.setup_fee_cents}, ${values.stripe_product_id}, ${values.stripe_price_id},
          ${values.features}, ${values.vat_rate_basis_points}, ${values.is_active}
        )
        RETURNING *
      `) as BillingSubscriptionPlanRow[]);
  return rows[0] ?? null;
}

export async function archiveSubscriptionPlan(id: number, archived: boolean) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_subscription_plans
    SET archived_at = CASE WHEN ${archived}::boolean THEN NOW() ELSE NULL END,
        is_active = CASE WHEN ${archived}::boolean THEN FALSE ELSE TRUE END,
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as BillingSubscriptionPlanRow[];
  return rows[0] ?? null;
}

export async function listCustomerSubscriptions({ query = "" }: { query?: string } = {}) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const normalizedQuery = nullable(query);
  return (await sql`
    SELECT
      sub.*,
      p.company_name,
      p.email,
      plan.name AS plan_name,
      plan.price_cents,
      plan.currency,
      plan.frequency
    FROM billing_customer_subscriptions sub
    JOIN crm_prospects p ON p.id = sub.prospect_id
    LEFT JOIN billing_subscription_plans plan ON plan.id = sub.plan_id
    WHERE ${normalizedQuery}::text IS NULL
      OR LOWER(p.company_name) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
      OR LOWER(COALESCE(p.email, '')) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
      OR LOWER(COALESCE(sub.stripe_customer_id, '')) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
      OR LOWER(COALESCE(sub.stripe_subscription_id, '')) LIKE LOWER(${"%" + (normalizedQuery ?? "") + "%"})
    ORDER BY sub.updated_at DESC
    LIMIT 200
  `) as Array<BillingCustomerSubscriptionRow & { company_name: string; email: string | null; plan_name: string | null; price_cents: number | null; currency: string | null; frequency: string | null }>;
}

export async function getSubscriptionPlan(id: number) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`SELECT * FROM billing_subscription_plans WHERE id = ${id} LIMIT 1`) as BillingSubscriptionPlanRow[];
  return rows[0] ?? null;
}

export async function getCustomerSubscription(id: number) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`SELECT * FROM billing_customer_subscriptions WHERE id = ${id} LIMIT 1`) as BillingCustomerSubscriptionRow[];
  return rows[0] ?? null;
}

export async function getOrCreateStripeCustomerForProspect(prospectId: number) {
  const prospect = await assertProspectCanReceiveQuote(prospectId);
  const sql = getNeonClient();
  const rows = (await sql`
    SELECT stripe_customer_id
    FROM billing_customer_subscriptions
    WHERE prospect_id = ${prospectId} AND stripe_customer_id IS NOT NULL
    ORDER BY updated_at DESC
    LIMIT 1
  `) as Array<{ stripe_customer_id: string }>;
  return { prospect, stripeCustomerId: rows[0]?.stripe_customer_id ?? null };
}

export async function recordStripeCustomerForProspect(prospectId: number, stripeCustomerId: string) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`
    INSERT INTO billing_customer_subscriptions (prospect_id, status, stripe_customer_id)
    VALUES (${prospectId}, 'INCOMPLETE', ${stripeCustomerId})
    RETURNING *
  `) as BillingCustomerSubscriptionRow[];
  return rows[0] ?? null;
}

export async function recordStripeEventReceived(event: Stripe.Event) {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`
    INSERT INTO billing_stripe_events (stripe_event_id, event_type, status, payload)
    VALUES (${event.id}, ${event.type}, 'received', ${event as unknown as Record<string, unknown>})
    ON CONFLICT (stripe_event_id) DO NOTHING
    RETURNING *
  `) as BillingStripeEventRow[];
  return { inserted: Boolean(rows[0]), row: rows[0] ?? null };
}

export async function markStripeEventProcessed(eventId: string) {
  const sql = getNeonClient();
  await sql`
    UPDATE billing_stripe_events
    SET status = 'processed', processed_at = NOW(), updated_at = NOW(), error = NULL
    WHERE stripe_event_id = ${eventId}
  `;
}

export async function markStripeEventFailed(eventId: string, error: string) {
  const sql = getNeonClient();
  await sql`
    UPDATE billing_stripe_events
    SET status = 'failed', error = ${error.slice(0, 2000)}, updated_at = NOW()
    WHERE stripe_event_id = ${eventId}
  `;
}

export async function syncCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const prospectId = Number.parseInt(String(session.metadata?.prospect_id ?? ""), 10);
  const planId = Number.parseInt(String(session.metadata?.plan_id ?? ""), 10);
  const stripeSubscriptionId = stripeId(session.subscription);
  const stripeCustomerId = stripeId(session.customer);
  if (!Number.isInteger(prospectId) || !stripeCustomerId) throw new Error("Session Checkout Stripe incomplète.");

  const sql = getNeonClient();
  const rows = (await sql`
    INSERT INTO billing_customer_subscriptions (
      prospect_id, plan_id, status, stripe_customer_id, stripe_subscription_id, stripe_price_id, metadata
    )
    VALUES (
      ${prospectId}, ${Number.isInteger(planId) ? planId : null}, 'INCOMPLETE', ${stripeCustomerId}, ${stripeSubscriptionId}, ${session.metadata?.stripe_price_id ?? null}, ${session.metadata ?? null}
    )
    ON CONFLICT (stripe_subscription_id) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      plan_id = COALESCE(EXCLUDED.plan_id, billing_customer_subscriptions.plan_id),
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *
  `) as BillingCustomerSubscriptionRow[];
  return rows[0] ?? null;
}

export async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;
  const stripeCustomerId = stripeId(subscription.customer);
  const stripePriceId = subscription.items.data[0]?.price.id ?? null;
  const planRows = stripePriceId
    ? ((await getNeonClient()`SELECT id FROM billing_subscription_plans WHERE stripe_price_id = ${stripePriceId} LIMIT 1`) as Array<{ id: number }>)
    : [];
  const prospectRows = stripeCustomerId
    ? ((await getNeonClient()`SELECT prospect_id FROM billing_customer_subscriptions WHERE stripe_customer_id = ${stripeCustomerId} ORDER BY updated_at DESC LIMIT 1`) as Array<{ prospect_id: number }>)
    : [];
  const prospectId = prospectRows[0]?.prospect_id;
  if (!prospectId || !stripeCustomerId) throw new Error("Abonnement Stripe sans prospect local.");

  const sql = getNeonClient();
  const rows = (await sql`
    INSERT INTO billing_customer_subscriptions (
      prospect_id, plan_id, status, started_at, trial_ends_at, current_period_starts_at,
      current_period_ends_at, next_invoice_at, cancel_at, cancelled_at, stripe_customer_id,
      stripe_subscription_id, stripe_price_id, cancellation_mode, metadata
    )
    VALUES (
      ${prospectId}, ${planRows[0]?.id ?? null}, ${mapStripeSubscriptionStatus(subscription.status)},
      ${toIsoFromStripeTimestamp(subscription.start_date)}, ${toIsoFromStripeTimestamp(subscription.trial_end)},
      ${toIsoFromStripeTimestamp(subscription.items.data[0]?.current_period_start)}, ${toIsoFromStripeTimestamp(subscription.items.data[0]?.current_period_end)},
      ${toIsoFromStripeTimestamp(subscription.items.data[0]?.current_period_end)}, ${toIsoFromStripeTimestamp(subscription.cancel_at)},
      ${toIsoFromStripeTimestamp(subscription.canceled_at)}, ${stripeCustomerId}, ${stripeSubscriptionId}, ${stripePriceId},
      ${subscription.cancel_at_period_end ? "period_end" : null}, ${subscription.metadata}
    )
    ON CONFLICT (stripe_subscription_id) DO UPDATE SET
      plan_id = COALESCE(EXCLUDED.plan_id, billing_customer_subscriptions.plan_id),
      status = EXCLUDED.status,
      started_at = EXCLUDED.started_at,
      trial_ends_at = EXCLUDED.trial_ends_at,
      current_period_starts_at = EXCLUDED.current_period_starts_at,
      current_period_ends_at = EXCLUDED.current_period_ends_at,
      next_invoice_at = EXCLUDED.next_invoice_at,
      cancel_at = EXCLUDED.cancel_at,
      cancelled_at = EXCLUDED.cancelled_at,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_price_id = EXCLUDED.stripe_price_id,
      cancellation_mode = EXCLUDED.cancellation_mode,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *
  `) as BillingCustomerSubscriptionRow[];
  await createBillingEvent({ eventType: "subscription.synced", entityType: "subscription", entityId: String(rows[0]?.id ?? stripeSubscriptionId), source: "stripe", metadata: { stripe_subscription_id: stripeSubscriptionId } });
  return rows[0] ?? null;
}

export async function syncStripeInvoice(stripeInvoice: Stripe.Invoice) {
  const stripeInvoiceId = stripeInvoice.id;
  if (!stripeInvoiceId) throw new Error("Facture Stripe sans id.");
  const stripeSubscriptionId = stripeId((stripeInvoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription);
  const stripeCustomerId = stripeId(stripeInvoice.customer);
  const subscriptionRows = stripeSubscriptionId
    ? ((await getNeonClient()`SELECT * FROM billing_customer_subscriptions WHERE stripe_subscription_id = ${stripeSubscriptionId} LIMIT 1`) as BillingCustomerSubscriptionRow[])
    : [];
  const fallbackRows = !subscriptionRows[0] && stripeCustomerId
    ? ((await getNeonClient()`SELECT * FROM billing_customer_subscriptions WHERE stripe_customer_id = ${stripeCustomerId} ORDER BY updated_at DESC LIMIT 1`) as BillingCustomerSubscriptionRow[])
    : [];
  const subscription = subscriptionRows[0] ?? fallbackRows[0];
  if (!subscription) throw new Error("Facture Stripe sans abonnement local.");
  const status = mapStripeInvoiceStatus(stripeInvoice.status);
  const total = stripeInvoice.total ?? 0;
  const paid = stripeInvoice.amount_paid ?? 0;
  const remaining = Math.max(0, total - paid);
  const sql = getNeonClient();
  const invoiceRows = (await sql`
    INSERT INTO billing_invoices (
      prospect_id, origin, customer_subscription_id, stripe_invoice_id, stripe_invoice_number,
      created_at, issued_at, due_at, finalized_at, status, currency, subtotal_cents, tax_cents,
      total_cents, paid_cents, remaining_cents, stripe_hosted_invoice_url, stripe_invoice_pdf_url,
      sent_at, paid_at, metadata
    )
    VALUES (
      ${subscription.prospect_id}, 'SUBSCRIPTION', ${subscription.id}, ${stripeInvoiceId}, ${stripeInvoice.number ?? null},
      ${toIsoFromStripeTimestamp(stripeInvoice.created) ?? new Date().toISOString()}, ${toIsoFromStripeTimestamp(stripeInvoice.created)},
      ${toIsoFromStripeTimestamp(stripeInvoice.due_date)}, ${toIsoFromStripeTimestamp(stripeInvoice.status_transitions?.finalized_at)},
      ${status}, ${(stripeInvoice.currency ?? "eur").toUpperCase()}, ${stripeInvoice.subtotal ?? 0}, ${sumStripeTax(stripeInvoice)}, ${total},
      ${paid}, ${remaining}, ${stripeInvoice.hosted_invoice_url ?? null}, ${stripeInvoice.invoice_pdf ?? null},
      ${toIsoFromStripeTimestamp(stripeInvoice.status_transitions?.finalized_at)}, ${toIsoFromStripeTimestamp(stripeInvoice.status_transitions?.paid_at)},
      ${stripeInvoice.metadata}
    )
    ON CONFLICT (stripe_invoice_id) DO UPDATE SET
      stripe_invoice_number = EXCLUDED.stripe_invoice_number,
      status = EXCLUDED.status,
      subtotal_cents = EXCLUDED.subtotal_cents,
      tax_cents = EXCLUDED.tax_cents,
      total_cents = EXCLUDED.total_cents,
      paid_cents = EXCLUDED.paid_cents,
      remaining_cents = EXCLUDED.remaining_cents,
      stripe_hosted_invoice_url = EXCLUDED.stripe_hosted_invoice_url,
      stripe_invoice_pdf_url = EXCLUDED.stripe_invoice_pdf_url,
      paid_at = EXCLUDED.paid_at,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *
  `) as BillingInvoiceRow[];
  const invoice = invoiceRows[0];
  if (!invoice) throw new Error("Synchronisation facture Stripe impossible.");
  await replaceStripeInvoiceLines(invoice.id, stripeInvoice);
  if (paid > 0) await upsertStripeInvoicePayment(invoice, stripeInvoice);
  await createBillingEvent({ eventType: "invoice.stripe_synced", entityType: "invoice", entityId: String(invoice.id), source: "stripe", metadata: { stripe_invoice_id: stripeInvoiceId } });
  return invoice;
}

export async function createBillingEvent({
  eventType,
  entityType,
  entityId,
  source,
  beforeData,
  afterData,
  metadata,
}: {
  eventType: string;
  entityType: string;
  entityId: string;
  source: "user" | "system" | "stripe" | "cron";
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}) {
  await ensureBillingTables();
  const sql = getNeonClient();
  await sql`
    INSERT INTO billing_events (event_type, entity_type, entity_id, source, before_data, after_data, metadata)
    VALUES (${eventType}, ${entityType}, ${entityId}, ${source}, ${beforeData ?? null}, ${afterData ?? null}, ${metadata ?? null})
  `;
}

export async function getBillingEventsForEntity(entityType: string, entityId: string, limit = 20) {
  await ensureBillingTables();
  const sql = getNeonClient();
  return (await sql`
    SELECT *
    FROM billing_events
    WHERE entity_type = ${entityType}
      AND entity_id = ${entityId}
    ORDER BY created_at DESC
    LIMIT ${Math.max(1, Math.min(50, Math.floor(limit)))}
  `) as BillingEventRow[];
}

export async function getBillingDashboardSummary(): Promise<BillingDashboardSummary> {
  await ensureBillingTables();
  const sql = getNeonClient();
  const rows = (await sql`
    SELECT
      COALESCE(SUM(total_cents) FILTER (
        WHERE status IN ('FINALIZED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE')
          AND issued_at >= date_trunc('month', NOW())
      ), 0)::int AS invoiced_this_month_cents,
      COALESCE((
        SELECT SUM(amount_cents)
        FROM billing_payments
        WHERE status = 'SUCCEEDED'
          AND paid_at >= date_trunc('month', NOW())
      ), 0)::int AS collected_this_month_cents,
      COALESCE(SUM(remaining_cents) FILTER (
        WHERE status IN ('FINALIZED', 'SENT', 'PARTIALLY_PAID', 'OVERDUE')
      ), 0)::int AS outstanding_cents,
      COUNT(*) FILTER (
        WHERE status IN ('FINALIZED', 'SENT', 'PARTIALLY_PAID', 'OVERDUE')
          AND due_at < NOW()
          AND remaining_cents > 0
      )::int AS overdue_invoices,
      COALESCE((
        SELECT COUNT(*) FROM billing_quotes WHERE status IN ('SENT', 'VIEWED')
      ), 0)::int AS pending_quotes,
      COALESCE((
        SELECT COUNT(*) FROM billing_customer_subscriptions WHERE status IN ('TRIALING', 'ACTIVE')
      ), 0)::int AS active_subscriptions,
      COALESCE((
        SELECT SUM(plan.price_cents)
        FROM billing_customer_subscriptions sub
        JOIN billing_subscription_plans plan ON plan.id = sub.plan_id
        WHERE sub.status IN ('TRIALING', 'ACTIVE') AND plan.frequency = 'monthly'
      ), 0)::int AS mrr_cents,
      COALESCE((
        SELECT SUM(CASE WHEN plan.frequency = 'monthly' THEN plan.price_cents * 12 ELSE plan.price_cents END)
        FROM billing_customer_subscriptions sub
        JOIN billing_subscription_plans plan ON plan.id = sub.plan_id
        WHERE sub.status IN ('TRIALING', 'ACTIVE')
      ), 0)::int AS arr_cents,
      COALESCE((
        SELECT COUNT(*) FROM billing_payments WHERE status = 'FAILED'
      ), 0)::int AS failed_payments
    FROM billing_invoices
  `) as BillingDashboardSummary[];

  return rows[0] ?? {
    invoiced_this_month_cents: 0,
    collected_this_month_cents: 0,
    outstanding_cents: 0,
    overdue_invoices: 0,
    pending_quotes: 0,
    active_subscriptions: 0,
    mrr_cents: 0,
    arr_cents: 0,
    failed_payments: 0,
  };
}

async function createBillingIndexes() {
  const sql = getNeonClient();
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_products_active ON billing_products (is_active, archived_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_products_reference ON billing_products (internal_reference)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_quotes_prospect_status ON billing_quotes (prospect_id, status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_quotes_number ON billing_quotes (number)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_quote_lines_quote ON billing_quote_lines (quote_id, sort_order)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_invoices_prospect_status ON billing_invoices (prospect_id, status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_invoices_due_status ON billing_invoices (due_at, status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_invoices_number ON billing_invoices (number)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe_invoice ON billing_invoices (stripe_invoice_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_invoice_lines_invoice ON billing_invoice_lines (invoice_id, sort_order)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_credit_notes_invoice ON billing_credit_notes (invoice_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_payments_invoice_status ON billing_payments (invoice_id, status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_payments_prospect_paid ON billing_payments (prospect_id, paid_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_subscription_plans_active ON billing_subscription_plans (is_active, archived_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_customer_subscriptions_prospect ON billing_customer_subscriptions (prospect_id, status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_customer_subscriptions_stripe_customer ON billing_customer_subscriptions (stripe_customer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_events_entity ON billing_events (entity_type, entity_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_events_type_created ON billing_events (event_type, created_at DESC)`;
}

async function replaceQuoteLines(quoteId: number, lines: NonNullable<QuoteDraftInput["lines"]>) {
  const sql = getNeonClient();
  const normalizedLines = lines.map((line, index) => ({
    ...line,
    sort_order: line.sort_order ?? index,
    totals: calculateDocumentTotals([line]).lines[0],
  }));
  await sql.transaction((tx) => [
    tx`DELETE FROM billing_quote_lines WHERE quote_id = ${quoteId}`,
    ...normalizedLines.map((line) => tx`
      INSERT INTO billing_quote_lines (
        quote_id,
        product_id,
        description,
        quantity_milli,
        unit,
        unit_price_cents,
        vat_rate_basis_points,
        discount_basis_points,
        total_cents,
        sort_order
      )
      VALUES (
        ${quoteId},
        ${line.product_id ?? null},
        ${line.description},
        ${line.quantity_milli},
        ${line.unit},
        ${line.unit_price_cents},
        ${line.vat_rate_basis_points},
        ${line.discount_basis_points ?? 0},
        ${line.totals.total_cents},
        ${line.sort_order}
      )
    `),
  ]);
}

async function replaceInvoiceLines(invoiceId: number, lines: NonNullable<InvoiceDraftInput["lines"]>) {
  const sql = getNeonClient();
  const normalizedLines = lines.map((line, index) => ({
    ...line,
    sort_order: line.sort_order ?? index,
    totals: calculateDocumentTotals([line]).lines[0],
  }));
  await sql.transaction((tx) => [
    tx`DELETE FROM billing_invoice_lines WHERE invoice_id = ${invoiceId}`,
    ...normalizedLines.map((line) => tx`
      INSERT INTO billing_invoice_lines (
        invoice_id, product_id, description, quantity_milli, unit,
        unit_price_cents, vat_rate_basis_points, discount_basis_points, total_cents, sort_order
      )
      VALUES (
        ${invoiceId}, ${line.product_id ?? null}, ${line.description}, ${line.quantity_milli}, ${line.unit},
        ${line.unit_price_cents}, ${line.vat_rate_basis_points}, ${line.discount_basis_points ?? 0}, ${line.totals.total_cents}, ${line.sort_order}
      )
    `),
  ]);
}

async function replaceCreditNoteLines(creditNoteId: number, lines: NonNullable<CreditNoteDraftInput["lines"]>) {
  const sql = getNeonClient();
  const normalizedLines = lines.map((line, index) => ({
    ...line,
    sort_order: line.sort_order ?? index,
    totals: calculateDocumentTotals([line]).lines[0],
  }));
  await sql.transaction((tx) => [
    tx`DELETE FROM billing_credit_note_lines WHERE credit_note_id = ${creditNoteId}`,
    ...normalizedLines.map((line) => tx`
      INSERT INTO billing_credit_note_lines (
        credit_note_id, product_id, description, quantity_milli, unit,
        unit_price_cents, vat_rate_basis_points, discount_basis_points, total_cents, sort_order
      )
      VALUES (
        ${creditNoteId}, ${line.product_id ?? null}, ${line.description}, ${line.quantity_milli}, ${line.unit},
        ${line.unit_price_cents}, ${line.vat_rate_basis_points}, ${line.discount_basis_points ?? 0}, ${line.totals.total_cents}, ${line.sort_order}
      )
    `),
  ]);
}

async function replaceStripeInvoiceLines(invoiceId: number, stripeInvoice: Stripe.Invoice) {
  const sql = getNeonClient();
  const lines = stripeInvoice.lines?.data ?? [];
  const invoiceLines = lines.length
    ? lines.map((line, index) => ({
        description: line.description ?? "Abonnement Stripe",
        quantity_milli: Math.max(1000, Math.round((line.quantity ?? 1) * 1000)),
        unit: "abonnement",
        unit_price_cents: line.quantity ? Math.round((line.amount ?? 0) / Math.max(1, line.quantity)) : line.amount ?? 0,
        vat_rate_basis_points: 0,
        discount_basis_points: 0,
        total_cents: line.amount ?? 0,
        sort_order: index,
      }))
    : [{
        description: stripeInvoice.description ?? "Abonnement Stripe",
        quantity_milli: 1000,
        unit: "abonnement",
        unit_price_cents: stripeInvoice.subtotal ?? stripeInvoice.total ?? 0,
        vat_rate_basis_points: 0,
        discount_basis_points: 0,
        total_cents: stripeInvoice.total ?? 0,
        sort_order: 0,
      }];
  await sql.transaction((tx) => [
    tx`DELETE FROM billing_invoice_lines WHERE invoice_id = ${invoiceId}`,
    ...invoiceLines.map((line) => tx`
      INSERT INTO billing_invoice_lines (
        invoice_id, description, quantity_milli, unit, unit_price_cents,
        vat_rate_basis_points, discount_basis_points, total_cents, sort_order
      )
      VALUES (
        ${invoiceId}, ${line.description}, ${line.quantity_milli}, ${line.unit}, ${line.unit_price_cents},
        ${line.vat_rate_basis_points}, ${line.discount_basis_points}, ${line.total_cents}, ${line.sort_order}
      )
    `),
  ]);
}

async function upsertStripeInvoicePayment(invoice: BillingInvoiceRow, stripeInvoice: Stripe.Invoice) {
  const sql = getNeonClient();
  const stripePaymentIntent = (stripeInvoice as Stripe.Invoice & { payment_intent?: string | { id: string } | null }).payment_intent;
  const paymentReference = stripePaymentIntent ? stripeId(stripePaymentIntent) : `stripe_invoice:${stripeInvoice.id}`;
  await sql`
    INSERT INTO billing_payments (
      prospect_id, invoice_id, amount_cents, currency, paid_at, method, status,
      reference, stripe_payment_intent_id, comment, metadata
    )
    SELECT
      ${invoice.prospect_id}, ${invoice.id}, ${stripeInvoice.amount_paid ?? 0}, ${invoice.currency},
      ${toIsoFromStripeTimestamp(stripeInvoice.status_transitions?.paid_at) ?? new Date().toISOString()},
      'stripe', 'SUCCEEDED', ${paymentReference}, ${stripePaymentIntent ? stripeId(stripePaymentIntent) : null},
      'Paiement Stripe Billing', ${stripeInvoice.metadata}
    WHERE NOT EXISTS (
      SELECT 1 FROM billing_payments
      WHERE invoice_id = ${invoice.id}
        AND reference = ${paymentReference}
    )
  `;
}

function sumStripeTax(stripeInvoice: Stripe.Invoice) {
  const taxAmounts = (stripeInvoice as Stripe.Invoice & { total_tax_amounts?: Array<{ amount?: number }> }).total_tax_amounts ?? [];
  return taxAmounts.reduce((sum: number, tax) => sum + (tax.amount ?? 0), 0);
}

function addDaysIso(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function nullable(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function textOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function integerOrDefault(value: unknown, fallback: number) {
  return Number.isInteger(value) ? Number(value) : fallback;
}

function normalizePage(page?: number) {
  if (!Number.isFinite(page)) return 1;
  return Math.max(1, Math.floor(page ?? 1));
}

function normalizePageSize(pageSize?: number) {
  if (!Number.isFinite(pageSize)) return 25;
  return Math.max(10, Math.min(100, Math.floor(pageSize ?? 25)));
}

function stripTotalCount<T extends { total_count: number }>(row: T) {
  const { total_count: _totalCount, ...copy } = row;
  void _totalCount;
  return copy;
}
