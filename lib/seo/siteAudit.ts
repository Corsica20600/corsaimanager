import fs from "node:fs";
import path from "node:path";
import { getPublishedPosts } from "@/lib/blog";
import { seoPages } from "@/lib/seo-pages";

export type AdminSeoPageAudit = {
  path: string;
  title: string;
  description: string;
  h1: string;
  wordCount: number;
  localHits: number;
  nationalHits: number;
  internalLinks: number;
  scores: {
    metadata: number;
    structure: number;
    content: number;
    internalLinks: number;
    nationalPositioning: number;
    conversion: number;
    offerClarity: number;
  };
  globalScore: number;
  issues: string[];
  recommendations: string[];
  improvedSeo: {
    title: string;
    description: string;
    h1: string;
    h2: string[];
  };
};

export type AdminSeoAuditReport = {
  pages: AdminSeoPageAudit[];
  summary: {
    analyzedPages: number;
    tooLocalPages: number;
    pagesToOptimize: number;
    priorityPages: number;
    averageScore: number;
  };
  opportunities: string[];
  targetKeywords: string[];
};

const localTerms = ["corse", "bastia", "ajaccio", "haute-corse", "entreprise corse", "pme corse", "pme corses"];
const nationalTerms = [
  "france",
  "pme française",
  "pme françaises",
  "pme en france",
  "tpe pme",
  "automatisation ia",
  "consultant ia",
  "crm ia",
  "assistant téléphonique ia",
  "application métier sur mesure",
  "transformation digitale",
];
const conversionTerms = ["audit", "diagnostic", "contact", "rendez-vous", "devis", "réserver"];

const staticPages = [
  {
    path: "/",
    title: "Automatisation IA pour PME en France | CorsaiManager",
    description:
      "CRM intelligent, assistant téléphonique IA, automatisation commerciale et applications métier sur mesure pour PME françaises.",
    h1: "Automatisez votre entreprise avec l'intelligence artificielle",
    file: "components/sections/home-page.tsx",
  },
  {
    path: "/services",
    title: "Solutions IA et automatisation pour PME",
    description:
      "Solutions IA et automatisation pour PME: assistants IA, CRM intelligents, applications métier et accompagnement stratégique.",
    h1: "Solutions IA et automatisation pour PME",
    file: "app/services/page.tsx",
  },
  {
    path: "/audit-ia",
    title: "Audit IA entreprise",
    description: "Audit IA pour analyser vos tâches répétitives, vos outils et vos opportunités d'automatisation.",
    h1: "Audit IA gratuit pour votre entreprise",
    file: "app/audit-ia/page.tsx",
  },
  {
    path: "/assistant-ia-telephone",
    title: "Assistant IA Téléphonique | CorsaiManager",
    description: "Assistant téléphonique IA pour PME : réponse automatique, qualification des appels et synchronisation CRM.",
    h1: "Assistant IA téléphonique",
    file: "components/sections/assistant-ia-telephone-page.tsx",
  },
  {
    path: "/crm-ia-pme",
    title: "CRM IA pour PME | CorsaiManager",
    description: "CRM intelligent pour PME avec relances automatiques, pipeline commercial, scoring IA et suivi client.",
    h1: "CRM IA pour PME",
    file: "components/sections/crm-ia-pme-page.tsx",
  },
  {
    path: "/automatisation-entreprise",
    title: "Automatisation IA pour entreprise | CorsaiManager",
    description: "Automatisez les tâches répétitives de votre PME avec l'IA : emails, relances, devis et reporting.",
    h1: "Automatisation IA pour entreprise",
    file: "components/sections/automatisation-entreprise-page.tsx",
  },
  {
    path: "/applications-metier",
    title: "Applications métier sur mesure | CorsaiManager",
    description: "Développement d'applications métier modernes pour PME : CRM, automatisation, dashboards et outils sur mesure.",
    h1: "Applications métier sur mesure",
    file: "components/sections/applications-metier-page.tsx",
  },
];

