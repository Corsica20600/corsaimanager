import type { SeoAuditBase } from "@/lib/seo/analyzeSeo";

export type SeoGooglePromptContext = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  queries: Array<{ query?: string; clicks: number; impressions: number; ctr: number; position: number }>;
  opportunities: string[];
} | null;

export function buildSeoAuditPrompt(audit: SeoAuditBase, googleContext?: SeoGooglePromptContext) {
  return `
Tu es un consultant SEO senior charge d'ameliorer le referencement interne de corsaimanager.com.
Basé en Corse, CorsaiManager accompagne les PME partout en France.

Positionnement a viser:
CorsaiManager = solutions IA, automatisation, CRM IA, assistant telephonique IA, applications metier et audit IA pour PME françaises.

Objectif: fournir des recommandations precises, utiles et actionnables. Evite le blabla generique.
L'audit est interne: il sert a ameliorer les pages CorsaiManager, pas a vendre un audit public a des prospects.

Donnees extraites:
- URL: ${audit.url}
- Title: ${audit.extracted.title || "absent"}
- Meta description: ${audit.extracted.metaDescription || "absente"}
- H1: ${audit.extracted.h1.join(" | ") || "absent"}
- H2: ${audit.extracted.h2.join(" | ") || "absents"}
- Nombre de mots: ${audit.extracted.wordCount}
- Liens internes: ${audit.extracted.internalLinks.length}
- Mots-cles nationaux detectes: ${audit.extracted.targetKeywords.join(", ") || "aucun"}
- CTA detectes: ${audit.extracted.ctaKeywords.join(", ") || "aucun"}
- Scores actuels: ${JSON.stringify(audit.scores)}
- Constats regles: ${JSON.stringify(audit.findings)}

Donnees Google Search Console:
${googleContext ? JSON.stringify(googleContext, null, 2) : "Non connectees ou indisponibles pour cette page."}

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
- Les recommandations doivent renforcer le positionnement France entière, la pertinence nationale, la clarté de l'offre et la conversion.
- Si les donnees Google sont disponibles, priorise les actions selon impressions, CTR, position moyenne et requetes reelles.
- Si une page a beaucoup d'impressions et un CTR faible, propose un title et une meta description orientes clic.
- Si une page est en position 8 a 20, propose des sections, FAQ et liens internes pour viser le top 10.
- Si une requete interessante n'a pas de page claire, propose une page ou section dediee.
- Ne recommande pas un angle geographique local. Garde seulement, si utile, la mention naturelle: "Basé en Corse, CorsaiManager accompagne les PME partout en France."
- Le title ameliore doit viser 45 a 60 caracteres.
- La meta description doit viser 135 a 160 caracteres.
- Le H1 doit etre clair, national et oriente benefice.
- Le plan H2 doit contenir 4 a 6 titres.
`.trim();
}
