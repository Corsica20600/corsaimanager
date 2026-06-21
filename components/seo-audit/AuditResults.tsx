import Link from "next/link";
import { ScoreCard } from "@/components/seo-audit/ScoreCard";
import type { SeoAuditResult } from "@/lib/seo/analyzeSeo";

const scoreLabels: Array<[keyof SeoAuditResult["scores"], string, string]> = [
  ["metadata", "Title / meta description", "Clarte, longueur et promesse dans les resultats Google."],
  ["structure", "H1 / H2 / structure", "Hierarchie de contenu et lisibilite pour Google."],
  ["content", "Pertinence nationale", "Profondeur du contenu et alignement avec les recherches PME France entière."],
  ["internalLinks", "Maillage interne", "Liens vers les pages strategiques du site."],
  ["nationalPositioning", "Positionnement France entière", "Signaux automatisation IA PME, consultant IA PME et agence IA France."],
  ["conversion", "Conversion", "Capacite a guider vers un diagnostic, un audit IA ou une prise de contact."],
  ["imagesAlt", "Images / ALT", "Presence d'images utiles avec attributs alt descriptifs."],
  ["readability", "Lisibilité", "Page scannable avec titres, sections et contenu aeré."],
];

const findingStyles = {
  success: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-300/25 bg-amber-400/10 text-amber-100",
  error: "border-rose-300/25 bg-rose-400/10 text-rose-100",
};

const priorityStyles = {
  high: "bg-rose-400/15 text-rose-100 border-rose-300/25",
  medium: "bg-amber-400/15 text-amber-100 border-amber-300/25",
  low: "bg-cyan-400/15 text-cyan-100 border-cyan-300/25",
};

export function AuditResults({ result }: { result: SeoAuditResult }) {
  return (
    <section className="space-y-8" aria-live="polite">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
          <p className="text-sm text-cyan-100">Score global</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-7xl font-semibold tracking-tight text-zinc-100">{result.globalScore}</span>
            <span className="pb-3 text-2xl text-zinc-400">/100</span>
          </div>
          <p className="mt-4 break-all text-sm leading-relaxed text-zinc-300">{result.url}</p>
          <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-200">
            <p>Objectif: <span className="font-semibold text-cyan-100">{result.targetScore}/100</span></p>
            <p>Écart restant: <span className="font-semibold text-amber-100">{result.scoreGap} points</span></p>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
              style={{ width: `${Math.max(4, Math.min(100, result.globalScore))}%` }}
            />
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2">
          {scoreLabels.map(([key, label, detail]) => (
            <ScoreCard key={key} label={label} score={result.scores[key]} maxScore={scoreMax(key)} detail={detail} />
          ))}
        </div>
      </div>

      <article className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Mode Objectif 100</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Le score 100/100 indique une page optimisée selon les critères internes CorsaiManager. Il ne garantit pas une position Google.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Checklist</h3>
            <div className="mt-3 space-y-2">
              {result.checklist.map((item) => (
                <div key={item.key} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className={item.passed ? "text-emerald-100" : "text-amber-100"}>
                      {item.passed ? "Validé" : "À corriger"} - {item.label}
                    </span>
                    <span className="font-semibold text-cyan-100">{item.points}/{item.maxPoints} pts</span>
                  </div>
                  {!item.passed ? <p className="mt-1 text-xs leading-relaxed text-zinc-400">{item.recommendation}</p> : null}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Actions nécessaires</h3>
            <div className="mt-3 space-y-2">
              {result.objectiveActions.length ? result.objectiveActions.map((action) => (
                <div key={`${action.action}-${action.points}`} className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-50">
                  {action.action}: +{action.points} pts
                </div>
              )) : (
                <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                  Page à 100 selon la grille interne.
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Données Google Search Console</h2>
        {result.google ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <GoogleMetric label="Clics" value={String(result.google.clicks)} />
              <GoogleMetric label="Impressions" value={String(result.google.impressions)} />
              <GoogleMetric label="CTR" value={formatCtr(result.google.ctr)} />
              <GoogleMetric label="Position moyenne" value={result.google.position ? result.google.position.toFixed(1) : "-"} />
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Requêtes principales</h3>
                <div className="mt-3 space-y-2">
                  {result.google.queries.slice(0, 6).map((query) => (
                    <div key={`${query.query}-${query.impressions}`} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300">
                      <span className="text-cyan-100">{query.query ?? "Requête"}</span> - {query.impressions} impressions, CTR {formatCtr(query.ctr)}, position {query.position.toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Potentiel SEO</h3>
                <div className="mt-3 space-y-2">
                  {result.google.opportunities.length ? result.google.opportunities.map((opportunity) => (
                    <div key={opportunity} className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-50">
                      {opportunity}
                    </div>
                  )) : (
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300">
                      Aucun signal Google prioritaire détecté sur cette page.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            Search Console n&apos;est pas encore connecté ou aucune donnée n&apos;est disponible pour cette URL. Connectez Google dans le cockpit SEO admin.
          </p>
        )}
      </article>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Constats principaux</h2>
          <div className="mt-5 space-y-3">
            {result.findings.map((finding) => (
              <div key={`${finding.title}-${finding.detail}`} className={`rounded-2xl border p-4 ${findingStyles[finding.type]}`}>
                <p className="text-sm font-semibold">{finding.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{finding.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Version SEO amelioree</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed">
            <ImprovedBlock label="Title" value={result.improvedSeo.title} />
            <ImprovedBlock label="Meta description" value={result.improvedSeo.metaDescription} />
            <ImprovedBlock label="H1" value={result.improvedSeo.h1} />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Plan H2</p>
              <ul className="mt-2 space-y-2 text-zinc-300">
                {result.improvedSeo.h2Plan.map((h2) => (
                  <li key={h2} className="rounded-xl bg-white/[0.04] px-3 py-2">{h2}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>

      <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Recommandations prioritaires</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {result.recommendations.map((recommendation) => (
            <div key={`${recommendation.priority}-${recommendation.action}`} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[recommendation.priority]}`}>
                Priorite {recommendation.priority}
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-100">{recommendation.action}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{recommendation.why}</p>
              <p className="mt-3 rounded-xl bg-white/[0.04] px-3 py-2 text-sm leading-relaxed text-cyan-100">
                Exemple: {recommendation.example}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-cyan-300/15 to-blue-400/10 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Prochaine amélioration interne
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
          Utilisez ces recommandations pour prioriser les corrections de contenu, de maillage interne et de conversion sur corsaimanager.com.
        </p>
        <Link
          href="/admin/audit-seo"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
        >
          Voir l&apos;audit SEO interne
        </Link>
      </article>
    </section>
  );
}

function ImprovedBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{label}</p>
      <p className="mt-2 rounded-xl bg-white/[0.04] px-3 py-2 text-zinc-200">{value}</p>
    </div>
  );
}

function GoogleMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function scoreMax(key: keyof SeoAuditResult["scores"]) {
  const max: Record<keyof SeoAuditResult["scores"], number> = {
    metadata: 15,
    structure: 15,
    content: 20,
    internalLinks: 15,
    conversion: 10,
    imagesAlt: 10,
    nationalPositioning: 10,
    readability: 5,
  };
  return max[key];
}

function formatCtr(ctr: number) {
  return `${(ctr * 100).toFixed(1)}%`;
}
