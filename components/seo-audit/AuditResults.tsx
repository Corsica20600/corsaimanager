import Link from "next/link";
import { ScoreCard } from "@/components/seo-audit/ScoreCard";
import type { SeoAuditResult } from "@/lib/seo/analyzeSeo";

const scoreLabels: Array<[keyof SeoAuditResult["scores"], string, string]> = [
  ["metadata", "Title / meta description", "Clarte, longueur et promesse dans les resultats Google."],
  ["structure", "H1 / H2 / structure", "Hierarchie de contenu et lisibilite pour Google."],
  ["content", "Contenu et intention", "Profondeur du contenu et alignement avec la recherche."],
  ["internalLinks", "Maillage interne", "Liens vers les pages strategiques du site."],
  ["localSeo", "Positionnement France", "Signaux France, PME, TPE, consultant IA et offres nationales."],
  ["conversion", "CTA et conversion", "Capacite a transformer la visite en demande."],
  ["readability", "Lisibilite", "Titres clairs, contenu scannable et densite utile."],
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
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
              style={{ width: `${Math.max(4, Math.min(100, result.globalScore))}%` }}
            />
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2">
          {scoreLabels.map(([key, label, detail]) => (
            <ScoreCard key={key} label={label} score={result.scores[key]} detail={detail} />
          ))}
        </div>
      </div>

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
          Vous voulez un audit complet de votre site ?
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
          CorsaiManager peut analyser vos pages, vos parcours de conversion et vos opportunites IA pour construire un plan d&apos;action priorise.
        </p>
        <Link
          href="/audit-ia"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
        >
          Demandez un diagnostic IA
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
