import { getNeonClient } from "@/lib/neon";
import { createSeoAudit, fetchPageHtml, type ExtractedSeoData, type SeoAuditBase, type SeoScoreBreakdown } from "@/lib/seo/analyzeSeo";

export const SEO_AUDIT_ORIGIN = "https://www.corsaimanager.com";

export type LiveSeoAuditRun = {
  id: number | null;
  runType: "full" | "page";
  status: "completed" | "failed";
  startedAt: string;
  completedAt: string;
  pagesCount: number;
  averageScore: number;
  priorityPages: number;
  source: string;
};

export type LiveSeoAuditPage = {
  url: string;
  score: number;
  priority: "Critique" | "Haute" | "Moyenne" | "Faible";
  title: string;
  metaDescription: string;
  h1: string[];
  h2Count: number;
  h3Count: number;
  faqCount: number;
  internalLinksCount: number;
  ctaCount: number;
  schemaCount: number;
  wordCount: number;
  scoreBreakdown: SeoScoreBreakdown;
  extracted: Pick<
    ExtractedSeoData,
    "title" | "metaDescription" | "h1" | "h2" | "h3" | "internalLinks" | "wordCount" | "faqCount" | "ctaCount" | "schemaCount" | "schemaTypes"
  >;
  issues: string[];
  recommendations: string[];
};

export type LiveSeoAuditResult = {
  run: LiveSeoAuditRun;
  pages: LiveSeoAuditPage[];
};

let memoryStamp = 0;

export async function runLiveSeoAudit(options?: { url?: string }): Promise<LiveSeoAuditResult> {
  const startedAt = new Date().toISOString();
  const urls = options?.url ? [toProductionUrl(options.url)] : await getProductionSitemapUrls();
  const pages: LiveSeoAuditResult["pages"] = [];

  for (const url of urls) {
    try {
      const html = await fetchProductionHtml(url);
      const audit = createSeoAudit(url, html);
      pages.push(mapAuditPage(audit));
    } catch (error) {
      pages.push({
        url,
        score: 0,
        priority: "Critique",
        title: "Erreur d'analyse",
        metaDescription: "",
        h1: [],
        h2Count: 0,
        h3Count: 0,
        faqCount: 0,
        internalLinksCount: 0,
        ctaCount: 0,
        schemaCount: 0,
        wordCount: 0,
        scoreBreakdown: emptyScoreBreakdown(),
        extracted: {
          title: "Erreur d'analyse",
          metaDescription: "",
          h1: [],
          h2: [],
          h3: [],
          internalLinks: [],
          wordCount: 0,
          faqCount: 0,
          ctaCount: 0,
          schemaCount: 0,
          schemaTypes: [],
        },
        issues: [error instanceof Error ? error.message : "Erreur inconnue pendant l'analyse."],
        recommendations: ["Vérifier que l'URL production répond bien en HTML et relancer l'audit."],
      });
    }
  }

  const averageScore = Math.round(pages.reduce((sum, page) => sum + page.score, 0) / Math.max(1, pages.length));
  const completedAt = new Date().toISOString();
  const run: LiveSeoAuditRun = {
    id: null,
    runType: options?.url ? "page" : "full",
    status: pages.some((page) => page.score === 0) ? "failed" : "completed",
    startedAt,
    completedAt,
    pagesCount: pages.length,
    averageScore,
    priorityPages: pages.filter((page) => page.priority === "Critique" || page.priority === "Haute").length,
    source: SEO_AUDIT_ORIGIN,
  };

  run.id = await saveLiveSeoAudit(run, pages);
  if (run.runType === "page") {
    await updateLatestFullAuditPages(pages, completedAt);
  }
  memoryStamp = Date.now();
  return { run, pages };
}

export async function getLatestLiveSeoAuditRun(): Promise<LiveSeoAuditRun | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const sql = getNeonClient();
    await ensureTables();
    const rows = await sql`
      SELECT id, run_type, status, started_at, completed_at, pages_count, average_score, priority_pages, source
      FROM seo_audit_runs
      WHERE run_type = 'full'
      ORDER BY completed_at DESC
      LIMIT 1
    ` as Array<{
      id: number;
      run_type: "full" | "page";
      status: "completed" | "failed";
      started_at: Date | string;
      completed_at: Date | string;
      pages_count: number;
      average_score: number;
      priority_pages: number;
      source: string;
    }>;
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      runType: row.run_type,
      status: row.status,
      startedAt: new Date(row.started_at).toISOString(),
      completedAt: new Date(row.completed_at).toISOString(),
      pagesCount: row.pages_count,
      averageScore: row.average_score,
      priorityPages: row.priority_pages,
      source: row.source,
    };
  } catch {
    return null;
  }
}

