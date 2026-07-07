import { NextResponse, type NextRequest } from "next/server";
import { getGa4Report } from "@/lib/google/analytics";
import { getQueryOpportunitiesReport, getSearchConsoleReport } from "@/lib/google/searchConsole";
import { buildSeoExportPayload } from "@/lib/seo/exportReport";
import { getLatestLiveSeoAuditSnapshot } from "@/lib/seo/liveAudit";
import { buildSeoAssistantReport } from "@/lib/seo/seoAssistant";
import { buildAdminSeoAudit } from "@/lib/seo/siteAudit";

export const dynamic = "force-dynamic";

function constantTimeEqual(value: string, expected: string) {
  if (!value || value.length !== expected.length) return false;

  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result |= value.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return result === 0;
}

function hasValidAgentKey(request: NextRequest) {
  const expectedKeys = [
    process.env.CORSAIMANAGER_API_KEY,
    process.env.OPENCLAW_AGENT_API_KEY,
    process.env.AI_TEAM_SECRET,
  ].filter((key): key is string => Boolean(key?.trim()));

  if (!expectedKeys.length) {
    return { ok: false, missingConfig: true };
  }

  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
  const headerKey =
    request.headers.get("x-api-key") ??
    request.headers.get("x-ai-team-secret") ??
    request.headers.get("x-openclaw-agent-key") ??
    "";

  return {
    ok: expectedKeys.some(
      (expectedKey) =>
        constantTimeEqual(bearer, expectedKey) ||
        constantTimeEqual(headerKey.trim(), expectedKey),
    ),
    missingConfig: false,
  };
}

export async function GET(request: NextRequest) {
  const auth = hasValidAgentKey(request);
  if (auth.missingConfig) {
    return NextResponse.json(
      { ok: false, error: "Aucune clé serveur AI-Team/CorsaiManager n'est configurée." },
      { status: 500 },
    );
  }

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  }

  const range = request.nextUrl.searchParams.get("range") === "3m" ? "3m" : "28d";
  const localAudit = buildAdminSeoAudit();

  const [liveAudit, searchReport, queryReport, ga4Report] = await Promise.all([
    getLatestLiveSeoAuditSnapshot(),
    getSearchConsoleReport({ range }),
    getQueryOpportunitiesReport({ range }),
    getGa4Report({ range }),
  ]);
  const assistantReport = await buildSeoAssistantReport({
    auditReport: localAudit,
    queryReport,
  });
  const exportPayload = buildSeoExportPayload({
    auditReport: localAudit,
    searchReport,
    queryReport,
    ga4Report,
    assistantReport,
  });

  return NextResponse.json(
    {
      ok: true,
      source: "corsaimanager",
      agent: "Sophie",
      role: "SEO",
      generatedAt: new Date().toISOString(),
      range,
      capabilities: [
        "AUDIT_SEO",
        "READ_SEARCH_CONSOLE",
        "READ_ANALYTICS",
        "SEO_RECOMMENDATIONS",
        "SEO_ACTION_PLAN",
      ],
      audit: {
        summary: localAudit.summary,
        priorityPages: exportPayload.priorityPages.slice(0, 12),
        pagesUnder80: exportPayload.pagesUnder80.slice(0, 12),
        live: liveAudit
          ? {
              completedAt: liveAudit.run.completedAt,
              pagesCount: liveAudit.run.pagesCount,
              averageScore: liveAudit.run.averageScore,
              source: liveAudit.run.source,
            }
          : null,
      },
      searchConsole: {
        connected: searchReport.connected,
        siteUrl: searchReport.siteUrl,
        summary: searchReport.summary,
        pages: searchReport.pages.slice(0, 20),
        queries: searchReport.queries.slice(0, 30),
        opportunities: searchReport.opportunities.slice(0, 12),
        error: searchReport.error,
      },
      analytics: {
        connected: ga4Report.connected,
        propertyId: ga4Report.propertyId,
        summary: ga4Report.summary,
        organicSummary: ga4Report.organicSummary,
        landingPages: ga4Report.landingPages.slice(0, 12),
        businessOpportunities: ga4Report.businessOpportunities.slice(0, 12),
        error: ga4Report.error,
      },
      assistant: {
        pages: assistantReport.pages.slice(0, 10),
        newPages: assistantReport.newPages.slice(0, 8),
        internalLinking: assistantReport.internalLinking,
        workPlan: assistantReport.workPlan,
      },
      actionPlan: exportPayload.actionPlan,
      humanValidationRequired: true,
      publishing: "BLOCKED_UNTIL_HUMAN_APPROVAL",
    },
    {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    },
  );
}
