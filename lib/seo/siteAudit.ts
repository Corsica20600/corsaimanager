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
  ["/agence-ia-france", "Critique"],
  ["/audit-ia", "Critique"],
  ["/transformation-digitale-pme", "Haute"],
  ["/automatisation-entreprise", "Critique"],
  ["/automatisation-pme", "Critique"],
  ["/crm-ia-pme", "Critique"],
  ["/assistant-ia-telephone", "Critique"],
  ["/applications-metier", "Critique"],
  ["/consultant-ia-pme", "Haute"],
  ["/services", "Haute"],
  ["/contact", "Haute"],
  ["/realisations", "Haute"],
  ["/blog/comment-utiliser-chatgpt-dans-une-pme-corse-en-2026", "Haute"],
  ["/blog/automatiser-ses-devis-avec-l-intelligence-artificielle", "Haute"],
  ["/blog/exemple-application-metier-grossiste-alimentaire-ia", "Haute"],
]);

const staticPages = [
  {
    path: "/",
    title: "Automatisation IA pour PME en France",
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
    path: "/agence-ia-france",
    title: "Agence IA France pour PME",
    description:
      "Agence IA France pour PME : audit IA, CRM IA, assistant téléphonique IA, applications métier et automatisation.",
    h1: "Agence IA France : audit, automatisation et solutions IA pour PME",
    file: "app/agence-ia-france/page.tsx",
  },
  {
    path: "/transformation-digitale-pme",
    title: "Transformation digitale PME",
    description:
      "Transformation digitale PME : audit IA, automatisation, CRM IA, applications métier et feuille de route digitale.",
    h1: "Transformation digitale PME : structurer vos outils, vos données et vos automatisations",
    file: "app/transformation-digitale-pme/page.tsx",
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
    title: "Assistant IA Téléphonique",
    description: "Assistant téléphonique IA pour PME : réponse automatique, qualification des appels et synchronisation CRM.",
    h1: "Assistant téléphonique IA pour PME : répondre, qualifier et suivre les appels",
    file: "lib/business-pages.ts",
  },
  {
    path: "/crm-ia-pme",
    title: "CRM IA pour PME",
    description: "CRM intelligent pour PME avec relances automatiques, pipeline commercial, scoring IA et suivi client.",
    h1: "CRM IA pour PME : mieux suivre prospects, clients et relances",
    file: "lib/business-pages.ts",
  },
  {
    path: "/automatisation-entreprise",
    title: "Automatisation IA pour entreprise",
    description: "Automatisez les tâches répétitives de votre PME avec l'IA : emails, relances, devis et reporting.",
    h1: "Automatisation IA pour entreprise",
    file: "components/sections/automatisation-entreprise-page.tsx",
  },
  {
    path: "/applications-metier",
    title: "Applications métier sur mesure",
    description: "Développement d'applications métier modernes pour PME : CRM, automatisation, dashboards et outils sur mesure.",
    h1: "Applications métier sur mesure",
    file: "components/sections/applications-metier-page.tsx",
  },
  {
    path: "/contact",
    title: "Contact agence IA pour PME",
    description:
      "Contactez CorsaiManager pour un audit IA gratuit, un projet CRM IA, assistant téléphonique IA ou automatisation.",
    h1: "Contactez CorsaiManager pour votre projet IA",
    file: "app/contact/page.tsx",
  },
  {
    path: "/realisations",
    title: "Réalisations IA pour PME",
    description:
      "Réalisations IA pour PME : études de cas CRM IA, assistant téléphonique IA, applications métier et automatisation.",
    h1: "Réalisations IA pour PME : CRM, assistants, applications et automatisation",
    file: "app/realisations/page.tsx",
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
  const profile = getImprovedSeoProfile(page.path);
  if (profile) return profile;

  const topic = inferTopic(page);
  const title = cleanSeoTitle(`${topic} pour PME en France`);
  return {
    title,
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

function getImprovedSeoProfile(pathname: string): AdminSeoPageAudit["improvedSeo"] | null {
  const profiles: Record<string, AdminSeoPageAudit["improvedSeo"]> = {
    "/contact": createImprovedSeoProfile({
      title: "Contact agence IA pour PME",
      description:
        "Contactez CorsaiManager pour cadrer un audit IA, un CRM IA, un assistant téléphonique IA ou une automatisation pour PME.",
      h1: "Contactez CorsaiManager pour votre projet IA",
      h2: [
        "Pourquoi contacter CorsaiManager ?",
        "Audit IA gratuit",
        "Déroulement d'un accompagnement",
        "Solutions IA pour PME françaises",
        "Questions fréquentes",
      ],
      h3: ["Préparer le premier échange", "Choisir le bon point de départ", "Passer de l'idée au prototype"],
      faq: [
        {
          q: "Quel projet IA peut-on cadrer avec CorsaiManager ?",
          a: "Audit IA, CRM IA, assistant téléphonique IA, automatisation commerciale ou application métier sur mesure.",
        },
        {
          q: "CorsaiManager accompagne-t-il les PME partout en France ?",
          a: "Oui. Basé en Corse, CorsaiManager accompagne les PME partout en France à distance ou sur site selon le projet.",
        },
        {
          q: "Que préparer avant le premier rendez-vous ?",
          a: "Vos objectifs, vos outils actuels, vos tâches répétitives, vos irritants métier et les résultats attendus.",
        },
      ],
      paragraphs: [
        "Ajouter un paragraphe qui explique les raisons de contacter CorsaiManager: cadrage, priorisation, faisabilité et ROI.",
        "Ajouter un mini-parcours de prise de contact: formulaire, échange de qualification, diagnostic, feuille de route.",
        "Ajouter une preuve de réassurance: confidentialité, accompagnement humain et mise en place progressive.",
      ],
      internalLinks: [
        { href: "/audit-ia", label: "Audit IA entreprise" },
        { href: "/crm-ia-pme", label: "CRM IA PME" },
        { href: "/assistant-ia-telephone", label: "Assistant téléphonique IA" },
        { href: "/applications-metier", label: "Applications métier" },
        { href: "/automatisation-entreprise", label: "Automatisation entreprise" },
      ],
      cta: "Demander un diagnostic IA.",
    }),
    "/realisations": createImprovedSeoProfile({
      title: "Réalisations IA pour PME",
      description:
        "Découvrez des cas d'usage IA pour PME: CRM IA, assistant téléphonique IA, applications métier, automatisation et ROI.",
      h1: "Réalisations IA pour PME : cas d'usage, gains et ROI",
      h2: [
        "Études de cas IA pour PME",
        "CRM IA et suivi commercial",
        "Assistant téléphonique IA",
        "Applications métier sur mesure",
        "Automatisation des processus",
        "Résultats obtenus et ROI",
      ],
      h3: ["Contexte client", "Solution déployée", "Gains mesurables"],
      faq: [
        {
          q: "Quels types de réalisations IA sont présentés ?",
          a: "Des cas autour du CRM IA, de l'assistant téléphonique IA, des applications métier et de l'automatisation.",
        },
        {
          q: "Comment mesurer les résultats d'un projet IA ?",
          a: "Avec le temps gagné, les erreurs évitées, les conversions, la qualité du suivi et les indicateurs métier.",
        },
        {
          q: "Une PME peut-elle commencer par un petit projet ?",
          a: "Oui, un prototype ciblé permet de valider rapidement la valeur avant un déploiement plus large.",
        },
      ],
      paragraphs: [
        "Ajouter pour chaque cas une situation initiale, la solution IA, les gains obtenus et les métriques suivies.",
        "Ajouter une comparaison avant/après pour rendre le ROI plus lisible.",
        "Ajouter un lien vers la page service la plus proche de chaque réalisation.",
      ],
      internalLinks: [
        { href: "/audit-ia", label: "Audit IA entreprise" },
        { href: "/crm-ia-pme", label: "CRM IA PME" },
        { href: "/assistant-ia-telephone", label: "Assistant téléphonique IA" },
        { href: "/applications-metier", label: "Applications métier" },
        { href: "/contact", label: "Contacter CorsaiManager" },
      ],
      cta: "Demander un audit IA pour identifier un cas d'usage rentable.",
    }),
    "/agence-ia-france": createImprovedSeoProfile({
      title: "Agence IA France pour PME",
      description:
        "Agence IA France pour PME: audit IA, automatisation, CRM IA, assistants IA, applications métier et accompagnement ROI.",
      h1: "Agence IA France : audit, automatisation et solutions IA pour PME",
      h2: [
        "Pourquoi les PME françaises investissent dans l'IA",
        "Audit IA entreprise",
        "CRM IA et automatisation commerciale",
        "Assistant téléphonique IA",
        "Applications métier sur mesure",
        "ROI et gains mesurables",
      ],
      h3: ["Méthode CorsaiManager", "Cas clients", "Plan de déploiement"],
      faq: [
        {
          q: "Pourquoi choisir une agence IA en France ?",
          a: "Pour bénéficier d'un accompagnement métier, d'un cadrage pragmatique et d'un suivi adapté aux PME françaises.",
        },
        {
          q: "Quels projets IA prioriser ?",
          a: "Les tâches fréquentes, mesurables et liées au suivi commercial, aux appels, au reporting ou aux outils métier.",
        },
        {
          q: "CorsaiManager intervient-il hors de Corse ?",
          a: "Oui. CorsaiManager est basé en Corse et accompagne les PME partout en France.",
        },
      ],
      paragraphs: [
        "Renforcer les exemples nationaux par secteurs: services, négoce, industrie légère, immobilier, santé ou restauration.",
        "Ajouter une section de comparaison entre outil IA générique et solution IA métier.",
        "Ajouter des preuves de méthode: audit, prototype, intégration, mesure et amélioration continue.",
      ],
      internalLinks: [
        { href: "/audit-ia", label: "Audit IA entreprise" },
        { href: "/crm-ia-pme", label: "CRM IA PME" },
        { href: "/assistant-ia-telephone", label: "Assistant téléphonique IA" },
        { href: "/applications-metier", label: "Applications métier" },
        { href: "/transformation-digitale-pme", label: "Transformation digitale PME" },
      ],
      cta: "Demander un diagnostic IA pour votre PME.",
    }),
    "/transformation-digitale-pme": createImprovedSeoProfile({
      title: "Transformation digitale PME",
      description:
        "Structurez la transformation digitale de votre PME avec audit IA, automatisation, CRM IA, applications métier et feuille de route ROI.",
      h1: "Transformation digitale PME : structurer vos outils, vos données et vos automatisations",
      h2: [
        "Pourquoi digitaliser les processus d'une PME",
        "Audit des outils et des données",
        "Automatisation et CRM IA",
        "Applications métier sur mesure",
        "Feuille de route digitale",
        "Mesurer le ROI",
      ],
      h3: ["Processus prioritaires", "Risques à éviter", "Indicateurs à suivre"],
      faq: [
        {
          q: "Par où commencer une transformation digitale PME ?",
          a: "Par un audit des processus, outils, données et irritants qui coûtent du temps chaque semaine.",
        },
        {
          q: "Faut-il changer tous les outils ?",
          a: "Non. Il faut d'abord connecter, automatiser et simplifier avant de remplacer un logiciel.",
        },
        {
          q: "Quel rôle joue l'IA ?",
          a: "L'IA accélère les tâches répétitives, la qualification, les relances, le reporting et l'aide à la décision.",
        },
      ],
      paragraphs: [
        "Ajouter un diagnostic des symptômes: données dispersées, ressaisies, erreurs, délais et manque de pilotage.",
        "Ajouter une feuille de route type en trois temps: quick wins, socle outil, automatisations avancées.",
        "Ajouter un exemple de processus transformé avec les gains mesurables.",
      ],
      internalLinks: [
        { href: "/audit-ia", label: "Audit IA" },
        { href: "/crm-ia-pme", label: "CRM IA" },
        { href: "/automatisation-entreprise", label: "Automatisation entreprise" },
        { href: "/applications-metier", label: "Applications métier" },
        { href: "/agence-ia-france", label: "Agence IA France" },
      ],
      cta: "Construire votre feuille de route IA et digitale.",
    }),
  };

  return profiles[pathname] ?? null;
}

function createImprovedSeoProfile(profile: AdminSeoPageAudit["improvedSeo"]) {
  return {
    ...profile,
    title: cleanSeoTitle(profile.title),
  };
}

function cleanSeoTitle(title: string) {
  return title.replace(/\s*\|\s*CorsaiManager(?:\s*\|\s*CorsaiManager)*$/i, "").trim();
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
  if (text.includes("contact")) return "Contact agence IA";
  if (text.includes("realisation") || text.includes("cas client")) return "Réalisations IA";
  if (text.includes("agence")) return "Agence IA France";
  if (text.includes("transformation digitale")) return "Transformation digitale PME";
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
