export type SeoScoreCategory =
  | "metadata"
  | "structure"
  | "content"
  | "nationalPositioning"
  | "internalLinks"
  | "conversion"
  | "imagesAlt"
  | "readability";

export type SeoScores = Record<SeoScoreCategory, number>;

export type SeoChecklistItem = {
  key: string;
  label: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  recommendation: string;
};

export type SeoObjectiveAction = {
  action: string;
  points: number;
};

export type SeoFinding = {
  type: "success" | "warning" | "error";
  title: string;
  detail: string;
};

export type SeoRecommendation = {
  priority: "high" | "medium" | "low";
  action: string;
  why: string;
  example: string;
};

export type ImprovedSeo = {
  title: string;
  metaDescription: string;
  h1: string;
  h2Plan: string[];
};

export type ExtractedSeoData = {
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  internalLinks: string[];
  wordCount: number;
  hasFaq: boolean;
  imageCount: number;
  imagesWithAlt: number;
  targetKeywords: string[];
  ctaKeywords: string[];
};

export type SeoAuditBase = {
  url: string;
  globalScore: number;
  targetScore: 100;
  scoreGap: number;
  scores: SeoScores;
  checklist: SeoChecklistItem[];
  objectiveActions: SeoObjectiveAction[];
  findings: SeoFinding[];
  recommendations: SeoRecommendation[];
  improvedSeo: ImprovedSeo;
  extracted: ExtractedSeoData;
};

export type SeoAuditResult = Omit<SeoAuditBase, "extracted"> & {
  google?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    queries: Array<{ query?: string; clicks: number; impressions: number; ctr: number; position: number }>;
    opportunities: string[];
  } | null;
};

const targetKeywords = [
  "automatisation IA PME",
  "consultant IA PME",
  "agence IA France",
  "audit IA entreprise",
  "CRM IA PME",
  "assistant téléphonique IA",
  "application métier sur mesure",
  "automatisation commerciale",
  "intelligence artificielle entreprise",
  "IA pour TPE PME",
  "transformation digitale PME",
];
const ctaKeywords = ["contact", "audit", "rendez-vous", "rendez vous", "devis", "diagnostic"];

export function assertCorsaiManagerUrl(rawUrl: string) {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("URL invalide. Saisissez une URL complete, par exemple https://corsaimanager.com/crm-ia-pme.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Seules les URL HTTP et HTTPS sont acceptees.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== "corsaimanager.com" && !hostname.endsWith(".corsaimanager.com")) {
    throw new Error("L'audit est limite aux pages du domaine corsaimanager.com.");
  }

  return parsed.toString();
}