export function buildAdminSeoAudit(): AdminSeoAuditReport {
  const pages = [
    ...staticPages.map((page) =>
      auditPage({
        ...page,
        source: readProjectFile(page.file),
      }),
    ),
    ...seoPages.map((page) =>
      auditPage({
        path: `/${page.slug}`,
        title: page.title,
        description: page.description,
        h1: page.h1,
        source: [
          page.subtitle,
          page.problemText,
          page.solutionText,
          page.useCases.join(" "),
          page.benefits.join(" "),
          page.methodSteps.join(" "),
          page.why.join(" "),
          page.faqs.map((faq) => `${faq.q} ${faq.a}`).join(" "),
        ].join(" "),
      }),
    ),
    ...getPublishedPosts().map((post) =>
      auditPage({
        path: `/blog/${post.slug}`,
        title: post.title,
        description: post.description,
        h1: post.title,
        source: post.content,
      }),
    ),
  ].sort((a, b) => a.globalScore - b.globalScore);

  const summary = {
    analyzedPages: pages.length,
    tooLocalPages: pages.filter((page) => page.localHits > Math.max(2, page.nationalHits)).length,
    pagesToOptimize: pages.filter((page) => page.globalScore < 75).length,
    priorityPages: pages.filter((page) => page.globalScore < 65 || page.localHits > page.nationalHits + 2).length,
    averageScore: Math.round(pages.reduce((sum, page) => sum + page.globalScore, 0) / Math.max(1, pages.length)),
  };

  return {
    pages,
    summary,
    opportunities: [
      "Créer une page pilier 'Agence IA France' pour capter l'intention prestataire national.",
      "Créer une page 'Automatiser les tâches administratives avec l'IA' orientée TPE/PME.",
      "Créer une page 'Transformation digitale PME' reliée aux audits IA et applications métier.",
      "Renforcer les comparatifs métier: CRM IA, assistant téléphonique IA et automatisation commerciale.",
      "Ajouter des cas d'usage sectoriels France entière: services B2B, formation, bâtiment, commerce, CHR.",
    ],
    targetKeywords: [
      "automatisation IA PME",
      "consultant IA PME",
      "agence IA France",
      "audit IA entreprise",
      "CRM IA PME",
      "assistant téléphonique IA",
      "application métier sur mesure",
      "automatisation commerciale",
      "intelligence artificielle entreprise",
      "automatiser les tâches administratives",
      "IA pour TPE PME",
      "transformation digitale PME",
    ],
  };
}

