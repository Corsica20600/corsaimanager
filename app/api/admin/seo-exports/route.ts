import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getNeonClient } from "@/lib/neon";
import type { SeoActionPlanItem } from "@/lib/seo/exportReport";

export const dynamic = "force-dynamic";

type ExportPayload = {
  type?: string;
  pagesCount?: number;
  opportunitiesCount?: number;
  averageScore?: number;
  actionPlan?: SeoActionPlanItem[];
};

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const payload = (await request.json()) as ExportPayload;

  try {
    const exportId = await saveExportHistory(payload);
    return NextResponse.json({ ok: true, exportId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export non historise." },
      { status: 500 },
    );
  }
}

async function saveExportHistory(payload: ExportPayload) {
  const sql = getNeonClient();
  await sql`
    CREATE TABLE IF NOT EXISTS seo_exports (
      id BIGSERIAL PRIMARY KEY,
      account_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      export_type TEXT NOT NULL,
      pages_count INTEGER NOT NULL DEFAULT 0,
      opportunities_count INTEGER NOT NULL DEFAULT 0,
      average_score INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS seo_action_plan_items (
      id BIGSERIAL PRIMARY KEY,
      export_id BIGINT REFERENCES seo_exports(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      level TEXT NOT NULL,
      priority TEXT NOT NULL,
      page_url TEXT NOT NULL,
      problem TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      estimated_impact TEXT NOT NULL,
      estimated_effort TEXT NOT NULL,
      data_used TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const rows = await sql`
    INSERT INTO seo_exports (
      account_id,
      project_id,
      site_id,
      export_type,
      pages_count,
      opportunities_count,
      average_score
    )
    VALUES (
      ${"corsaimanager-internal"},
      ${"corsaimanager-seo"},
      ${"corsaimanager.com"},
      ${payload.type ?? "unknown"},
      ${payload.pagesCount ?? 0},
      ${payload.opportunitiesCount ?? 0},
      ${payload.averageScore ?? 0}
    )
    RETURNING id
  ` as Array<{ id: number }>;

  const exportId = rows[0]?.id;
  if (!exportId) return null;

  for (const item of payload.actionPlan ?? []) {
    await sql`
      INSERT INTO seo_action_plan_items (
        export_id,
        account_id,
        project_id,
        site_id,
        level,
        priority,
        page_url,
        problem,
        recommendation,
        estimated_impact,
        estimated_effort,
        data_used
      )
      VALUES (
        ${exportId},
        ${"corsaimanager-internal"},
        ${"corsaimanager-seo"},
        ${"corsaimanager.com"},
        ${item.level},
        ${item.priority},
        ${item.page},
        ${item.problem},
        ${item.recommendation},
        ${item.estimatedImpact},
        ${item.estimatedEffort},
        ${item.dataUsed}
      )
    `;
  }

  return exportId;
}
