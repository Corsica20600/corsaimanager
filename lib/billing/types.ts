export const billingDocumentTypes = ["quote", "invoice", "credit_note"] as const;
export type BillingDocumentType = (typeof billingDocumentTypes)[number];

export const quoteStatuses = ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED", "CANCELLED"] as const;
export type QuoteStatus = (typeof quoteStatuses)[number];

export const invoiceStatuses = ["DRAFT", "FINALIZED", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID", "REFUNDED", "CANCELLED"] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];

export const invoiceOrigins = ["MANUAL", "QUOTE", "SUBSCRIPTION", "STRIPE", "IMPORT"] as const;
export type InvoiceOrigin = (typeof invoiceOrigins)[number];

export const creditNoteStatuses = ["DRAFT", "FINALIZED", "SENT", "VOID"] as const;
export type CreditNoteStatus = (typeof creditNoteStatuses)[number];

export const paymentMethods = ["card", "bank_transfer", "direct_debit", "cash", "check", "stripe", "other"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentStatuses = ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const purchaseInvoiceStatuses = ["DETECTED", "NEEDS_REVIEW", "VALIDATED", "REJECTED", "PAID"] as const;
export type PurchaseInvoiceStatus = (typeof purchaseInvoiceStatuses)[number];

export const purchaseEntities = ["CORSAIMANAGER", "SENTIERU", "TRAKNIO"] as const;
export type PurchaseEntity = (typeof purchaseEntities)[number];

export const purchaseCategories = [
  "hosting",
  "domain_name",
  "advertising",
  "publication_fees",
  "software",
  "bank_fees",
  "subcontracting",
  "other",
] as const;
export type PurchaseCategory = (typeof purchaseCategories)[number];

export const subscriptionStatuses = ["INCOMPLETE", "TRIALING", "ACTIVE", "PAST_DUE", "PAUSED", "UNPAID", "CANCELLED", "EXPIRED"] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export type BillingPermission =
  | "billing:view"
  | "billing:create_draft"
  | "billing:update_draft"
  | "billing:finalize_invoice"
  | "billing:send_document"
  | "billing:record_payment"
  | "billing:create_credit_note"
  | "billing:manage_purchases"
  | "billing:manage_subscriptions"
  | "billing:manage_settings"
  | "billing:view_stats";

export type BillingSettingsRow = {
  id: number;
  legal_name: string | null;
  trade_name: string;
  legal_status: string;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  siren_or_siret: string | null;
  vat_number: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  iban: string | null;
  bic: string | null;
  logo_url: string | null;
  default_currency: string;
  default_vat_rate_basis_points: number;
  default_payment_terms_days: number;
  late_payment_penalties: string | null;
  recovery_fee_cents: number;
  quote_prefix: string;
  invoice_prefix: string;
  credit_note_prefix: string;
  default_quote_next_number: number;
  default_invoice_next_number: number;
  default_credit_note_next_number: number;
  vat_exemption_enabled: boolean;
  vat_exemption_note: string;
  default_terms: string | null;
  default_notes: string | null;
  pdf_primary_color: string;
  created_at: string;
  updated_at: string;
};

export type BillingProductRow = {
  id: number;
  name: string;
  description: string | null;
  internal_reference: string | null;
  type: "product" | "service";
  unit_price_cents: number;
  vat_rate_basis_points: number;
  unit: string;
  recurrence: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingSubscriptionPlanRow = {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  frequency: "monthly" | "yearly";
  payment_method: PaymentMethod;
  trial_days: number;
  setup_fee_cents: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  features: string[];
  vat_rate_basis_points: number;
  is_active: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingCustomerSubscriptionRow = {
  id: number;
  prospect_id: number;
  plan_id: number | null;
  status: SubscriptionStatus;
  invoice_day: number;
  reminder_days_before: number;
  last_reminder_at: string | null;
  auto_send_invoices: boolean;
  started_at: string | null;
  trial_ends_at: string | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  next_invoice_at: string | null;
  cancel_at: string | null;
  cancelled_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  cancellation_mode: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type BillingStripeEventRow = {
  id: number;
  stripe_event_id: string;
  event_type: string;
  status: "received" | "processed" | "failed" | "ignored";
  payload: Record<string, unknown> | null;
  processed_at: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientSnapshot = {
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
  department: string | null;
  vat_number: string | null;
  siren_or_siret: string | null;
};

export type BillingSnapshot = {
  legal_name: string | null;
  trade_name: string;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  siren_or_siret: string | null;
  vat_number: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  iban: string | null;
  bic: string | null;
  logo_url: string | null;
  vat_exemption_enabled: boolean;
  vat_exemption_note: string;
  pdf_primary_color: string;
};

export type BillingQuoteRow = {
  id: number;
  prospect_id: number;
  number: string | null;
  public_token_hash: string | null;
  public_token_revoked_at: string | null;
  created_at: string;
  issued_at: string | null;
  expires_at: string | null;
  status: QuoteStatus;
  currency: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  discount_cents: number;
  deposit_cents: number;
  notes: string | null;
  terms: string | null;
  pdf_url: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  accepted_by_name: string | null;
  acceptance_ip: string | null;
  acceptance_user_agent: string | null;
  acceptance_comment: string | null;
  converted_invoice_id: number | null;
  client_snapshot: ClientSnapshot | null;
  billing_snapshot: BillingSnapshot | null;
  metadata: Record<string, unknown> | null;
  updated_at: string;
};

export type BillingQuoteLineRow = {
  id: number;
  quote_id: number;
  product_id: number | null;
  description: string;
  quantity_milli: number;
  unit: string;
  unit_price_cents: number;
  vat_rate_basis_points: number;
  discount_basis_points: number;
  total_cents: number;
  sort_order: number;
  created_at: string;
};

export type BillingInvoiceRow = {
  id: number;
  prospect_id: number;
  number: string | null;
  origin: InvoiceOrigin;
  quote_id: number | null;
  customer_subscription_id: number | null;
  stripe_invoice_id: string | null;
  stripe_invoice_number: string | null;
  created_at: string;
  issued_at: string | null;
  due_at: string | null;
  finalized_at: string | null;
  status: InvoiceStatus;
  currency: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  paid_cents: number;
  remaining_cents: number;
  notes: string | null;
  terms: string | null;
  pdf_url: string | null;
  stripe_hosted_invoice_url: string | null;
  stripe_invoice_pdf_url: string | null;
  sent_at: string | null;
  paid_at: string | null;
  voided_at: string | null;
  cancelled_at: string | null;
  reminder_disabled_at: string | null;
  client_snapshot: ClientSnapshot | null;
  billing_snapshot: BillingSnapshot | null;
  metadata: Record<string, unknown> | null;
  updated_at: string;
};

export type BillingInvoiceLineRow = {
  id: number;
  invoice_id: number;
  product_id: number | null;
  description: string;
  quantity_milli: number;
  unit: string;
  unit_price_cents: number;
  vat_rate_basis_points: number;
  discount_basis_points: number;
  total_cents: number;
  sort_order: number;
  created_at: string;
};

export type BillingPaymentRow = {
  id: number;
  prospect_id: number;
  invoice_id: number | null;
  amount_cents: number;
  currency: string;
  paid_at: string | null;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  comment: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type BillingSupplierRow = {
  id: number;
  name: string;
  normalized_name: string;
  email: string | null;
  website: string | null;
  vat_number: string | null;
  siren_or_siret: string | null;
  default_category: PurchaseCategory | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type BillingPurchaseInvoiceRow = {
  id: number;
  supplier_id: number;
  entity: PurchaseEntity;
  status: PurchaseInvoiceStatus;
  category: PurchaseCategory;
  invoice_number: string | null;
  invoice_date: string | null;
  due_at: string | null;
  currency: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  paid_at: string | null;
  source_mailbox: string | null;
  source_message_id: string | null;
  blob_url: string | null;
  blob_path: string | null;
  ai_confidence: number | null;
  ai_summary: string | null;
  ai_raw_extraction: Record<string, unknown> | null;
  review_notes: string | null;
  reviewed_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingPurchaseInvoiceLineRow = {
  id: number;
  purchase_invoice_id: number;
  description: string;
  quantity_milli: number;
  unit_price_cents: number;
  vat_rate_basis_points: number;
  total_cents: number;
  sort_order: number;
  created_at: string;
};

export type BillingPurchaseEmailImportRow = {
  id: number;
  mailbox: string;
  provider: "gmail" | "imap";
  message_id: string;
  subject: string | null;
  sender: string | null;
  received_at: string | null;
  status: "SCANNED" | "IGNORED" | "EXTRACTED" | "FAILED";
  purchase_invoice_id: number | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type BillingPurchaseAttachmentRow = {
  id: number;
  purchase_invoice_id: number | null;
  email_import_id: number | null;
  filename: string;
  content_type: string | null;
  size_bytes: number | null;
  blob_url: string;
  blob_path: string;
  checksum_sha256: string | null;
  created_at: string;
};

export type BillingCreditNoteRow = {
  id: number;
  number: string | null;
  invoice_id: number;
  prospect_id: number;
  reason: string;
  status: CreditNoteStatus;
  issued_at: string | null;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  pdf_url: string | null;
  client_snapshot: ClientSnapshot | null;
  billing_snapshot: BillingSnapshot | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type BillingCreditNoteLineRow = {
  id: number;
  credit_note_id: number;
  product_id: number | null;
  description: string;
  quantity_milli: number;
  unit: string;
  unit_price_cents: number;
  vat_rate_basis_points: number;
  discount_basis_points: number;
  total_cents: number;
  sort_order: number;
  created_at: string;
};

export type BillingEventRow = {
  id: number;
  event_type: string;
  entity_type: string;
  entity_id: string;
  source: "user" | "system" | "stripe" | "cron";
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type BillingQuoteListRow = BillingQuoteRow & {
  company_name: string;
  contact_name: string | null;
  email: string | null;
  line_count: number;
};

export type PaginatedBillingQuotes = {
  items: BillingQuoteListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type BillingInvoiceListRow = BillingInvoiceRow & {
  company_name: string;
  contact_name: string | null;
  email: string | null;
  credit_total_cents: number;
};

export type BillingCreditNoteListRow = BillingCreditNoteRow & {
  invoice_number: string | null;
  company_name: string;
  email: string | null;
};

export type BillingPaymentListRow = BillingPaymentRow & {
  invoice_number: string | null;
  company_name: string;
  email: string | null;
};

export type PaginatedBillingInvoices = {
  items: BillingInvoiceListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PaginatedBillingPayments = {
  items: BillingPaymentListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PaginatedBillingCreditNotes = {
  items: BillingCreditNoteListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type BillingPurchaseInvoiceListRow = BillingPurchaseInvoiceRow & {
  supplier_name: string;
  supplier_email: string | null;
  attachment_count: number;
};

export type PaginatedBillingPurchaseInvoices = {
  items: BillingPurchaseInvoiceListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PurchaseInvoiceDetails = {
  invoice: BillingPurchaseInvoiceRow;
  supplier: BillingSupplierRow;
  lines: BillingPurchaseInvoiceLineRow[];
  attachments: BillingPurchaseAttachmentRow[];
  emailImport: BillingPurchaseEmailImportRow | null;
};

export type QuoteSort = "created_desc" | "created_asc" | "expires_asc" | "expires_desc" | "amount_desc" | "amount_asc";

export type QuoteFilters = {
  query?: string;
  status?: QuoteStatus | "all";
  sort?: QuoteSort;
  page?: number;
  pageSize?: number;
};

export type QuoteDetails = {
  quote: BillingQuoteRow;
  lines: BillingQuoteLineRow[];
  prospect: {
    id: number;
    company_name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address_line1: string | null;
    address_line2: string | null;
    postal_code: string | null;
    siren_or_siret: string | null;
    vat_number: string | null;
    country: string | null;
    region: string | null;
    department: string | null;
    city: string | null;
    status: string;
    website: string | null;
  };
};

export type InvoiceDetails = {
  invoice: BillingInvoiceRow;
  lines: BillingInvoiceLineRow[];
  payments: BillingPaymentRow[];
  creditNotes: BillingCreditNoteRow[];
  prospect: QuoteDetails["prospect"];
  quote: BillingQuoteRow | null;
};

export type CreditNoteDetails = {
  creditNote: BillingCreditNoteRow;
  lines: BillingCreditNoteLineRow[];
  invoice: BillingInvoiceRow;
  prospect: QuoteDetails["prospect"];
};

export type QuoteProspectOption = QuoteDetails["prospect"] & {
  quote_count: number;
};

export type BillingDashboardSummary = {
  invoiced_this_month_cents: number;
  collected_this_month_cents: number;
  outstanding_cents: number;
  overdue_invoices: number;
  pending_quotes: number;
  active_subscriptions: number;
  mrr_cents: number;
  arr_cents: number;
  failed_payments: number;
};

export type BillingLineInput = {
  description: string;
  quantity_milli: number;
  unit_price_cents: number;
  vat_rate_basis_points: number;
  discount_basis_points?: number;
};

export type QuoteLineInput = BillingLineInput & {
  unit: string;
  product_id?: number | null;
  sort_order?: number;
};

export type QuoteDraftInput = {
  prospect_id: number;
  expires_at?: string | null;
  currency: string;
  notes?: string | null;
  terms?: string | null;
  lines: QuoteLineInput[];
};

export type BillingDocumentLineInput = QuoteLineInput;

export type InvoiceDraftInput = {
  prospect_id: number;
  quote_id?: number | null;
  origin: Extract<InvoiceOrigin, "MANUAL" | "QUOTE">;
  due_at?: string | null;
  currency: string;
  notes?: string | null;
  terms?: string | null;
  lines: BillingDocumentLineInput[];
};

export type PaymentInput = {
  invoice_id: number;
  amount_cents: number;
  paid_at?: string | null;
  method: PaymentMethod;
  reference?: string | null;
  comment?: string | null;
  status: PaymentStatus;
};

export type CreditNoteDraftInput = {
  invoice_id: number;
  reason: string;
  lines: BillingDocumentLineInput[];
};

export type InvoiceSort = "issued_desc" | "issued_asc" | "due_asc" | "due_desc" | "amount_desc" | "amount_asc";
export type InvoicePaymentFilter = "all" | "paid" | "partial" | "unpaid" | "overdue";
export type InvoiceFilters = {
  query?: string;
  status?: InvoiceStatus | "all";
  payment?: InvoicePaymentFilter;
  origin?: InvoiceOrigin | "all";
  sort?: InvoiceSort;
  page?: number;
  pageSize?: number;
};

export type PurchaseInvoiceFilters = {
  query?: string;
  status?: PurchaseInvoiceStatus | "all";
  entity?: PurchaseEntity | "all";
  category?: PurchaseCategory | "all";
  page?: number;
  pageSize?: number;
};

export type BillingLineTotals = {
  gross_cents: number;
  discount_cents: number;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
};

export type BillingDocumentTotals = {
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  lines: BillingLineTotals[];
};
