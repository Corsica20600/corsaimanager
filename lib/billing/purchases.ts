import { getNeonClient } from "../neon";
import { createBillingEvent } from "./repository";
import type {
  BillingPurchaseAttachmentRow,
  BillingPurchaseEmailImportRow,
  BillingPurchaseInvoiceLineRow,
  BillingPurchaseInvoiceListRow,
  BillingPurchaseInvoiceRow,
  BillingSupplierRow,
  PaginatedBillingPurchaseInvoices,
  PurchaseInvoiceDetails,
  PurchaseInvoiceFilters,
} from "./types";

let purchaseTablesReady: Promise<void> | null = null;

export async function ensurePurchaseTables() {
  purchaseTablesReady ??= ensurePurchaseTablesOnce();
  return purchaseTablesReady;
}

async function ensurePurchaseTablesOnce() {
  const sql = getNeonClient();
  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_suppliers_normalized_name_unique ON billing_suppliers (normalized_name)`;

  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_purchase_source_message_unique ON billing_purchase_invoices (source_mailbox, source_message_id) WHERE source_mailbox IS NOT NULL AND source_message_id IS NOT NULL`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_purchase_supplier_number_unique ON billing_purchase_invoices (supplier_id, invoice_number) WHERE invoice_number IS NOT NULL`;

  await sql`
    CREATE TABLE IF NOT EXISTS billing_purchase_invoice_lines (
      id BIGSERIAL PRIMARY KEY,
      purchase_invoice_id BIGINT NOT NULL REFERENCES billing_purchase_invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity_milli INTEGER NOT NULL DEFAULT 1000,
      unit_price_cents INTEGER NOT NULL DEFAULT 0,
      vat_rate_basis_points INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
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
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_purchase_email_message_unique ON billing_purchase_email_imports (mailbox, message_id)`;

  await sql`
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_billing_purchase_invoices_status_created ON billing_purchase_invoices (status, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_purchase_invoices_entity_status ON billing_purchase_invoices (entity, status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_purchase_invoices_supplier ON billing_purchase_invoices (supplier_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_purchase_invoices_category ON billing_purchase_invoices (category, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_purchase_lines_invoice ON billing_purchase_invoice_lines (purchase_invoice_id, sort_order)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_billing_purchase_attachments_invoice ON billing_purchase_attachments (purchase_invoice_id)`;
}

export async function getPurchaseInvoices(filters: PurchaseInvoiceFilters = {}): Promise<PaginatedBillingPurchaseInvoices> {
  await ensurePurchaseTables();
  const sql = getNeonClient();
  const query = nullable(filters.query);
  const status = filters.status && filters.status !== "all" ? filters.status : null;
  const entity = filters.entity && filters.entity !== "all" ? filters.entity : null;
  const category = filters.category && filters.category !== "all" ? filters.category : null;
  const pageSize = normalizePageSize(filters.pageSize);
  const page = normalizePage(filters.page);
  const offset = (page - 1) * pageSize;

  const rows = (await sql`
    SELECT
      pi.*,
      s.name AS supplier_name,
      s.email AS supplier_email,
      COUNT(pa.id)::int AS attachment_count,
      COUNT(*) OVER()::int AS total_count
    FROM billing_purchase_invoices pi
    JOIN billing_suppliers s ON s.id = pi.supplier_id
    LEFT JOIN billing_purchase_attachments pa ON pa.purchase_invoice_id = pi.id
    WHERE (${status}::text IS NULL OR pi.status = ${status})
      AND (${entity}::text IS NULL OR pi.entity = ${entity})
      AND (${category}::text IS NULL OR pi.category = ${category})
      AND (
        ${query}::text IS NULL
        OR LOWER(s.name) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(s.email, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(pi.invoice_number, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
        OR LOWER(COALESCE(pi.source_mailbox, '')) LIKE LOWER(${"%" + (query ?? "") + "%"})
      )
    GROUP BY pi.id, s.name, s.email
    ORDER BY
      CASE WHEN pi.status = 'NEEDS_REVIEW' THEN 0 WHEN pi.status = 'DETECTED' THEN 1 ELSE 2 END,
      pi.created_at DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `) as Array<BillingPurchaseInvoiceListRow & { total_count: number }>;
  const total = rows[0]?.total_count ?? 0;
  return { items: rows.map(stripTotalCount), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getPurchaseInvoiceDetails(id: number): Promise<PurchaseInvoiceDetails | null> {
  await ensurePurchaseTables();
  const sql = getNeonClient();
  const invoiceRows = (await sql`SELECT * FROM billing_purchase_invoices WHERE id = ${id} LIMIT 1`) as BillingPurchaseInvoiceRow[];
  const invoice = invoiceRows[0];
  if (!invoice) return null;

  const [supplierRows, lineRows, attachmentRows, importRows] = await Promise.all([
    sql`SELECT * FROM billing_suppliers WHERE id = ${invoice.supplier_id} LIMIT 1`,
    sql`SELECT * FROM billing_purchase_invoice_lines WHERE purchase_invoice_id = ${id} ORDER BY sort_order ASC, id ASC`,
    sql`SELECT * FROM billing_purchase_attachments WHERE purchase_invoice_id = ${id} ORDER BY created_at DESC`,
    invoice.source_mailbox && invoice.source_message_id
      ? sql`
          SELECT *
          FROM billing_purchase_email_imports
          WHERE mailbox = ${invoice.source_mailbox} AND message_id = ${invoice.source_message_id}
          LIMIT 1
        `
      : Promise.resolve([]),
  ]);
  const supplier = (supplierRows as BillingSupplierRow[])[0];
  if (!supplier) return null;
  return {
    invoice,
    supplier,
    lines: lineRows as BillingPurchaseInvoiceLineRow[],
    attachments: attachmentRows as BillingPurchaseAttachmentRow[],
    emailImport: ((importRows as BillingPurchaseEmailImportRow[])[0] ?? null),
  };
}

export async function validatePurchaseInvoice(id: number, reviewNotes?: string | null) {
  await ensurePurchaseTables();
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_purchase_invoices
    SET status = 'VALIDATED',
        reviewed_at = NOW(),
        rejected_at = NULL,
        rejection_reason = NULL,
        review_notes = ${nullable(reviewNotes)},
        updated_at = NOW()
    WHERE id = ${id}
      AND status IN ('DETECTED', 'NEEDS_REVIEW', 'REJECTED')
    RETURNING *
  `) as BillingPurchaseInvoiceRow[];
  const invoice = rows[0];
  if (!invoice) throw new Error("Facture d'achat introuvable ou déjà verrouillée.");
  await createBillingEvent({
    eventType: "purchase_invoice.validated",
    entityType: "purchase_invoice",
    entityId: String(invoice.id),
    source: "user",
    metadata: { supplier_id: invoice.supplier_id, total_cents: invoice.total_cents },
  });
  return invoice;
}

export async function rejectPurchaseInvoice(id: number, reason?: string | null) {
  await ensurePurchaseTables();
  const sql = getNeonClient();
  const rows = (await sql`
    UPDATE billing_purchase_invoices
    SET status = 'REJECTED',
        rejected_at = NOW(),
        reviewed_at = NULL,
        rejection_reason = ${nullable(reason)},
        updated_at = NOW()
    WHERE id = ${id}
      AND status IN ('DETECTED', 'NEEDS_REVIEW', 'VALIDATED')
    RETURNING *
  `) as BillingPurchaseInvoiceRow[];
  const invoice = rows[0];
  if (!invoice) throw new Error("Facture d'achat introuvable.");
  await createBillingEvent({
    eventType: "purchase_invoice.rejected",
    entityType: "purchase_invoice",
    entityId: String(invoice.id),
    source: "user",
    metadata: { reason: reason ?? null },
  });
  return invoice;
}

export async function recordPurchaseEmailScanSkipped(reason: string, metadata?: Record<string, unknown>) {
  await createBillingEvent({
    eventType: "purchase_email_scan.skipped",
    entityType: "purchase_email_scan",
    entityId: new Date().toISOString(),
    source: "cron",
    metadata: { reason, ...metadata },
  });
}

function nullable(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizePage(page?: number) {
  if (!Number.isFinite(page)) return 1;
  return Math.max(1, Math.floor(page ?? 1));
}

function normalizePageSize(pageSize?: number) {
  if (!Number.isFinite(pageSize)) return 20;
  return Math.max(10, Math.min(100, Math.floor(pageSize ?? 20)));
}

function stripTotalCount<T extends { total_count: number }>(row: T) {
  const { total_count: _totalCount, ...copy } = row;
  void _totalCount;
  return copy;
}
