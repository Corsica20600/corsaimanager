import { getNeonClient } from "@/lib/neon";
import type { QueryOpportunitiesReport, QueryOpportunity } from "@/lib/google/searchConsole";
import type { AdminSeoAuditReport, AdminSeoPageAudit } from "@/lib/seo/siteAudit";

const accountId = "corsaimanager-internal";
const projectId = "corsaimanager-seo";
const siteId = "www.corsaimanager.com";

export type SeoAssistantImpact = "Très fort" | "Fort" | "Moyen" | "Faible";
export type SeoAssistantEffort = "Faible" | "Moyen" | "Élevé";

export type SeoAssistantPageAnalysis = {
  page: string;
  title: string;
  score: number;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  queries: string[];
  problemSummary: string[];
  opportunities: string[];
  actionPlan: string[];
  optimization: {
    title: string;
    metaDescription: string;
    h1: string;
    h2h3Plan: string[];
    faq: string[];
    cta: string;
  };
  content: {
    missingParagraphs: string[];
    sectionsToAdd: string[];
    frequentQuestions: string[];
    useCases: string[];
    socialProof: string[];
  };
  impact: SeoAssistantImpact;
  effort: SeoAssistantEffort;
  roiScore: number;
};

export type SeoAssistantNewPage = {
  query: string;
  sourceUrl: string | null;
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  h2Plan: string[];
  faq: string[];
  internalLinks: Array<{ href: string; label: string }>;
  impact: SeoAssistantImpact;
  effort: SeoAssistantEffort;
  roiScore: number;
};

export type SeoAssistantReport = {
  generatedAt: string;
  accountId: string;
  projectId: string;
  siteId: string;
  pages: SeoAssistantPageAnalysis[];
  internalLinking: {
    missingInboundLinks: Array<{ page: string; suggestions: string[] }>;
    missingOutboundLinks: Array<{ page: string; suggestions: string[] }>;
    orphanPages: string[];
    clusters: Array<{ name: string; pages: string[]; recommendedHub: string }>;
  };
  newPages: SeoAssistantNewPage[];
  workPlan: {
    today: string[];
    thisWeek: string[];
    thisMonth: string[];
  };
  history: Array<{
    date: string;
    page: string;
    status: "generated";
    recommendation: string;
  }>;
};

export async function buildSeoAssistantReport({
  auditReport,
  queryReport,
}: {
  auditReport: AdminSeoAuditReport;
  queryReport: QueryOpportunitiesReport;
}): Promise<SeoAssistantReport> {
  const queriesByPath = groupQueriesByPath(queryReport.queries);
  const pages = auditReport.pages
    .filter((page) => page.priority === "Critique" || page.priority === "Haute" || page.globalScore < 90)
    .slice(0, 14)
    .map((page) => buildPageAnalysis(page, queriesByPath.get(page.path) ?? []))
    .sort((a, b) => b.roiScore - a.roiScore);
  const newPages = queryReport.newPages.slice(0, 10).map(buildNewPageRecommendation);
  const internalLinking = buildInternalLinkingReport(auditReport);
  const workPlan = buildWorkPlan(pages, newPages, internalLinking.orphanPages);
  const history = [
    ...pages.slice(0, 8).map((page) => ({
      date: new Date().toISOString(),
      page: page.page,
      status: "generated" as const,
      recommendation: page.actionPlan[0] ?? "Optimisation SEO générée.",
    })),
    ...newPages.slice(0, 4).map((page) => ({
      date: new Date().toISOString(),
      page: page.url,
      status: "generated" as const,
      recommendation: `Créer la page dédiée "${page.query}".`,
    })),
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    accountId,
    projectId,
    siteId,
    pages,
    internalLinking,
    newPages,
    workPlan,
    history,
  };

  await saveSeoAssistantHistory(report);
  return report;
}

