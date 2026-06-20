export type SeoScoreCategory =
  | "metadata"
  | "structure"
  | "content"
  | "nationalPositioning"
  | "internalLinks"
  | "conversion"
  | "offerClarity";

export type SeoScores = Record<SeoScoreCategory, number>;

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
  targetKeywords: string[];
  ctaKeywords: string[];
};

export type SeoAuditBase = {
  url: string;
  globalScore: number;
  scores: SeoScores;
  findings: SeoFinding[];
  recommendations: SeoRecommendation[];
  improvedSeo: ImprovedSeo;
  extracted: ExtractedSeoData;
};

export type SeoAuditResult = Omit<SeoAuditBase, "extracted">;

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
  const scores = scoreSeoData(extracted);
  const globalScore = Math.round(
    scores.metadata * 0.18 +
      scores.structure * 0.14 +
      scores.content * 0.18 +
      scores.nationalPositioning * 0.16 +
      scores.internalLinks * 0.12 +
      scores.conversion * 0.14 +
      scores.offerClarity * 0.08,
  );
  const findings = buildFindings(extracted, scores);
  const recommendations = buildFallbackRecommendations(extracted, scores);
  const improvedSeo = buildFallbackImprovedSeo(extracted);

  return {
    url,
    globalScore,
    scores,
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

  return {
    title,
    metaDescription,
    h1,
    h2,
    internalLinks,
    wordCount: countWords(text),
    targetKeywords: targetKeywords.filter((keyword) => lowerText.includes(normalizeForSearch(keyword))),
    ctaKeywords: ctaKeywords.filter((keyword) => lowerText.includes(normalizeForSearch(keyword))),
  };
}

function scoreSeoData(data: ExtractedSeoData): SeoScores {
  const metadata =
    scoreLength(data.title.length, 45, 60, 15, 70) * 0.48 +
    scoreLength(data.metaDescription.length, 135, 160, 80, 180) * 0.52;

  const structure =
    (data.h1.length === 1 ? 45 : data.h1.length > 1 ? 20 : 0) +
    Math.min(data.h2.length, 5) * 9 +
    (data.h2.length >= 3 ? 10 : 0);

  const content =
    scoreRange(data.wordCount, [
      [900, 100],
      [650, 85],
      [450, 70],
      [300, 55],
      [150, 35],
    ]) + (mentionsBusinessIntent(data) ? 8 : 0);

  const nationalPositioning = Math.min(100, data.targetKeywords.length * 16 + (mentionsFrancePositioning(data) ? 18 : 0));
  const internalLinks = Math.min(100, data.internalLinks.length * 16 + (data.internalLinks.length >= 4 ? 20 : 0));
  const conversion = Math.min(100, data.ctaKeywords.length * 22 + (data.ctaKeywords.includes("audit") ? 12 : 0));
  const offerClarity = scoreOfferClarity(data);

  return {
    metadata: clamp(Math.round(metadata)),
    structure: clamp(Math.round(structure)),
    content: clamp(Math.round(content)),
    nationalPositioning: clamp(Math.round(nationalPositioning)),
    internalLinks: clamp(Math.round(internalLinks)),
    conversion: clamp(Math.round(conversion)),
    offerClarity: clamp(Math.round(offerClarity)),
  };
}

function buildFindings(data: ExtractedSeoData, scores: SeoScores): SeoFinding[] {
  const findings: SeoFinding[] = [];

  if (scores.metadata >= 80) {
    findings.push({ type: "success", title: "Metadata solides", detail: "Le title et la meta description sont presents avec une longueur exploitable." });
  } else {
    findings.push({ type: "warning", title: "Metadata a renforcer", detail: "Le title ou la meta description peut etre ajuste pour mieux couvrir IA, PME françaises et benefice business." });
  }

  if (data.h1.length !== 1) {
    findings.push({ type: "error", title: "H1 a clarifier", detail: data.h1.length === 0 ? "Aucun H1 detecte sur la page." : "Plusieurs H1 detectes. Gardez un H1 principal et transformez les autres en H2." });
  } else {
    findings.push({ type: "success", title: "H1 detecte", detail: `H1 actuel: ${data.h1[0]}` });
  }

  if (scores.nationalPositioning < 60) {
    findings.push({ type: "warning", title: "Positionnement France trop faible", detail: "Ajoutez des references naturelles aux PME françaises, a la France entière, aux TPE/PME et aux cas d'usage métier." });
  }

  if (scores.internalLinks < 55) {
    findings.push({ type: "warning", title: "Maillage interne limite", detail: "Ajoutez des liens vers les pages CRM IA, automatisation IA, applications metier et audit IA." });
  }

  if (scores.conversion < 60) {
    findings.push({ type: "warning", title: "CTA a rendre plus visible", detail: "La page doit guider vers un diagnostic, un audit ou un rendez-vous plus explicitement." });
  } else {
    findings.push({ type: "success", title: "Intention de conversion presente", detail: "La page contient deja des signaux d'action utiles pour convertir." });
  }

  return findings.slice(0, 7);
}