export async function getLatestLiveSeoAuditSnapshot(): Promise<LiveSeoAuditResult | null> {
  const run = await getLatestLiveSeoAuditRun();
  if (!run?.id || !process.env.DATABASE_URL) return run ? { run, pages: [] } : null;
  try {
    const sql = getNeonClient();
    await ensureTables();
    const rows = await sql`
      SELECT page_url, score, priority, title, meta_description, h1, h2_count, h3_count, faq_count, internal_links_count, cta_count, schema_count, word_count, score_breakdown, extracted, issues, recommendations
      FROM seo_audit_page_results
      WHERE run_id = ${run.id}
      ORDER BY score ASC, page_url ASC
    ` as Array<{
      page_url: string;
      score: number;
      priority: LiveSeoAuditPage["priority"];
      title: string | null;
      meta_description: string | null;
      h1: string[];
      h2_count: number;
      h3_count: number;
      faq_count: number;
      internal_links_count: number;
      cta_count: number;
      schema_count: number;
      word_count: number;
      score_breakdown: SeoScoreBreakdown | null;
      extracted: LiveSeoAuditPage["extracted"] | null;
      issues: string[];
      recommendations: string[];
    }>;

    return {
      run,
      pages: rows.map((row) => ({
        url: row.page_url,
        score: row.score,
        priority: row.priority,
        title: row.title ?? "Page analysée",
        metaDescription: row.meta_description ?? "",
        h1: row.h1 ?? [],
        h2Count: row.h2_count ?? 0,
        h3Count: row.h3_count ?? 0,
        faqCount: row.faq_count ?? 0,
        internalLinksCount: row.internal_links_count ?? 0,
        ctaCount: row.cta_count ?? 0,
        schemaCount: row.schema_count ?? 0,
        wordCount: row.word_count,
        scoreBreakdown: row.score_breakdown ?? emptyScoreBreakdown(),
        extracted: row.extracted ?? {
          title: row.title ?? "Page analysée",
          metaDescription: row.meta_description ?? "",
          h1: row.h1 ?? [],
          h2: [],
          h3: [],
          internalLinks: [],
          wordCount: row.word_count,
          faqCount: row.faq_count ?? 0,
          ctaCount: row.cta_count ?? 0,
          schemaCount: row.schema_count ?? 0,
          schemaTypes: [],
        },
        issues: row.issues ?? [],
        recommendations: row.recommendations ?? [],
      })),
    };
  } catch {
    return { run, pages: [] };
  }
}

export async function clearSeoAuditCache() {
  memoryStamp = Date.now();
  if (!process.env.DATABASE_URL) return { clearedAt: new Date(memoryStamp).toISOString() };
  try {
    const sql = getNeonClient();
    await ensureTables();
    await sql`
      INSERT INTO seo_audit_cache_events (event_type, created_at)
      VALUES (${"clear"}, NOW())
    `;
  } catch {
    // Cache clearing is best-effort; live audits always use no-store fetches.
  }
  return { clearedAt: new Date(memoryStamp).toISOString() };
}