function auditPage(input: { path: string; title: string; description: string; h1: string; source: string }): AdminSeoPageAudit {
  const normalized = normalize(input.source);
  const localHits = countHits(normalized, localTerms);
  const nationalHits = countHits(normalized, nationalTerms);
  const internalLinks = (input.source.match(/\]\(\/|href="\/|href: "\//g) ?? []).length;
  const wordCount = (input.source.match(/[\p{L}\p{N}']+/gu) ?? []).length;

  const scores = {
    metadata: scoreMetadata(input.title, input.description),
    structure: input.h1.length > 12 && input.h1.length < 90 ? 85 : 55,
    content: wordCount >= 700 ? 92 : wordCount >= 450 ? 78 : wordCount >= 250 ? 62 : 38,
    internalLinks: Math.min(100, internalLinks * 18),
    nationalPositioning: Math.min(100, nationalHits * 16 + (localHits <= 2 ? 20 : 0)),
    conversion: Math.min(100, countHits(normalized, conversionTerms) * 22),
    offerClarity: scoreOfferClarity(normalized),
  };
  const globalScore = Math.round(
    scores.metadata * 0.18 +
      scores.structure * 0.12 +
      scores.content * 0.14 +
      scores.internalLinks * 0.12 +
      scores.nationalPositioning * 0.2 +
      scores.conversion * 0.12 +
      scores.offerClarity * 0.12,
  );
  const issues = buildIssues({ ...input, localHits, nationalHits, wordCount, internalLinks, scores });

  return {
    ...input,
    wordCount,
    localHits,
    nationalHits,
    internalLinks,
    scores,
    globalScore,
    issues,
    recommendations: buildRecommendations(issues),
    improvedSeo: buildImprovedSeo(input),
  };
}

function buildIssues(page: {
  title: string;
  description: string;
  localHits: number;
  nationalHits: number;
  wordCount: number;
  internalLinks: number;
  scores: AdminSeoPageAudit["scores"];
}) {
  const issues: string[] = [];
  if (page.scores.metadata < 75) issues.push("Metadata à renforcer pour viser une requête nationale claire.");
  if (page.localHits > Math.max(2, page.nationalHits)) issues.push("Page encore trop orientée Corse par rapport au positionnement France entière.");
  if (page.wordCount < 450) issues.push("Contenu trop court pour porter une intention SEO compétitive.");
  if (page.internalLinks < 3) issues.push("Maillage interne insuffisant vers les pages services et audit IA.");
  if (page.scores.conversion < 60) issues.push("CTA ou intention de conversion à rendre plus explicite.");
  if (page.scores.offerClarity < 70) issues.push("Offre IA à clarifier avec des mots-clés comme CRM IA, automatisation, assistant téléphonique ou application métier.");
  return issues.length ? issues : ["Page cohérente avec le positionnement national actuel."];
}

function buildRecommendations(issues: string[]) {
  return issues.map((issue) => {
    if (issue.includes("Corse")) return "Reformuler autour des PME françaises et garder une seule mention naturelle: basé en Corse, intervention partout en France.";
    if (issue.includes("Metadata")) return "Réécrire title et description avec un mot-clé national principal et un bénéfice business.";
    if (issue.includes("court")) return "Ajouter une section cas d'usage, méthode, bénéfices mesurables et FAQ orientée PME françaises.";
    if (issue.includes("Maillage")) return "Ajouter des liens vers /consultant-ia-pme, /automatisation-pme, /crm-ia-pme, /assistant-ia-telephone et /audit-ia.";
    if (issue.includes("CTA")) return "Ajouter un CTA visible vers un diagnostic IA ou une demande d'audit.";
    return "Rendre la promesse plus directe: problème métier, solution IA, résultat mesurable, prochaine action.";
  });
}

function buildImprovedSeo(page: { path: string; title: string; description: string; h1: string }) {
  const topic = inferTopic(page);
  return {
    title: `${topic} pour PME en France | CorsaiManager`,
    description: `CorsaiManager aide les PME françaises avec ${topic.toLowerCase()}, automatisation IA, accompagnement humain et solutions métier orientées ROI.`,
    h1: `${topic} pour PME françaises`,
    h2: [
      `Pourquoi ${topic.toLowerCase()} devient stratégique pour les PME`,
      "Cas d'usage concrets pour gagner du temps",
      "Méthode CorsaiManager: audit, roadmap et déploiement",
      "Résultats attendus: suivi, productivité et ROI",
      "Demander un diagnostic IA",
    ],
  };
}

function inferTopic(page: { path: string; title: string; h1: string }) {
  const text = normalize(`${page.path} ${page.title} ${page.h1}`);
  if (text.includes("crm")) return "CRM IA";
  if (text.includes("assistant") || text.includes("telephone") || text.includes("vocal")) return "Assistant téléphonique IA";
  if (text.includes("application") || text.includes("logiciel")) return "Application métier sur mesure";
  if (text.includes("audit")) return "Audit IA entreprise";
  if (text.includes("commercial")) return "Automatisation commerciale";
  return "Automatisation IA";
}

function scoreMetadata(title: string, description: string) {
  const titleScore = title.length >= 42 && title.length <= 65 ? 50 : title.length > 0 ? 32 : 0;
  const descriptionScore = description.length >= 120 && description.length <= 165 ? 50 : description.length > 0 ? 32 : 0;
  return titleScore + descriptionScore;
}

function scoreOfferClarity(text: string) {
  const offers = ["crm", "assistant", "automatisation", "application", "audit", "ia"];
  return Math.min(100, countHits(text, offers) * 18);
}

function countHits(text: string, terms: string[]) {
  return terms.reduce((sum, term) => sum + (text.includes(normalize(term)) ? 1 : 0), 0);
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function readProjectFile(relativePath: string) {
  const fullPath = path.join(/* turbopackIgnore: true */ process.cwd(), relativePath);
  if (!fs.existsSync(fullPath)) return "";
  return fs.readFileSync(fullPath, "utf8");
}
