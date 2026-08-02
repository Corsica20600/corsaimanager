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
  PurchaseCategory,
  PurchaseEntity,
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

export type PurchaseAttachmentInput = {
  filename: string;
  content_type?: string | null;
  size_bytes?: number | null;
  blob_url: string;
  blob_path: string;
  checksum_sha256?: string | null;
};

export type PurchaseInvoiceImportInput = {
  mailbox: string;
  provider: "gmail" | "imap";
  message_id: string;
  subject?: string | null;
  sender?: string | null;
  received_at?: string | null;
  supplier: {
    name: string;
    email?: string | null;
    website?: string | null;
    vat_number?: string | null;
    siren_or_siret?: string | null;
  };
  entity: PurchaseEntity;
  category: PurchaseCategory;
  invoice_number?: string | null;
  invoice_date?: string | null;
  due_at?: string | null;
  currency: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  ai_confidence?: number | null;
  ai_summary?: string | null;
  ai_raw_extraction?: Record<string, unknown> | null;
  lines: Array<{
    description: string;
    quantity_milli: number;
    unit_price_cents: number;
    vat_rate_basis_points: number;
    total_cents: number;
    sort_order?: number;
  }>;
  attachments: PurchaseAttachmentInput[];
};

export async function getPurchaseEmailImport(mailbox: string, messageId: string) {
  await ensurePurchaseTables();
  const sql = getNeonClient();
  const rows = (await sql`
    SELECT *
    FROM billing_purchase_email_imports
    WHERE mailbox = ${mailbox} AND message_id = ${messageId}
    LIMIT 1
  `) as BillingPurchaseEmailImportRow[];
  return rows[0] ?? null;
}