async function getProductionSitemapUrls() {
  const response = await fetch(`${SEO_AUDIT_ORIGIN}/sitemap.xml?seoRefresh=${Date.now()}`, {
    cache: "no-store",
    headers: { accept: "application/xml,text/xml" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Sitemap production indisponible (${response.status}).`);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url): url is string => Boolean(url))
    .map(toProductionUrl)
    .filter((url) => shouldAuditUrl(url));
  return Array.from(new Set(urls));
}

async function fetchProductionHtml(url: string) {
  const productionUrl = new URL(toProductionUrl(url));
  productionUrl.searchParams.set("seoRefresh", String(Date.now()));
  return fetchPageHtml(productionUrl.toString());
}

function toProductionUrl(value: string) {
  const parsed = new URL(value, SEO_AUDIT_ORIGIN);
  return `${SEO_AUDIT_ORIGIN}${parsed.pathname.replace(/\/$/, "") || "/"}${parsed.search}`;
}

function shouldAuditUrl(url: string) {
  const pathname = new URL(url).pathname;
  return !pathname.startsWith("/admin") && !pathname.startsWith("/api");
}

function mapAuditPage(audit: SeoAuditBase): LiveSeoAuditResult["pages"][number] {
  return {
    url: audit.url,
    score: audit.globalScore,
    priority: getPriority(audit.globalScore),
    title: audit.extracted.title,
    metaDescription: audit.extracted.metaDescription,
    h1: audit.extracted.h1,
    h2Count: audit.extracted.h2.length,
    h3Count: audit.extracted.h3.length,
    faqCount: audit.extracted.faqCount,
    internalLinksCount: audit.extracted.internalLinks.length,
    ctaCount: audit.extracted.ctaCount,
    schemaCount: audit.extracted.schemaCount,
    wordCount: audit.extracted.wordCount,
    scoreBreakdown: audit.scoreBreakdown,
    extracted: {
      title: audit.extracted.title,
      metaDescription: audit.extracted.metaDescription,
      h1: audit.extracted.h1,
      h2: audit.extracted.h2,
      h3: audit.extracted.h3,
      internalLinks: audit.extracted.internalLinks,
      wordCount: audit.extracted.wordCount,
      faqCount: audit.extracted.faqCount,
      ctaCount: audit.extracted.ctaCount,
      schemaCount: audit.extracted.schemaCount,
      schemaTypes: audit.extracted.schemaTypes,
    },
    issues: audit.findings.filter((finding) => finding.type !== "success").map((finding) => finding.detail),
    recommendations: audit.recommendations.map((recommendation) => recommendation.action),
  };
}

function getPriority(score: number): LiveSeoAuditResult["pages"][number]["priority"] {
  if (score < 60) return "Critique";
  if (score < 80) return "Haute";
  if (score < 95) return "Moyenne";
  return "Faible";
}

async function saveLiveSeoAudit(run: LiveSeoAuditRun, pages: LiveSeoAuditResult["pages"]) {
  if (!process.env.DATABASE_URL) return null;
  try {
    const sql = getNeonClient();
    await ensureTables();
    const rows = await sql`
      INSERT INTO seo_audit_runs (
        run_type,
        status,
        started_at,
        completed_at,
        pages_count,
        average_score,
        priority_pages,
        source
      )
      VALUES (
        ${run.runType},
        ${run.status},
        ${run.startedAt},
        ${run.completedAt},
        ${run.pagesCount},
        ${run.averageScore},
        ${run.priorityPages},
        ${run.source}
      )
      RETURNING id
    ` as Array<{ id: number }>;
    const runId = rows[0]?.id ?? null;

    if (runId) {
      for (const page of pages) {
        await sql`
          INSERT INTO seo_audit_page_results (
            run_id,
            page_url,
            score,
            priority,
            title,
            meta_description,
            h1,
            h2_count,
            h3_count,
            faq_count,
            internal_links_count,
            cta_count,
            schema_count,
            word_count,
            score_breakdown,
            extracted,
            issues,
            recommendations
          )
          VALUES (
            ${runId},
            ${page.url},
            ${page.score},
            ${page.priority},
            ${page.title},
            ${page.metaDescription},
            ${page.h1},
            ${page.h2Count},
            ${page.h3Count},
            ${page.faqCount},
            ${page.internalLinksCount},
            ${page.ctaCount},
            ${page.schemaCount},
            ${page.wordCount},
            ${JSON.stringify(page.scoreBreakdown)}::jsonb,
            ${JSON.stringify(page.extracted)}::jsonb,
            ${page.issues},
            ${page.recommendations}
          )
        `;
      }
    }

    return runId;
  } catch {
    return null;
  }
}

async function updateLatestFullAuditPages(pages: LiveSeoAuditPage[], completedAt: string) {
  if (!process.env.DATABASE_URL || !pages.length) return;
  try {
    const sql = getNeonClient();
    await ensureTables();
    const runs = await sql`
      SELECT id
      FROM seo_audit_runs
      WHERE run_type = 'full'
      ORDER BY completed_at DESC
      LIMIT 1
    ` as Array<{ id: number }>;
    const runId = runs[0]?.id;
    if (!runId) return;

    const existingRows = await sql`
      SELECT id, page_url
      FROM seo_audit_page_results
      WHERE run_id = ${runId}
    ` as Array<{ id: number; page_url: string }>;
    const rowsByPath = new Map(existingRows.map((row) => [pathnameFromUrl(row.page_url), row]));

    for (const page of pages) {
      const existing = rowsByPath.get(pathnameFromUrl(page.url));
      if (existing) {
        await sql`
          UPDATE seo_audit_page_results
          SET
            page_url = ${page.url},
            score = ${page.score},
            priority = ${page.priority},
            title = ${page.title},
            meta_description = ${page.metaDescription},
            h1 = ${page.h1},
            h2_count = ${page.h2Count},
            h3_count = ${page.h3Count},
            faq_count = ${page.faqCount},
            internal_links_count = ${page.internalLinksCount},
            cta_count = ${page.ctaCount},
            schema_count = ${page.schemaCount},
            word_count = ${page.wordCount},
            score_breakdown = ${JSON.stringify(page.scoreBreakdown)}::jsonb,
            extracted = ${JSON.stringify(page.extracted)}::jsonb,
            issues = ${page.issues},
            recommendations = ${page.recommendations},
            created_at = NOW()
          WHERE id = ${existing.id}
        `;
      } else {
        await sql`
          INSERT INTO seo_audit_page_results (
            run_id,
            page_url,
            score,
            priority,
            title,
            meta_description,
            h1,
            h2_count,
            h3_count,
            faq_count,
            internal_links_count,
            cta_count,
            schema_count,
            word_count,
            score_breakdown,
            extracted,
            issues,
            recommendations
          )
          VALUES (
            ${runId},
            ${page.url},
            ${page.score},
            ${page.priority},
            ${page.title},
            ${page.metaDescription},
            ${page.h1},
            ${page.h2Count},
            ${page.h3Count},
            ${page.faqCount},
            ${page.internalLinksCount},
            ${page.ctaCount},
            ${page.schemaCount},
            ${page.wordCount},
            ${JSON.stringify(page.scoreBreakdown)}::jsonb,
            ${JSON.stringify(page.extracted)}::jsonb,
            ${page.issues},
            ${page.recommendations}
          )
        `;
      }
    }

    const summaryRows = await sql`
      SELECT
        COUNT(*)::INTEGER AS pages_count,
        ROUND(AVG(score))::INTEGER AS average_score,
        COUNT(*) FILTER (WHERE priority IN ('Critique', 'Haute'))::INTEGER AS priority_pages
      FROM seo_audit_page_results
      WHERE run_id = ${runId}
    ` as Array<{ pages_count: number; average_score: number | null; priority_pages: number }>;
    const summary = summaryRows[0];
    await sql`
      UPDATE seo_audit_runs
      SET
        completed_at = ${completedAt},
        pages_count = ${summary?.pages_count ?? 0},
        average_score = ${summary?.average_score ?? 0},
        priority_pages = ${summary?.priority_pages ?? 0}
      WHERE id = ${runId}
    `;
  } catch {
    // A single-page audit should still return even if the full snapshot cannot be updated.
  }
}

async function ensureTables() {
  const sql = getNeonClient();
  await sql`
    CREATE TABLE IF NOT EXISTS seo_audit_runs (
      id BIGSERIAL PRIMARY KEY,
      run_type TEXT NOT NULL DEFAULT 'full',
      status TEXT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL,
      pages_count INTEGER NOT NULL DEFAULT 0,
      average_score INTEGER NOT NULL DEFAULT 0,
      priority_pages INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'https://www.corsaimanager.com',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE seo_audit_runs ADD COLUMN IF NOT EXISTS run_type TEXT NOT NULL DEFAULT 'full'`;
  await sql`
    CREATE TABLE IF NOT EXISTS seo_audit_page_results (
      id BIGSERIAL PRIMARY KEY,
      run_id BIGINT REFERENCES seo_audit_runs(id) ON DELETE CASCADE,
      page_url TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL,
      title TEXT,
      meta_description TEXT,
      h1 TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      h2_count INTEGER NOT NULL DEFAULT 0,
      h3_count INTEGER NOT NULL DEFAULT 0,
      faq_count INTEGER NOT NULL DEFAULT 0,
      internal_links_count INTEGER NOT NULL DEFAULT 0,
      cta_count INTEGER NOT NULL DEFAULT 0,
      schema_count INTEGER NOT NULL DEFAULT 0,
      word_count INTEGER NOT NULL DEFAULT 0,
      score_breakdown JSONB,
      extracted JSONB,
      issues TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      recommendations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS meta_description TEXT`;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS h1 TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS h2_count INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS h3_count INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS faq_count INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS internal_links_count INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS cta_count INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS schema_count INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS score_breakdown JSONB`;
  await sql`ALTER TABLE seo_audit_page_results ADD COLUMN IF NOT EXISTS extracted JSONB`;
  await sql`
    CREATE TABLE IF NOT EXISTS seo_audit_cache_events (
      id BIGSERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function pathnameFromUrl(value: string) {
  try {
    return new URL(value).pathname.replace(/\/$/, "") || "/";
  } catch {
    return value.replace(/^https?:\/\/[^/]+/i, "").replace(/\/$/, "") || "/";
  }
}

function emptyScoreBreakdown(): SeoScoreBreakdown {
  return {
    title: 0,
    meta: 0,
    h1: 0,
    content: 0,
    internalLinks: 0,
    faq: 0,
    cta: 0,
    schema: 0,
    intent: 0,
  };
}
