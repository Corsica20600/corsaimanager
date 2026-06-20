import type { SeoAuditBase } from "@/lib/seo/analyzeSeo";

export function buildSeoAuditPrompt(audit: SeoAuditBase) {
  return `
Tu es un consultant SEO senior specialise dans les sites B2B pour PME en France.
Tu audites une page de CorsaiManager, une entreprise qui vend des solutions IA concretes aux PME partout en France: automatisation, CRM IA, applications metier, assistant telephonique IA, gain de temps, suivi commercial et ROI.

Objectif: fournir des recommandations precises, utiles et actionnables. Evite le blabla generique.

Donnees extraites:
- URL: ${audit.url}
- Title: ${audit.extracted.title || "absent"}
- Meta description: ${audit.extracted.metaDescription || "absente"}
- H1: ${audit.extracted.h1.join(" | ") || "absent"}
- H2: ${audit.extracted.h2.join(" | ") || "absents"}
- Nombre de mots: ${audit.extracted.wordCount}
- Liens internes: ${audit.extracted.internalLinks.length}
- Mots nationaux detectes: ${audit.extracted.localKeywords.join(", ") || "aucun"}
- CTA detectes: ${audit.extracted.ctaKeywords.join(", ") || "aucun"}
- Scores actuels: ${JSON.stringify(audit.scores)}
- Constats regles: ${JSON.stringify(audit.findings)}

Reponds uniquement en JSON valide, sans markdown, avec cette forme exacte:
{
  "findings": [
    { "type": "success" | "warning" | "error", "title": string, "detail": string }
  ],
  "recommendations": [
    { "priority": "high" | "medium" | "low", "action": string, "why": string, "example": string }
  ],
  "improvedSeo": {
    "title": string,
    "metaDescription": string,
    "h1": string,
    "h2Plan": string[]
  }
}

Contraintes de redaction:
- 4 a 7 findings maximum.
- 4 a 6 recommandations maximum.
- Les exemples doivent etre directement reutilisables pour CorsaiManager.
- Le title ameliore doit viser 45 a 60 caracteres.
- La meta description doit viser 135 a 160 caracteres.
- Le H1 doit etre clair, local et oriente benefice.
- Le plan H2 doit contenir 4 a 6 titres.
`.trim();
}