export async function recordPurchaseEmailImportStatus({
  mailbox,
  provider,
  message_id,
  subject,
  sender,
  received_at,
  status,
  error,
  metadata,
}: {
  mailbox: string;
  provider: "gmail" | "imap";
  message_id: string;
  subject?: string | null;
  sender?: string | null;
  received_at?: string | null;
  status: BillingPurchaseEmailImportRow["status"];
  error?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  await ensurePurchaseTables();
  const sql = getNeonClient();
  const rows = (await sql`
    INSERT INTO billing_purchase_email_imports (
      mailbox, provider, message_id, subject, sender, received_at, status, error, metadata
    )
    VALUES (
      ${mailbox}, ${provider}, ${message_id}, ${nullable(subject)}, ${nullable(sender)}, ${nullable(received_at)}, ${status}, ${nullable(error)}, ${metadata ?? null}
    )
    ON CONFLICT (mailbox, message_id) DO UPDATE SET
      subject = COALESCE(EXCLUDED.subject, billing_purchase_email_imports.subject),
      sender = COALESCE(EXCLUDED.sender, billing_purchase_email_imports.sender),
      received_at = COALESCE(EXCLUDED.received_at, billing_purchase_email_imports.received_at),
      status = EXCLUDED.status,
      error = EXCLUDED.error,
      metadata = COALESCE(EXCLUDED.metadata, billing_purchase_email_imports.metadata),
      updated_at = NOW()
    RETURNING *
  `) as BillingPurchaseEmailImportRow[];
  return rows[0] ?? null;
}

export async function createPurchaseInvoiceFromEmailImport(input: PurchaseInvoiceImportInput) {
  await ensurePurchaseTables();
  const sql = getNeonClient();
  const supplierName = input.supplier.name.trim();
  if (!supplierName) throw new Error("Nom fournisseur manquant.");
  const normalizedSupplierName = normalizeSupplierName(supplierName);
  const currency = normalizeCurrency(input.currency);
  const confidence = normalizeConfidence(input.ai_confidence);
  const lines = normalizePurchaseLines(input.lines, input.total_cents);

  const importRows = (await sql`
      INSERT INTO billing_purchase_email_imports (
        mailbox, provider, message_id, subject, sender, received_at, status, metadata
      )
      VALUES (
        ${input.mailbox}, ${input.provider}, ${input.message_id}, ${nullable(input.subject)}, ${nullable(input.sender)}, ${nullable(input.received_at)}, 'SCANNED', ${input.ai_raw_extraction ?? null}
      )
      ON CONFLICT (mailbox, message_id) DO UPDATE SET
        subject = COALESCE(EXCLUDED.subject, billing_purchase_email_imports.subject),
        sender = COALESCE(EXCLUDED.sender, billing_purchase_email_imports.sender),
        received_at = COALESCE(EXCLUDED.received_at, billing_purchase_email_imports.received_at),
        updated_at = NOW()
      RETURNING *
    `) as BillingPurchaseEmailImportRow[];
  const emailImport = importRows[0];
  if (!emailImport) throw new Error("Import email impossible.");
  if (emailImport.purchase_invoice_id) {
    return { invoiceId: emailImport.purchase_invoice_id, created: false };
  }

  const supplierRows = (await sql`
      INSERT INTO billing_suppliers (
        name, normalized_name, email, website, vat_number, siren_or_siret, default_category, metadata
      )
      VALUES (
        ${supplierName}, ${normalizedSupplierName}, ${nullable(input.supplier.email)}, ${nullable(input.supplier.website)},
        ${nullable(input.supplier.vat_number)}, ${nullable(input.supplier.siren_or_siret)}, ${input.category}, ${input.ai_raw_extraction ?? null}
      )
      ON CONFLICT (normalized_name) DO UPDATE SET
        email = COALESCE(billing_suppliers.email, EXCLUDED.email),
        website = COALESCE(billing_suppliers.website, EXCLUDED.website),
        vat_number = COALESCE(billing_suppliers.vat_number, EXCLUDED.vat_number),
        siren_or_siret = COALESCE(billing_suppliers.siren_or_siret, EXCLUDED.siren_or_siret),
        default_category = COALESCE(billing_suppliers.default_category, EXCLUDED.default_category),
        updated_at = NOW()
      RETURNING *
    `) as BillingSupplierRow[];
  const supplier = supplierRows[0];
  if (!supplier) throw new Error("Création fournisseur impossible.");

  const invoiceRows = (await sql`
      INSERT INTO billing_purchase_invoices (
        supplier_id, entity, status, category, invoice_number, invoice_date, due_at, currency,
        subtotal_cents, tax_cents, total_cents, source_mailbox, source_message_id, ai_confidence,
        ai_summary, ai_raw_extraction
      )
      VALUES (
        ${supplier.id}, ${input.entity}, 'NEEDS_REVIEW', ${input.category}, ${nullable(input.invoice_number)}, ${nullable(input.invoice_date)},
        ${nullable(input.due_at)}, ${currency}, ${positiveCents(input.subtotal_cents)}, ${positiveCents(input.tax_cents)},
        ${positiveCents(input.total_cents)}, ${input.mailbox}, ${input.message_id}, ${confidence},
        ${nullable(input.ai_summary)}, ${input.ai_raw_extraction ?? null}
      )
      ON CONFLICT (source_mailbox, source_message_id) WHERE source_mailbox IS NOT NULL AND source_message_id IS NOT NULL
      DO UPDATE SET
        ai_confidence = COALESCE(EXCLUDED.ai_confidence, billing_purchase_invoices.ai_confidence),
        ai_summary = COALESCE(EXCLUDED.ai_summary, billing_purchase_invoices.ai_summary),
        ai_raw_extraction = COALESCE(EXCLUDED.ai_raw_extraction, billing_purchase_invoices.ai_raw_extraction),
        updated_at = NOW()
      RETURNING *
    `) as BillingPurchaseInvoiceRow[];
  const invoice = invoiceRows[0];
  if (!invoice) throw new Error("Création facture d'achat impossible.");

  await sql`DELETE FROM billing_purchase_invoice_lines WHERE purchase_invoice_id = ${invoice.id}`;
  for (const [index, line] of lines.entries()) {
    await sql`
        INSERT INTO billing_purchase_invoice_lines (
          purchase_invoice_id, description, quantity_milli, unit_price_cents, vat_rate_basis_points, total_cents, sort_order
        )
        VALUES (
          ${invoice.id}, ${line.description}, ${line.quantity_milli}, ${line.unit_price_cents}, ${line.vat_rate_basis_points}, ${line.total_cents}, ${line.sort_order ?? index}
        )
      `;
  }

  for (const attachment of input.attachments) {
    await sql`
        INSERT INTO billing_purchase_attachments (
          purchase_invoice_id, email_import_id, filename, content_type, size_bytes, blob_url, blob_path, checksum_sha256
        )
        VALUES (
          ${invoice.id}, ${emailImport.id}, ${attachment.filename}, ${nullable(attachment.content_type)}, ${attachment.size_bytes ?? null},
          ${attachment.blob_url}, ${attachment.blob_path}, ${nullable(attachment.checksum_sha256)}
        )
      `;
  }

  await sql`
      UPDATE billing_purchase_email_imports
      SET status = 'EXTRACTED', purchase_invoice_id = ${invoice.id}, error = NULL, updated_at = NOW()
      WHERE id = ${emailImport.id}
    `;
  const result = { invoiceId: invoice.id, created: true };

  if (result.created) {
    await createBillingEvent({
      eventType: "purchase_invoice.detected",
      entityType: "purchase_invoice",
      entityId: String(result.invoiceId),
      source: "cron",
      metadata: { mailbox: input.mailbox, message_id: input.message_id, total_cents: input.total_cents },
    });
  }
  return result;
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

function normalizeSupplierName(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeCurrency(value: string) {
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : "EUR";
}

function normalizeConfidence(value: number | null | undefined) {
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value ?? 0)));
}

function normalizePurchaseLines(lines: PurchaseInvoiceImportInput["lines"], fallbackTotalCents: number) {
  const validLines = lines
    .filter((line) => line.description.trim())
    .map((line, index) => ({
      description: line.description.trim().slice(0, 500),
      quantity_milli: Math.max(1, Math.floor(line.quantity_milli || 1000)),
      unit_price_cents: positiveCents(line.unit_price_cents),
      vat_rate_basis_points: Math.max(0, Math.floor(line.vat_rate_basis_points || 0)),
      total_cents: positiveCents(line.total_cents),
      sort_order: line.sort_order ?? index,
    }));
  if (validLines.length) return validLines;
  return [{
    description: "Facture fournisseur",
    quantity_milli: 1000,
    unit_price_cents: positiveCents(fallbackTotalCents),
    vat_rate_basis_points: 0,
    total_cents: positiveCents(fallbackTotalCents),
    sort_order: 0,
  }];
}

function positiveCents(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
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