function buildPageAnalysis(page: AdminSeoPageAudit, queries: QueryOpportunity[]): SeoAssistantPageAnalysis {
  const summary = summarizeQueryMetrics(queries);
  const topQueries = queries.slice(0, 6);
  const impact = estimateImpact(page, summary.impressions, summary.position);
  const effort = estimateEffort(page);

  return {
    page: page.path,
    title: page.title,
    score: page.globalScore,
    clicks: summary.clicks,
    impressions: summary.impressions,
    ctr: summary.ctr,
    position: summary.position,
    queries: topQueries.map((query) => query.query),
    problemSummary: buildProblemSummary(page, summary),
    opportunities: buildPageOpportunities(page, topQueries),
    actionPlan: buildPrioritizedActions(page, topQueries),
    optimization: {
      title: topQueries[0]?.ai.title ?? page.improvedSeo.title,
      metaDescription: topQueries[0]?.ai.metaDescription ?? page.improvedSeo.description,
      h1: topQueries[0]?.ai.h1 ?? page.improvedSeo.h1,
      h2h3Plan: [...page.improvedSeo.h2.slice(0, 4), ...page.improvedSeo.h3.slice(0, 3)],
      faq: page.improvedSeo.faq.map((faq) => faq.q),
      cta: page.improvedSeo.cta,
    },
    content: {
      missingParagraphs: page.improvedSeo.paragraphs,
      sectionsToAdd: buildSectionsToAdd(page),
      frequentQuestions: page.improvedSeo.faq.map((faq) => faq.q),
      useCases: buildUseCases(page),
      socialProof: buildSocialProof(page),
    },
    impact,
    effort,
    roiScore: calculateRoi(impact, effort),
  };
}

function buildNewPageRecommendation(query: QueryOpportunity): SeoAssistantNewPage {
  const impact = query.seoPotential >= 85 ? "Très fort" : query.seoPotential >= 70 ? "Fort" : query.seoPotential >= 45 ? "Moyen" : "Faible";
  const effort: SeoAssistantEffort = query.impressions > 150 ? "Moyen" : "Faible";

  return {
    query: query.query,
    sourceUrl: query.url,
    url: query.ai.generatedUrl,
    title: query.ai.title,
    metaDescription: query.ai.metaDescription,
    h1: query.ai.h1,
    h2Plan: query.ai.h2,
    faq: query.ai.faq,
    internalLinks: query.ai.internalLinks,
    impact,
    effort,
    roiScore: calculateRoi(impact, effort),
  };
}

function buildInternalLinkingReport(report: AdminSeoAuditReport): SeoAssistantReport["internalLinking"] {
  const commercialPages = report.pages
    .filter((page) => page.priority === "Critique" || page.priority === "Haute")
    .map((page) => page.path);
  const orphanPages = report.pages.filter((page) => page.internalLinks <= 1).map((page) => page.path);

  return {
    missingInboundLinks: commercialPages.slice(0, 8).map((page) => ({
      page,
      suggestions: [
        "Ajouter un lien depuis la page d'accueil si absent.",
        "Ajouter un lien depuis /services avec une ancre descriptive.",
        "Ajouter un lien depuis un article de blog stratégique.",
      ],
    })),
    missingOutboundLinks: report.pages
      .filter((page) => page.internalLinks < 5)
      .slice(0, 8)
      .map((page) => ({
        page: page.path,
        suggestions: [
          "/audit-ia",
          "/consultant-ia-pme",
          "/automatisation-pme",
          "/crm-ia-pme",
          "/assistant-ia-telephone",
        ],
      })),
    orphanPages,
    clusters: [
      {
        name: "Automatisation IA PME",
        pages: report.pages.filter((page) => /automatisation|audit|consultant/i.test(page.path)).map((page) => page.path).slice(0, 8),
        recommendedHub: "/automatisation-pme",
      },
      {
        name: "CRM et suivi commercial IA",
        pages: report.pages.filter((page) => /crm|commercial|devis|relance/i.test(page.path)).map((page) => page.path).slice(0, 8),
        recommendedHub: "/crm-ia-pme",
      },
      {
        name: "Assistant téléphonique IA",
        pages: report.pages.filter((page) => /assistant|telephone|appel/i.test(page.path)).map((page) => page.path).slice(0, 8),
        recommendedHub: "/assistant-ia-telephone",
      },
      {
        name: "Applications métier",
        pages: report.pages.filter((page) => /application|metier|logiciel/i.test(page.path)).map((page) => page.path).slice(0, 8),
        recommendedHub: "/applications-metier",
      },
    ],
  };
}

