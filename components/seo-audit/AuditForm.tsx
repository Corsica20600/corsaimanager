"use client";

import { FormEvent, useMemo, useState } from "react";
import { AuditResults } from "@/components/seo-audit/AuditResults";
import type { SeoAuditResult } from "@/lib/seo/analyzeSeo";

const exampleUrls = [
  "https://corsaimanager.com/crm-ia-pme",
  "https://corsaimanager.com/consultant-ia-pme",
  "https://corsaimanager.com/applications-metier",
];

export function AuditForm() {
  const [url, setUrl] = useState("https://corsaimanager.com/crm-ia-pme");
  const [result, setResult] = useState<SeoAuditResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => url.trim().length > 0 && !isLoading, [url, isLoading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/audit-seo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de lancer l'audit SEO.");
      }

      setResult(payload as SeoAuditResult);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erreur inconnue pendant l'audit SEO.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5 backdrop-blur sm:p-7"
      >
        <label htmlFor="seo-url" className="text-sm font-medium text-zinc-200">
          URL a analyser
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="seo-url"
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://corsaimanager.com/..."
            className="min-h-12 flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/70"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-400 px-6 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Analyse en cours..." : "Lancer l'analyse SEO"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {exampleUrls.map((exampleUrl) => (
            <button
              key={exampleUrl}
              type="button"
              onClick={() => setUrl(exampleUrl)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
            >
              {exampleUrl.replace("https://corsaimanager.com", "") || "/"}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-zinc-500">
          Prototype hybride: extraction HTML et regles SEO cote serveur, recommandations IA si la cle OpenAI est configuree.
        </p>

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
      </form>

      {isLoading ? <LoadingState /> : null}
      {result ? <AuditResults result={result} /> : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-32 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
      ))}
    </div>
  );
}
