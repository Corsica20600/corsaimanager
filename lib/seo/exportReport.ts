import type { Ga4Report } from "@/lib/google/analytics";
import type { QueryOpportunitiesReport, SearchPerformanceReport } from "@/lib/google/searchConsole";
import type { SeoAssistantReport } from "@/lib/seo/seoAssistant";
import type { AdminSeoAuditReport } from "@/lib/seo/siteAudit";

export type SeoActionPlanItem = {
  level: "P1" | "P2" | "P3";
  priority: "Critique" | "Haute" | "Moyenne" | "Faible";
  page: string;
  problem: string;
  recommendation: string;
  estimatedImpact: string;
  estimatedEffort: string;
  dataUsed: string[];
};

export type SeoExportPayload = {
  generatedAt: string;
  summary: {
    analyzedPages: number;
    averageInternalScore: number;
    pagesUnder80: number;
    searchConsoleClicks: number;
    searchConsoleImpressions: number;
    searchConsoleCtr: number;
    ga4Sessions: number;
    ga4OrganicSessions: number;
    ga4EngagementRate: number;
    opportunitiesCount: number;
  };
  pages: AdminSeoAuditReport["pages"];
  priorityPages: AdminSeoAuditReport["pages"];
  pagesUnder80: AdminSeoAuditReport["pages"];
  searchConsole: SearchPerformanceReport;
  queries: QueryOpportunitiesReport["queries"];
  ga4: Ga4Report;
  seoOpportunities: QueryOpportunitiesReport["quickWins"];
  aiRecommendations: SeoAssistantReport["pages"];
  newPages: SeoAssistantReport["newPages"];
  workPlan: SeoAssistantReport["workPlan"];
  actionPlan: SeoActionPlanItem[];
};

export function buildSeoExportPayload({
  auditReport,
  searchReport,
  queryReport,
  ga4Report,
  assistantReport,
}: {
  auditReport: AdminSeoAuditReport;
  searchReport: SearchPerformanceReport;
  queryReport: QueryOpportunitiesReport;
  ga4Report: Ga4Report;
  assistantReport: SeoAssistantReport;
}): SeoExportPayload {
  const priorityPages = auditReport.pages
    .filter((page) => page.priority === "Critique" || page.priority === "Haute" || page.globalScore < 90)
    .slice(0, 20);
  const pagesUnder80 = auditReport.pages.filter((page) => page.globalScore < 80);
  const actionPlan = buildActionPlan({ priorityPages, queryReport, ga4Report, assistantReport });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      analyzedPages: auditReport.summary.analyzedPages,
      averageInternalScore: auditReport.summary.averageScore,
      pagesUnder80: pagesUnder80.length,
      searchConsoleClicks: searchReport.summary.clicks,
      searchConsoleImpressions: searchReport.summary.impressions,
      searchConsoleCtr: searchReport.summary.ctr,
      ga4Sessions: ga4Report.summary.sessions,
      ga4OrganicSessions: ga4Report.organicSummary.sessions,
      ga4EngagementRate: ga4Report.summary.engagementRate,
      opportunitiesCount: queryReport.quickWins.length + assistantReport.newPages.length + ga4Report.businessOpportunities.length,
    },
    pages: auditReport.pages,
    priorityPages,
    pagesUnder80,
    searchConsole: searchReport,
    queries: queryReport.queries.slice(0, 80),
    ga4: ga4Report,
    seoOpportunities: queryReport.quickWins,
    aiRecommendations: assistantReport.pages,
    newPages: assistantReport.newPages,
    workPlan: assistantReport.workPlan,
    actionPlan,
  };
}

function buildActionPlan({
  priorityPages,
  queryReport,
  ga4Report,
  assistantReport,
}: {
  priorityPages: AdminSeoAuditReport["pages"];
  queryReport: QueryOpportunitiesReport;
  ga4Report: Ga4Report;
  assistantReport: SeoAssistantReport;
}): SeoActionPlanItem[] {
  const p1 = [
    ...priorityPages.slice(0, 3).map((page): SeoActionPlanItem => ({
      level: "P1",
      priority: page.priority,
      page: page.path,
      problem: page.issues[0] ?? "Page prioritaire à optimiser.",
      recommendation: page.objectiveActions[0]?.action ?? page.recommendations[0] ?? "Renforcer contenu, CTA et maillage.",
      estimatedImpact: page.priority === "Critique" ? "Très fort" : "Fort",
      estimatedEffort: page.scoreGap > 30 ? "Élevé" : page.scoreGap > 10 ? "Moyen" : "Faible",
      dataUsed: ["Audit SEO interne", "Score IA", "Maillage interne"],
    })),
    ...queryReport.quickWins.slice(0, 3).map((query): SeoActionPlanItem => ({
      level: "P1",
      priority: query.priority,
      page: query.url ?? query.ai.generatedUrl,
      problem: query.opportunity,
      recommendation: query.action,
      estimatedImpact: query.seoPotential >= 85 ? "Très fort" : "Fort",
      estimatedEffort: query.opportunityType === "new_page" ? "Moyen" : "Faible",
      dataUsed: ["Search Console", "Requêtes Google", "CTR", "Position moyenne"],
    })),
  ];

  const p2 = [
    ...assistantReport.pages.slice(0, 4).map((page): SeoActionPlanItem => ({
      level: "P2",
      priority: page.impact === "Très fort" ? "Haute" : "Moyenne",
      page: page.page,
      problem: page.problemSummary[0] ?? "Optimisation éditoriale nécessaire.",
      recommendation: page.actionPlan[0] ?? "Ajouter contenu, FAQ et liens internes.",
      estimatedImpact: page.impact,
      estimatedEffort: page.effort,
      dataUsed: ["Assistant SEO IA", "Audit interne", "Search Console"],
    })),
    ...ga4Report.businessOpportunities.slice(0, 3).map((item): SeoActionPlanItem => ({
      level: "P2",
      priority: item.priority,
      page: item.page,
      problem: item.detail,
      recommendation: item.action,
      estimatedImpact: item.priority === "Critique" ? "Très fort" : "Fort",
      estimatedEffort: "Moyen",
      dataUsed: ["GA4", "Engagement", "Événements", "Conversions"],
    })),
  ];

  const p3 = assistantReport.newPages.slice(0, 6).map((page): SeoActionPlanItem => ({
    level: "P3",
    priority: page.impact === "Très fort" ? "Haute" : "Moyenne",
    page: page.url,
    problem: `Aucune page dédiée pour la requête "${page.query}".`,
    recommendation: `Créer la page ${page.url} avec le H1 "${page.h1}".`,
    estimatedImpact: page.impact,
    estimatedEffort: page.effort,
    dataUsed: ["Search Console", "Requêtes Google", "Assistant SEO IA"],
  }));

  return [...p1, ...p2, ...p3].slice(0, 24);
}
