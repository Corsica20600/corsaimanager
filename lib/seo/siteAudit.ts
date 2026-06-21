import fs from "node:fs";
import path from "node:path";
import { getPublishedPosts } from "@/lib/blog";
import { seoPages } from "@/lib/seo-pages";
import type { SeoScoreBreakdown } from "@/lib/seo/analyzeSeo";

export type AdminSeoPageAudit = {
  path: string;
  title: string;
  description: string;
  h1: string;
  wordCount: number;
  detectedTitle?: string;
  detectedMetaDescription?: string;
  detectedH1?: string[];
  h2Count?: number;
  h3Count?: number;
  faqCount?: number;
  internalLinksCount?: number;
  ctaCount?: number;
  schemaCount?: number;
  scoreBreakdown?: SeoScoreBreakdown;
  hasFaq: boolean;
  imageCount: number;
  imagesWithAlt: number;
  localHits: number;
  nationalHits: number;
  internalLinks: number;
  priority: "Critique" | "Haute" | "Moyenne" | "Faible";
  scores: {
    metadata: number;
    structure: number;
    content: number;
    internalLinks: number;
    conversion: number;
    imagesAlt: number;
    nationalPositioning: number;
    readability: number;
  };
  globalScore: number;
  scoreGap: number;
  checklist: ScoreChecklistItem[];
  objectiveActions: ObjectiveAction[];
  issues: string[];
  recommendations: string[];
  improvedSeo: {
    title: string;
    description: string;
    h1: string;
    h2: string[];
    h3: string[];
    faq: Array<{ q: string; a: string }>;
    paragraphs: string[];
    internalLinks: Array<{ href: string; label: string }>;
    cta: string;
  };
  intentType: "local" | "national";
};

export type ScoreChecklistItem = {
  key: string;
  label: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  recommendation: string;
};

export type ObjectiveAction = {
  action: string;
  points: number;
};