function buildFallbackRecommendations(data: ExtractedSeoData, scores: SeoScores): SeoRecommendation[] {
  const recommendations: SeoRecommendation[] = [];

  if (scores.metadata < 85) {
    recommendations.push({
      priority: "high",
      action: "Reecrire le title et la meta description autour d'un benefice IA local.",
      why: "Les resultats Google doivent annoncer clairement le probleme traite, le positionnement France entière et la valeur business.",
      example: "CRM IA pour PME en France | CorsaiManager",
    });
  }

  if (scores.structure < 75) {
    recommendations.push({
      priority: "high",
      action: "Structurer la page avec un H1 unique puis 4 a 6 H2 orientes questions clients.",
      why: "Une structure nette aide Google et les dirigeants a comprendre rapidement la promesse.",
      example: "H2: Pourquoi automatiser votre suivi commercial avec l'IA ?",
    });
  }

  if (scores.nationalPositioning < 70) {
    recommendations.push({
      priority: "medium",
      action: "Renforcer la pertinence nationale de la page.",
      why: "CorsaiManager doit capter les recherches des PME françaises qui veulent une solution concrete et accompagnée a distance.",
      example: "Basé en Corse, CorsaiManager accompagne les PME partout en France.",
    });
  }

  if (scores.internalLinks < 70) {
    recommendations.push({
      priority: "medium",
      action: "Ajouter 3 a 5 liens internes contextuels vers les pages services.",
      why: "Le maillage transmet le contexte semantique et aide l'utilisateur a continuer son parcours.",
      example: "Lien vers /crm-ia-pme depuis une section sur le suivi commercial.",
    });
  }

  if (scores.conversion < 70) {
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

function extractTags(html: string, tagName: "h1" | "h2") {
  return [...html.matchAll(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"))]
    .map((match) => decodeHtml(stripTags(match[1] ?? "")).trim())
    .filter(Boolean)
    .slice(0, 12);
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

function mentionsBusinessIntent(data: ExtractedSeoData) {
  const text = normalizeForSearch(`${data.title} ${data.metaDescription} ${data.h1.join(" ")} ${data.h2.join(" ")}`);
  return ["roi", "gain de temps", "commercial", "automatisation", "crm", "ia"].some((keyword) => text.includes(keyword));
}

function scoreOfferClarity(data: ExtractedSeoData) {
  const avgH2Words =
    data.h2.length > 0 ? data.h2.reduce((sum, h2) => sum + countWords(h2), 0) / data.h2.length : 12;
  const structureBonus = data.h2.length >= 3 ? 20 : data.h2.length * 5;
  const titleClarity = data.title.length <= 70 ? 25 : 10;
  const h2Clarity = avgH2Words <= 10 ? 25 : avgH2Words <= 14 ? 18 : 10;
  const offerTerms = ["crm", "assistant", "automatisation", "application", "audit", "ia"].filter((term) =>
    normalizeForSearch(`${data.title} ${data.metaDescription} ${data.h1.join(" ")} ${data.h2.join(" ")}`).includes(term),
  ).length;
  const offerBonus = Math.min(30, offerTerms * 6);

  return titleClarity + h2Clarity + structureBonus + offerBonus;
}

function mentionsFrancePositioning(data: ExtractedSeoData) {
  const text = normalizeForSearch(`${data.title} ${data.metaDescription} ${data.h1.join(" ")} ${data.h2.join(" ")}`);
  return ["france", "francaises", "tpe", "pme"].some((keyword) => text.includes(keyword));
}

function scoreLength(length: number, idealMin: number, idealMax: number, acceptableMin: number, acceptableMax: number) {
  if (length >= idealMin && length <= idealMax) return 100;
  if (length >= acceptableMin && length <= acceptableMax) return 72;
  if (length > 0) return 42;
  return 0;
}

function scoreRange(value: number, ranges: [number, number][]) {
  for (const [min, score] of ranges) {
    if (value >= min) return score;
  }
  return 15;
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

function clamp(score: number) {
  return Math.max(0, Math.min(100, score));
}
