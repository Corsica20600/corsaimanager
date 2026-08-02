import { getBillingDashboardSummary } from "@/lib/billing/repository";
import { getCrmDashboard } from "@/lib/crm/repository";
import { getNeonClient } from "@/lib/neon";

export type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;

export async function getAdminDashboardData() {
  const [crm, billing, purchases, integrations] = await Promise.all([
    getCrmDashboard(),
    getBillingDashboardSummary(),
    getPurchaseSummary(),
    getIntegrationSummary(),
  ]);

  return { crm, billing, purchases, integrations };
}

async function getPurchaseSummary() {
  const sql = getNeonClient();
  const rows = (await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'NEEDS_REVIEW')::int AS needs_review,
      COUNT(*) FILTER (WHERE status = 'VALIDATED')::int AS validated,
      COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected,
      COALESCE(SUM(total_cents) FILTER (
        WHERE status IN ('NEEDS_REVIEW', 'VALIDATED', 'PAID')
          AND created_at >= date_trunc('month', NOW())
      ), 0)::int AS month_total_cents
    FROM billing_purchase_invoices
  `) as Array<{
    total: number;
    needs_review: number;
    validated: number;
    rejected: number;
    month_total_cents: number;
  }>;

  return rows[0] ?? {
    total: 0,
    needs_review: 0,
    validated: 0,
    rejected: 0,
    month_total_cents: 0,
  };
}

async function getIntegrationSummary() {
  const sql = getNeonClient();
  const [purchaseScanRows, stripeRows, openClawRows] = await Promise.all([
    sql`
      SELECT created_at, metadata
      FROM billing_events
      WHERE event_type IN ('purchase_email_scan.skipped', 'purchase_invoice.detected')
      ORDER BY created_at DESC
      LIMIT 1
    `,
    sql`
      SELECT status, processed_at, error, created_at
      FROM billing_stripe_events
      ORDER BY created_at DESC
      LIMIT 1
    `,
    sql`
      SELECT COUNT(*)::int AS pending
      FROM crm_prospects
      WHERE archived_at IS NULL
        AND source = 'openclaw'
        AND status IN ('nouveau', 'a_enrichir')
    `,
  ]);

  const purchaseScan = (purchaseScanRows as Array<{ created_at: string; metadata: Record<string, unknown> | null }>)[0] ?? null;
  const stripe = (stripeRows as Array<{ status: string; processed_at: string | null; error: string | null; created_at: string }>)[0] ?? null;
  const openClaw = (openClawRows as Array<{ pending: number }>)[0] ?? { pending: 0 };

  return {
    purchaseScan,
    stripe,
    openClawPending: openClaw.pending,
    env: {
      smtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      openai: Boolean(process.env.OPENAI_API_KEY),
      blob: Boolean(process.env.PURCHASE_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN),
      cron: Boolean(process.env.CRON_SECRET),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
      analytics: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  };
}