function buildWorkPlan(
  pages: SeoAssistantPageAnalysis[],
  newPages: SeoAssistantNewPage[],
  orphanPages: string[],
): SeoAssistantReport["workPlan"] {
  return {
    today: [
      pages[0] ? `${pages[0].page}: ${pages[0].actionPlan[0]}` : "Réécrire le title/meta de la page prioritaire.",
      pages[1] ? `${pages[1].page}: ${pages[1].actionPlan[0]}` : "Ajouter 5 liens internes vers les pages commerciales.",
      orphanPages[0] ? `${orphanPages[0]}: ajouter 3 liens entrants depuis pages fortes.` : "Vérifier les pages sans maillage entrant.",
    ],
    thisWeek: [
      pages[0] ? `${pages[0].page}: ajouter FAQ SEO et section ROI.` : "Ajouter FAQ SEO sur les pages critiques.",
      newPages[0] ? `${newPages[0].url}: rédiger la nouvelle page dédiée "${newPages[0].query}".` : "Préparer une nouvelle page depuis Search Console.",
      "Créer des liens croisés entre audit IA, consultant IA PME, CRM IA PME et automatisation PME.",
    ],
    thisMonth: [
      newPages[1] ? `${newPages[1].url}: publier une page requête Search Console secondaire.` : "Publier une page pilier nationale supplémentaire.",
      "Structurer les clusters thématiques avec une page hub et des pages support.",
      "Repasser l'audit interne après publication pour mesurer le score et les écarts restants.",
    ],
  };
}

function groupQueriesByPath(queries: QueryOpportunity[]) {
  const grouped = new Map<string, QueryOpportunity[]>();
  for (const query of queries) {
    if (!query.url) continue;
    const pathname = pathnameFromUrl(query.url);
    grouped.set(pathname, [...(grouped.get(pathname) ?? []), query]);
  }

  for (const [pathname, items] of grouped) {
    grouped.set(pathname, items.sort((a, b) => b.seoPotential - a.seoPotential));
  }

  return grouped;
}

function summarizeQueryMetrics(queries: QueryOpportunity[]) {
  const clicks = queries.reduce((sum, query) => sum + query.clicks, 0);
  const impressions = queries.reduce((sum, query) => sum + query.impressions, 0);
  const weightedPosition = queries.reduce((sum, query) => sum + query.position * Math.max(1, query.impressions), 0);
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? weightedPosition / impressions : 0,
  };
}

function buildProblemSummary(page: AdminSeoPageAudit, summary: ReturnType<typeof summarizeQueryMetrics>) {
  const pageIsHealthy = page.globalScore >= 80;
  const problems = pageIsHealthy
    ? page.issues.filter((issue) => !/coherente|aucun probleme/i.test(normalizeText(issue))).slice(0, 2)
    : [...page.issues.slice(0, 3)];

  if (summary.impressions > 20 && summary.ctr < 0.03) problems.push("CTR inférieur au potentiel: title/meta à rendre plus cliquables.");
  if (summary.position >= 4 && summary.position <= 20) problems.push("Page proche d'un palier SEO: renforcer contenu, FAQ et maillage.");
  if (page.internalLinks < 5) problems.push("Maillage interne trop faible pour soutenir la page.");
  const uniqueProblems = Array.from(new Set(problems)).slice(0, 5);
  if (uniqueProblems.length) return uniqueProblems;
  return ["Aucun problème bloquant détecté sur le dernier audit live."];
}

function buildPageOpportunities(page: AdminSeoPageAudit, queries: QueryOpportunity[]) {
  if (!queries.length && page.globalScore >= 80) {
    return [
      "Surveiller les prochaines impressions Search Console après indexation.",
      "Conserver le maillage vers les pages business prioritaires.",
      page.path === "/contact"
        ? "Suivre les conversions formulaire et clics CTA pour valider la performance business."
        : "Actualiser la FAQ dès que de nouvelles requêtes Google apparaissent.",
    ];
  }

  const opportunities = [
    ...queries.slice(0, 3).map((query) => `${query.query}: ${query.opportunity}`),
    ...page.recommendations.slice(0, 3),
  ];
  return Array.from(new Set(opportunities)).slice(0, 6);
}

function buildPrioritizedActions(page: AdminSeoPageAudit, queries: QueryOpportunity[]) {
  const hasRewriteOpportunity = queries.some((query) => query.opportunityType === "rewrite_metadata");
  const actions = [
    hasRewriteOpportunity
      ? "Réécrire Title et Meta à partir de la requête Search Console principale."
      : page.globalScore >= 80
        ? "Ne pas réécrire la base SEO sans nouvelle donnée Search Console."
        : "Clarifier le Title, le H1 et l'intention principale.",
    page.hasFaq
      ? "Actualiser la FAQ avec les vraies requêtes Search Console dès qu'elles remontent."
      : "Ajouter une FAQ SEO de 3 à 5 questions.",
    page.internalLinks < 5
      ? "Ajouter au moins 5 liens internes entrants et sortants."
      : "Vérifier que les liens internes pointent vers les pages business prioritaires.",
    page.wordCount < 700
      ? "Ajouter 2 paragraphes de contenu et un cas d'usage concret."
      : page.path === "/contact"
        ? "Suivre les conversions du formulaire et les clics vers l'audit IA."
        : "Ajouter une preuve sociale ou un résultat attendu si la page manque de réassurance.",
  ];
  return actions;
}