export type AdminSeoAuditReport = {
  pages: AdminSeoPageAudit[];
  summary: {
    analyzedPages: number;
    tooLocalPages: number;
    pagesToOptimize: number;
    priorityPages: number;
    averageScore: number;
    buckets: {
      perfect: number;
      strong: number;
      medium: number;
      weak: number;
    };
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
const importantPaths = new Map<string, AdminSeoPageAudit["priority"]>([
  ["/", "Critique"],
  ["/audit-ia", "Critique"],
  ["/automatisation-entreprise", "Critique"],
  ["/automatisation-pme", "Critique"],
  ["/crm-ia-pme", "Critique"],
  ["/assistant-ia-telephone", "Critique"],
  ["/applications-metier", "Critique"],
  ["/consultant-ia-pme", "Haute"],
  ["/services", "Haute"],
  ["/blog/comment-utiliser-chatgpt-dans-une-pme-corse-en-2026", "Haute"],
  ["/blog/automatiser-ses-devis-avec-l-intelligence-artificielle", "Haute"],
  ["/blog/exemple-application-metier-grossiste-alimentaire-ia", "Haute"],
]);

const staticPages = [
  {
    path: "/",
    title: "Automatisation IA pour PME en France | CorsaiManager",
    description:
      "CRM intelligent, assistant téléphonique IA, automatisation commerciale et applications métier sur mesure pour PME françaises.",
    h1: "Automatisation IA, CRM intelligent et applications métier pour PME",
    file: "components/sections/home-seo-page.tsx",
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
    h1: "Audit IA pour PME : identifier les automatisations rentables",
    file: "lib/business-pages.ts",
  },
  {
    path: "/assistant-ia-telephone",
    title: "Assistant IA Téléphonique | CorsaiManager",
    description: "Assistant téléphonique IA pour PME : réponse automatique, qualification des appels et synchronisation CRM.",
    h1: "Assistant téléphonique IA pour PME : répondre, qualifier et suivre les appels",
    file: "lib/business-pages.ts",
  },
  {
    path: "/crm-ia-pme",
    title: "CRM IA pour PME | CorsaiManager",
    description: "CRM intelligent pour PME avec relances automatiques, pipeline commercial, scoring IA et suivi client.",
    h1: "CRM IA pour PME : mieux suivre prospects, clients et relances",
    file: "lib/business-pages.ts",
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
        intentType: "national",
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
    tooLocalPages: pages.filter((page) => page.intentType === "national" && page.localHits > Math.max(2, page.nationalHits)).length,
    pagesToOptimize: pages.filter((page) => page.globalScore < 100).length,
    priorityPages: pages.filter((page) => page.priority === "Critique" || page.priority === "Haute").length,
    averageScore: Math.round(pages.reduce((sum, page) => sum + page.globalScore, 0) / Math.max(1, pages.length)),
    buckets: {
      perfect: pages.filter((page) => page.globalScore === 100).length,
      strong: pages.filter((page) => page.globalScore >= 80 && page.globalScore < 100).length,
      medium: pages.filter((page) => page.globalScore >= 60 && page.globalScore < 80).length,
      weak: pages.filter((page) => page.globalScore < 60).length,
    },
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

function auditPage(input: { path: string; title: string; description: string; h1: string; source: string; intentType?: "local" | "national" }): AdminSeoPageAudit {
  const intentType = getIntentType(input.path, input.intentType);
  const normalized = normalize(input.source);
  const localHits = countHits(normalized, localTerms);
  const nationalHits = countHits(normalized, nationalTerms);
  const internalLinks = (input.source.match(/\]\(\/|href="\/|href: "\//g) ?? []).length;
  const wordCount = (input.source.match(/[\p{L}\p{N}']+/gu) ?? []).length;
  const hasFaq = /faq|questions fréquentes|questions frequentes/i.test(input.source);
  const imageCount = (input.source.match(/<Image\b|<img\b|!\[[^\]]*\]\(/g) ?? []).length;
  const imagesWithAlt = (input.source.match(/alt=\{?["'][^"']+["']\}?|!\[[^\]]+\]\(/g) ?? []).length;
  const h2Count = (input.source.match(/<h2\b|^##\s+/gm) ?? []).length;
  const ctaHits = countHits(normalized, conversionTerms);
  const priority = getPagePriority(input.path);
  const checklist = buildChecklist({
    ...input,
    normalized,
    wordCount,
    hasFaq,
    h2Count,
    internalLinks,
    imageCount,
    imagesWithAlt,
    nationalHits,
    localHits,
    intentType,
    ctaHits,
  });

  const scores = scoreFromChecklist(checklist);
  const globalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const issues = buildIssues({ ...input, intentType, localHits, nationalHits, wordCount, internalLinks, scores });
  const objectiveActions = checklist
    .filter((item) => item.points < item.maxPoints)
    .map((item) => ({ action: item.recommendation, points: item.maxPoints - item.points }));

  return {
    ...input,
    wordCount,
    hasFaq,
    imageCount,
    imagesWithAlt,
    localHits,
    nationalHits,
    internalLinks,
    priority,
    scores,
    globalScore,
    scoreGap: 100 - globalScore,
    checklist,
    objectiveActions,
    issues,
    recommendations: buildRecommendations(issues),
    improvedSeo: buildImprovedSeo(input),
    intentType,
  };
}

function buildIssues(page: {
  title: string;
  description: string;
  localHits: number;
  nationalHits: number;
  intentType: "local" | "national";
  wordCount: number;
  internalLinks: number;
  scores: AdminSeoPageAudit["scores"];
}) {
  const issues: string[] = [];
  if (page.scores.metadata < 15) issues.push("Metadata à renforcer pour viser une requête nationale claire.");
  if (page.intentType === "national" && page.localHits > Math.max(2, page.nationalHits)) {
    issues.push("Page nationale encore trop orientée Corse par rapport au positionnement France entière.");
  }
  if (page.intentType === "local" && page.localHits === 0) {
    issues.push("Page locale à renforcer avec un ancrage Corse ou Bastia naturel.");
  }
  if (page.wordCount < 450) issues.push("Contenu trop court pour porter une intention SEO compétitive.");
  if (page.internalLinks < 3) issues.push("Maillage interne insuffisant vers les pages services et audit IA.");
  if (page.scores.conversion < 10) issues.push("CTA ou intention de conversion à rendre plus explicite.");
  if (page.intentType === "national" && page.scores.nationalPositioning < 10) issues.push("Positionnement France entière à clarifier avec les mots-clés nationaux prioritaires.");
  return issues.length ? issues : ["Page cohérente avec le positionnement national actuel."];
}

function buildRecommendations(issues: string[]) {
  return issues.map((issue) => {
    if (issue.includes("trop orientée Corse")) return "Reformuler autour des PME françaises et garder une seule mention naturelle: basé en Corse, intervention partout en France.";
    if (issue.includes("Page locale")) return "Conserver l’intention locale et ajouter un lien visible vers la page nationale équivalente.";
    if (issue.includes("Metadata")) return "Réécrire title et description avec un mot-clé national principal et un bénéfice business.";
    if (issue.includes("court")) return "Ajouter une section cas d'usage, méthode, bénéfices mesurables et FAQ orientée PME françaises.";
    if (issue.includes("Maillage")) return "Ajouter des liens vers /consultant-ia-pme, /automatisation-pme, /crm-ia-pme, /assistant-ia-telephone et /audit-ia.";
    if (issue.includes("CTA")) return "Ajouter un CTA visible vers un diagnostic IA ou une demande d'audit.";
    return "Rendre la promesse plus directe: problème métier, solution IA, résultat mesurable, prochaine action.";
  });
}

function getIntentType(pathname: string, explicit?: string): "local" | "national" {
  if (explicit === "local" || explicit === "national") return explicit;
  return /corse|bastia|ajaccio|haute-corse/i.test(pathname) ? "local" : "national";
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
    h3: [
      "Exemples de tâches à automatiser",
      "Indicateurs à suivre",
      "Questions à poser avant de lancer le projet",
    ],
    faq: [
      {
        q: `${topic} convient-il aux petites PME ?`,
        a: "Oui, si le premier périmètre cible des tâches répétitives, un gain mesurable et une validation humaine claire.",
      },
      {
        q: "Combien de temps faut-il pour voir un résultat ?",
        a: "Un premier diagnostic permet souvent d'identifier des corrections rapides et un workflow pilote à tester rapidement.",
      },
      {
        q: "L'accompagnement peut-il se faire à distance ?",
        a: "Oui. Basé en Corse, CorsaiManager accompagne les PME partout en France avec des ateliers et suivis à distance.",
      },
    ],
    paragraphs: [
      `Ajouter un paragraphe qui relie ${topic.toLowerCase()} aux enjeux des PME françaises: temps gagné, fiabilité du suivi et ROI.`,
      "Ajouter un exemple métier concret avec situation initiale, automatisation proposée et résultat attendu.",
      "Ajouter une preuve de méthode: audit, priorisation, prototype, déploiement et mesure des gains.",
    ],
    internalLinks: [
      { href: "/consultant-ia-pme", label: "Consultant IA PME" },
      { href: "/automatisation-pme", label: "Automatisation IA PME" },
      { href: "/crm-ia-pme", label: "CRM IA PME" },
      { href: "/assistant-ia-telephone", label: "Assistant téléphonique IA" },
      { href: "/audit-ia", label: "Audit IA entreprise" },
    ],
    cta: "Demander un diagnostic IA pour identifier les automatisations prioritaires.",
  };
}

function buildChecklist(page: {
  title: string;
  description: string;
  h1: string;
  normalized: string;
  wordCount: number;
  hasFaq: boolean;
  h2Count: number;
  internalLinks: number;
  imageCount: number;
  imagesWithAlt: number;
  nationalHits: number;
  localHits: number;
  intentType: "local" | "national";
  ctaHits: number;
}): ScoreChecklistItem[] {
  const titleOptimized = page.title.length >= 42 && page.title.length <= 65;
  const metaPresent = page.description.length >= 120 && page.description.length <= 165;
  const h1Unique = page.h1.length > 12 && page.h1.length < 90;
  const enoughH2 = page.h2Count >= 3;
  const contentLong = page.wordCount >= 700;
  const faqPresent = page.hasFaq;
  const ctaPresent = page.ctaHits >= 1;
  const enoughLinks = page.internalLinks >= 5;
  const imagesOk = page.imageCount === 0 || page.imagesWithAlt >= page.imageCount;
  const nationalClear = page.intentType === "local"
    ? page.localHits >= 1 && (page.nationalHits >= 1 || page.normalized.includes("france"))
    : page.nationalHits >= 3;
  const readabilityOk = hasReadableStructure(page.normalized, page.h2Count);

  return [
    item("title", "Title optimisé", titleOptimized, titleOptimized ? 5 : page.title ? 3 : 0, 5, "Optimiser le title entre 42 et 65 caractères avec le mot-clé national principal."),
    item("meta", "Meta description présente", metaPresent, metaPresent ? 10 : page.description ? 5 : 0, 10, "Ajouter ou réécrire une meta description de 120 à 165 caractères orientée PME françaises."),
    item("h1", "H1 unique", h1Unique, h1Unique ? 7 : 3, 7, "Définir un H1 unique, clair et aligné sur l'offre IA principale."),
    item("h2", "H2 suffisants", enoughH2, Math.min(8, page.h2Count * 2), 8, "Ajouter au moins 3 H2 couvrant problème, méthode, cas d'usage, ROI et CTA."),
    item("content", "Contenu suffisamment long", contentLong, page.wordCount >= 450 ? 12 : page.wordCount >= 250 ? 8 : 4, 15, "Renforcer le contenu avec exemples, méthode, bénéfices et preuves métier."),
    item("faq", "FAQ présente", faqPresent, faqPresent ? 5 : 0, 5, "Ajouter une FAQ SEO de 3 questions sur l'usage, le délai, le ROI ou l'accompagnement."),
    item("links", "Liens internes suffisants", enoughLinks, Math.min(15, page.internalLinks * 3), 15, "Ajouter au moins 5 liens internes vers les pages services, audit IA et pages piliers."),
    item("cta", "CTA présent", ctaPresent, page.ctaHits >= 2 ? 10 : ctaPresent ? 7 : 0, 10, "Ajouter un CTA clair vers diagnostic IA, audit IA ou contact."),
    item("images", "Images avec ALT", imagesOk, imagesOk ? 10 : Math.round((page.imagesWithAlt / Math.max(1, page.imageCount)) * 10), 10, "Ajouter des attributs alt descriptifs sur chaque image utile."),
    item(
      "national",
      page.intentType === "local" ? "Intention locale + ouverture France claire" : "Positionnement France entière clair",
      nationalClear,
      page.intentType === "local"
        ? Math.min(10, page.localHits * 4 + (page.normalized.includes("france") ? 3 : 0))
        : Math.min(10, page.nationalHits * 3),
      10,
      page.intentType === "local"
        ? "Conserver l’ancrage Corse/Bastia et ajouter une phrase claire indiquant l’accompagnement des PME partout en France."
        : "Renforcer les mots-clés: automatisation IA PME, consultant IA PME, audit IA entreprise, CRM IA PME.",
    ),
    item("readability", "Lisibilité", readabilityOk, readabilityOk ? 5 : 3, 5, "Aérer la page avec paragraphes courts, listes, H2/H3 et exemples scannables."),
  ];
}

function item(key: string, label: string, passed: boolean, points: number, maxPoints: number, recommendation: string): ScoreChecklistItem {
  return { key, label, passed, points: Math.min(points, maxPoints), maxPoints, recommendation };
}

function scoreFromChecklist(checklist: ScoreChecklistItem[]): AdminSeoPageAudit["scores"] {
  const score = (keys: string[]) =>
    checklist.filter((item) => keys.includes(item.key)).reduce((sum, item) => sum + item.points, 0);
  return {
    metadata: score(["title", "meta"]),
    structure: score(["h1", "h2"]),
    content: score(["content", "faq"]),
    internalLinks: score(["links"]),
    conversion: score(["cta"]),
    imagesAlt: score(["images"]),
    nationalPositioning: score(["national"]),
    readability: score(["readability"]),
  };
}

function getPagePriority(pathname: string): AdminSeoPageAudit["priority"] {
  if (importantPaths.has(pathname)) return importantPaths.get(pathname)!;
  if (pathname.startsWith("/blog/")) return "Moyenne";
  if (pathname.includes("crm") || pathname.includes("assistant") || pathname.includes("automatisation")) return "Haute";
  return "Faible";
}

function hasReadableStructure(text: string, h2Count: number) {
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  return h2Count >= 3 && sentences >= 8;
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