export async function fetchPageHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "CorsaiManager SEO Audit Bot",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`Impossible de recuperer la page (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error("La ressource analysee ne semble pas etre une page HTML.");
  }

  return response.text();
}

export function createSeoAudit(url: string, html: string): SeoAuditBase {
  const extracted = extractSeoData(url, html);
  const checklist = buildChecklist(extracted);
  const scores = scoreSeoData(checklist);
  const globalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const objectiveActions = checklist
    .filter((item) => item.points < item.maxPoints)
    .map((item) => ({ action: item.recommendation, points: item.maxPoints - item.points }));
  const findings = buildFindings(extracted, scores);
  const recommendations = buildFallbackRecommendations(extracted, scores);
  const improvedSeo = buildFallbackImprovedSeo(extracted);

  return {
    url,
    globalScore,
    targetScore: 100,
    scoreGap: 100 - globalScore,
    scores,
    checklist,
    objectiveActions,
    findings,
    recommendations,
    improvedSeo,
    extracted,
  };
}

function extractSeoData(url: string, html: string): ExtractedSeoData {
  const title = decodeHtml(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const metaDescription = decodeHtml(
    firstMatch(
      html,
      /<meta\s+(?=[^>]*name=["']description["'])(?=[^>]*content=["']([^"']*)["'])[^>]*>/i,
    ) || firstMatch(html, /<meta\s+(?=[^>]*content=["']([^"']*)["'])(?=[^>]*name=["']description["'])[^>]*>/i),
  );
  const h1 = extractTags(html, "h1");
  const h2 = extractTags(html, "h2");
  const text = htmlToText(html);
  const lowerText = normalizeForSearch(text);
  const internalLinks = extractInternalLinks(url, html);
  const imageStats = extractImageStats(html);

  return {
    title,
    metaDescription,
    h1,
    h2,
    internalLinks,
    wordCount: countWords(text),
    hasFaq: /faq|questions fréquentes|questions frequentes/i.test(text),
    imageCount: imageStats.imageCount,
    imagesWithAlt: imageStats.imagesWithAlt,
    targetKeywords: targetKeywords.filter((keyword) => lowerText.includes(normalizeForSearch(keyword))),
    ctaKeywords: ctaKeywords.filter((keyword) => lowerText.includes(normalizeForSearch(keyword))),
  };
}

function scoreSeoData(checklist: SeoChecklistItem[]): SeoScores {
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

function buildFindings(data: ExtractedSeoData, scores: SeoScores): SeoFinding[] {
  const findings: SeoFinding[] = [];

  if (scores.metadata >= 13) {
    findings.push({ type: "success", title: "Metadata solides", detail: "Le title et la meta description sont presents avec une longueur exploitable." });
  } else {
    findings.push({ type: "warning", title: "Metadata a renforcer", detail: "Le title ou la meta description peut etre ajuste pour mieux couvrir IA, PME françaises et benefice business." });
  }

  if (data.h1.length !== 1) {
    findings.push({ type: "error", title: "H1 a clarifier", detail: data.h1.length === 0 ? "Aucun H1 detecte sur la page." : "Plusieurs H1 detectes. Gardez un H1 principal et transformez les autres en H2." });
  } else {
    findings.push({ type: "success", title: "H1 detecte", detail: `H1 actuel: ${data.h1[0]}` });
  }

  if (scores.nationalPositioning < 8) {
    findings.push({ type: "warning", title: "Positionnement France trop faible", detail: "Ajoutez des references naturelles aux PME françaises, a la France entière, aux TPE/PME et aux cas d'usage métier." });
  }

  if (scores.internalLinks < 10) {
    findings.push({ type: "warning", title: "Maillage interne limite", detail: "Ajoutez des liens vers les pages CRM IA, automatisation IA, applications metier et audit IA." });
  }

  if (scores.conversion < 8) {
    findings.push({ type: "warning", title: "CTA a rendre plus visible", detail: "La page doit guider vers un diagnostic, un audit ou un rendez-vous plus explicitement." });
  } else {
    findings.push({ type: "success", title: "Intention de conversion presente", detail: "La page contient deja des signaux d'action utiles pour convertir." });
  }

  return findings.slice(0, 7);
}

function buildFallbackRecommendations(data: ExtractedSeoData, scores: SeoScores): SeoRecommendation[] {
  const recommendations: SeoRecommendation[] = [];

  if (scores.metadata < 13) {
    recommendations.push({
      priority: "high",
      action: "Reecrire le title et la meta description autour d'un benefice IA local.",
      why: "Les resultats Google doivent annoncer clairement le probleme traite, le positionnement France entière et la valeur business.",
      example: "CRM IA pour PME en France | CorsaiManager",
    });
  }

  if (scores.structure < 12) {
    recommendations.push({
      priority: "high",
      action: "Structurer la page avec un H1 unique puis 4 a 6 H2 orientes questions clients.",
      why: "Une structure nette aide Google et les dirigeants a comprendre rapidement la promesse.",
      example: "H2: Pourquoi automatiser votre suivi commercial avec l'IA ?",
    });
  }

  if (scores.nationalPositioning < 8) {
    recommendations.push({
      priority: "medium",
      action: "Renforcer la pertinence nationale de la page.",
      why: "CorsaiManager doit capter les recherches des PME françaises qui veulent une solution concrete et accompagnée a distance.",
      example: "Basé en Corse, CorsaiManager accompagne les PME partout en France.",
    });
  }

  if (scores.internalLinks < 12) {
    recommendations.push({
      priority: "medium",
      action: "Ajouter 3 a 5 liens internes contextuels vers les pages services.",
      why: "Le maillage transmet le contexte semantique et aide l'utilisateur a continuer son parcours.",
      example: "Lien vers /crm-ia-pme depuis une section sur le suivi commercial.",
    });
  }

  if (scores.conversion < 8) {
    recommendations.push({
      priority: "high",
      action: "Ajouter un CTA visible au-dessus de la ligne de flottaison et en fin de page.",
      why: "Une page B2B locale doit transformer l'interet en demande de diagnostic.",
      example: "Demander un diagnostic IA gratuit pour votre PME française.",
    });
  }

  if (data.wordCount < 450) {
    recommendations.push({
      priority: "medium",
      action: "Ajouter une section cas d'usage et ROI.",
      why: "Le contenu manque probablement de profondeur pour couvrir l'intention de recherche.",
      example: "Expliquer le gain de temps sur les relances, devis, appels et suivi CRM.",
    });
  }

  return recommendations.slice(0, 6);
}

function buildFallbackImprovedSeo(data: ExtractedSeoData): ImprovedSeo {
  const mainTopic = inferTopic(data);

  return {
    title: `${mainTopic} pour PME en France | CorsaiManager`,
    metaDescription:
      "Analysez et optimisez votre page avec un audit SEO IA: contenu, structure, positionnement France, maillage interne et conversion.",
    h1: `${mainTopic} pour les PME françaises`,
    h2Plan: [
      "Pourquoi cette solution IA repond aux besoins des PME françaises",
      "Cas d'usage concrets pour les TPE et PME en France",
      "Gains attendus: temps, suivi commercial et ROI",
      "Comment CorsaiManager met en place l'automatisation",
      "Demander un diagnostic IA pour votre entreprise",
    ],
  };
}

function inferTopic(data: ExtractedSeoData) {
  const source = `${data.title} ${data.h1.join(" ")}`.toLowerCase();
  if (source.includes("crm")) return "CRM IA";
  if (source.includes("assistant")) return "Assistant IA";
  if (source.includes("application")) return "Application metier IA";
  if (source.includes("automatisation")) return "Automatisation IA";
  return "Audit SEO IA";
}

function buildChecklist(data: ExtractedSeoData): SeoChecklistItem[] {
  const titleOptimized = data.title.length >= 42 && data.title.length <= 65;
  const metaPresent = data.metaDescription.length >= 120 && data.metaDescription.length <= 165;
  const h1Unique = data.h1.length === 1 && data.h1[0].length >= 12 && data.h1[0].length <= 90;
  const enoughH2 = data.h2.length >= 3;
  const contentLong = data.wordCount >= 700;
  const faqPresent = data.hasFaq;
  const ctaPresent = data.ctaKeywords.length > 0;
  const enoughLinks = data.internalLinks.length >= 5;
  const imagesOk = data.imageCount === 0 || data.imagesWithAlt >= data.imageCount;
  const nationalClear = data.targetKeywords.length >= 3 || mentionsFrancePositioning(data);
  const readable = data.h2.length >= 3 && data.wordCount >= 450;

  return [
    checklistItem("title", "Title optimisé", titleOptimized, titleOptimized ? 5 : data.title ? 3 : 0, 5, "Optimiser le title entre 42 et 65 caractères avec le mot-clé national principal."),
    checklistItem("meta", "Meta description présente", metaPresent, metaPresent ? 10 : data.metaDescription ? 5 : 0, 10, "Ajouter ou réécrire une meta description de 120 à 165 caractères orientée PME françaises."),
    checklistItem("h1", "H1 unique", h1Unique, h1Unique ? 7 : data.h1.length > 0 ? 3 : 0, 7, "Définir un H1 unique, clair et aligné sur l'offre IA principale."),
    checklistItem("h2", "H2 suffisants", enoughH2, Math.min(8, data.h2.length * 2), 8, "Ajouter au moins 3 H2 couvrant problème, méthode, cas d'usage, ROI et CTA."),
    checklistItem("content", "Contenu suffisamment long", contentLong, data.wordCount >= 450 ? 12 : data.wordCount >= 250 ? 8 : 4, 15, "Renforcer le contenu avec exemples, méthode, bénéfices et preuves métier."),
    checklistItem("faq", "FAQ présente", faqPresent, faqPresent ? 5 : 0, 5, "Ajouter une FAQ SEO de 3 questions sur l'usage, le délai, le ROI ou l'accompagnement."),
    checklistItem("links", "Liens internes suffisants", enoughLinks, Math.min(15, data.internalLinks.length * 3), 15, "Ajouter au moins 5 liens internes vers les pages services, audit IA et pages piliers."),
    checklistItem("cta", "CTA présent", ctaPresent, data.ctaKeywords.length >= 2 ? 10 : ctaPresent ? 7 : 0, 10, "Ajouter un CTA clair vers diagnostic IA, audit IA ou contact."),
    checklistItem("images", "Images avec ALT", imagesOk, imagesOk ? 10 : Math.round((data.imagesWithAlt / Math.max(1, data.imageCount)) * 10), 10, "Ajouter des attributs alt descriptifs sur chaque image utile."),
    checklistItem("national", "Positionnement France entière clair", nationalClear, Math.min(10, data.targetKeywords.length * 3 + (mentionsFrancePositioning(data) ? 2 : 0)), 10, "Renforcer les mots-clés: automatisation IA PME, consultant IA PME, audit IA entreprise, CRM IA PME."),
    checklistItem("readability", "Lisibilité", readable, readable ? 5 : 3, 5, "Aérer la page avec paragraphes courts, listes, H2/H3 et exemples scannables."),
  ];
}

function checklistItem(key: string, label: string, passed: boolean, points: number, maxPoints: number, recommendation: string): SeoChecklistItem {
  return { key, label, passed, points: Math.min(points, maxPoints), maxPoints, recommendation };
}

function extractTags(html: string, tagName: "h1" | "h2") {
  return [...html.matchAll(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"))]
    .map((match) => decodeHtml(stripTags(match[1] ?? "")).trim())
    .filter(Boolean)
    .slice(0, 12);
}

function extractImageStats(html: string) {
  const images = [...html.matchAll(/<img\b[^>]*>/gi)];
  const imagesWithAlt = images.filter((match) => /\salt=["'][^"']+["']/i.test(match[0])).length;
  return {
    imageCount: images.length,
    imagesWithAlt,
  };
}

function extractInternalLinks(pageUrl: string, html: string) {
  const origin = new URL(pageUrl).origin;
  const links = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1])
    .filter(Boolean)
    .map((href) => {
      try {
        return new URL(href, origin);
      } catch {
        return null;
      }
    })
    .filter((link): link is URL => Boolean(link))
    .filter((link) => link.hostname === "corsaimanager.com" || link.hostname.endsWith(".corsaimanager.com"))
    .map((link) => `${link.pathname}${link.search}`.replace(/\/$/, "") || "/");

  return Array.from(new Set(links)).slice(0, 30);
}

function htmlToText(html: string) {
  return decodeHtml(
    stripTags(
      html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, " "),
    ),
  ).replace(/\s+/g, " ").trim();
}

function countWords(text: string) {
  return (text.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)?/g) ?? []).length;
}

function mentionsFrancePositioning(data: ExtractedSeoData) {
  const text = normalizeForSearch(`${data.title} ${data.metaDescription} ${data.h1.join(" ")} ${data.h2.join(" ")}`);
  return ["france", "francaises", "tpe", "pme"].some((keyword) => text.includes(keyword));
}

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function firstMatch(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1] ?? "";
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ");
}

function decodeHtml(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/&(#\d+|#x[a-f0-9]+|[a-z]+);/gi, (entity, code: string) => {
      if (code.startsWith("#x")) return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
      if (code.startsWith("#")) return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
      return entities[code.toLowerCase()] ?? entity;
    })
    .replace(/\s+/g, " ")
    .trim();
}