function buildSectionsToAdd(page: AdminSeoPageAudit) {
  if (page.path === "/contact") {
    return [
      "Ajouter un rappel du déroulement: formulaire, qualification, diagnostic, plan d'action.",
      "Ajouter une section réassurance: confidentialité, accompagnement humain, intervention France entière.",
      "Ajouter une section orientation vers audit IA, CRM IA, assistant téléphonique IA et applications métier.",
    ];
  }

  if (page.path === "/realisations") {
    return [
      "Ajouter pour chaque cas une structure contexte, solution, résultats, métriques.",
      "Ajouter une section ROI avec gains de temps et indicateurs mesurables.",
      "Ajouter des liens vers les pages services correspondant à chaque réalisation.",
    ];
  }

  return [
    "Ajouter une section problème métier avant la solution.",
    "Ajouter une section ROI avec gains de temps et indicateurs mesurables.",
    "Ajouter une section méthode CorsaiManager: audit, prototype, déploiement.",
  ];
}

function buildUseCases(page: AdminSeoPageAudit) {
  if (page.path === "/contact") {
    return [
      "Demande d'audit IA pour cadrer un premier projet.",
      "Qualification d'un besoin CRM IA ou assistant téléphonique IA.",
      "Orientation vers la bonne page service selon le contexte PME.",
    ];
  }

  return [
    "Automatisation des relances commerciales.",
    "Qualification de demandes entrantes avec IA.",
    "Centralisation CRM et suivi des opportunités.",
  ];
}

function buildSocialProof(page: AdminSeoPageAudit) {
  if (page.path === "/contact") {
    return [
      "Ajouter une phrase de réassurance sur la méthode et la confidentialité.",
      "Ajouter un rappel: basé en Corse, accompagnement des PME partout en France.",
    ];
  }

  return [
    "Ajouter un exemple de résultat client ou scénario chiffré.",
    "Ajouter une preuve de méthode: avant / après / gain attendu.",
  ];
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function estimateImpact(page: AdminSeoPageAudit, impressions: number, position: number): SeoAssistantImpact {
  if (impressions > 250 || page.priority === "Critique" || (position >= 4 && position <= 10)) return "Très fort";
  if (impressions > 80 || page.priority === "Haute" || (position > 10 && position <= 20)) return "Fort";
  if (page.globalScore < 80) return "Moyen";
  return "Faible";
}

function estimateEffort(page: AdminSeoPageAudit): SeoAssistantEffort {
  if (page.scoreGap <= 10) return "Faible";
  if (page.scoreGap <= 30) return "Moyen";
  return "Élevé";
}

function calculateRoi(impact: SeoAssistantImpact, effort: SeoAssistantEffort) {
  const impactValue: Record<SeoAssistantImpact, number> = {
    "Très fort": 4,
    Fort: 3,
    Moyen: 2,
    Faible: 1,
  };
  const effortValue: Record<SeoAssistantEffort, number> = {
    Faible: 1,
    Moyen: 2,
    Élevé: 3,
  };
  return Math.round((impactValue[impact] / effortValue[effort]) * 25);
}

async function saveSeoAssistantHistory(report: SeoAssistantReport) {
  if (!process.env.DATABASE_URL || !report.history.length) return;

  try {
    const sql = getNeonClient();
    await sql`
      CREATE TABLE IF NOT EXISTS seo_ai_recommendations (
        id BIGSERIAL PRIMARY KEY,
        account_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        site_id TEXT NOT NULL,
        page_url TEXT NOT NULL,
        recommendation_type TEXT NOT NULL,
        payload JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'generated',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    for (const item of report.history) {
      await sql`
        INSERT INTO seo_ai_recommendations (
          account_id,
          project_id,
          site_id,
          page_url,
          recommendation_type,
          payload,
          status,
          updated_at
        )
        VALUES (
          ${report.accountId},
          ${report.projectId},
          ${report.siteId},
          ${item.page},
          ${"seo_assistant"},
          ${JSON.stringify(item)}::jsonb,
          ${item.status},
          NOW()
        )
      `;
    }
  } catch (error) {
    console.warn("[seo-assistant] History persistence skipped", {
      error: error instanceof Error ? error.message : error,
    });
  }
}

function pathnameFromUrl(value: string) {
  try {
    return new URL(value).pathname.replace(/\/$/, "") || "/";
  } catch {
    return value.replace(/^https?:\/\/[^/]+/i, "").replace(/\/$/, "") || "/";
  }
}
