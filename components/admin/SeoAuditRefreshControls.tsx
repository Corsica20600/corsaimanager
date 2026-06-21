"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AuditStatus = "idle" | "running" | "done" | "error";

export function SeoAuditRefreshControls({
  lastAuditLabel,
  source,
}: {
  lastAuditLabel: string;
  source: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<AuditStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runFullAudit() {
    startTransition(async () => {
      setStatus("running");
      setMessage("Audit en cours...");
      const response = await fetch("/api/admin/seo-audit/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ force: true }),
      });
      if (!response.ok) {
        setStatus("error");
        setMessage("Audit en erreur.");
        return;
      }
      const payload = (await response.json()) as { run?: { pagesCount?: number; averageScore?: number } };
      setStatus("done");
      setMessage(`Audit terminé: ${payload.run?.pagesCount ?? 0} pages, score moyen ${payload.run?.averageScore ?? "-"} /100.`);
      router.refresh();
    });
  }

  function clearCache() {
    startTransition(async () => {
      setStatus("running");
      setMessage("Vidage du cache SEO...");
      const response = await fetch("/api/admin/seo-audit/cache", {
        method: "DELETE",
        cache: "no-store",
      });
      if (!response.ok) {
        setStatus("error");
        setMessage("Impossible de vider le cache SEO.");
        return;
      }
      setStatus("done");
      setMessage("Cache SEO vidé. Vous pouvez relancer l'audit complet.");
      router.refresh();
    });
  }

  return (
    <section className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Relance audit SEO</p>
          <p className="mt-2 text-sm text-zinc-300">
            Dernier audit: <span className="font-semibold text-zinc-100">{lastAuditLabel}</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Source analysée: {source}. Les relances live ignorent le cache et ajoutent un paramètre de rafraîchissement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={runFullAudit}
            className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
          >
            Relancer l&apos;audit complet
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={clearCache}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/50 hover:text-cyan-100 disabled:cursor-wait disabled:opacity-70"
          >
            Vider le cache SEO
          </button>
        </div>
      </div>
      {message ? (
        <p
          className={
            status === "error"
              ? "mt-4 rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100"
              : "mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100"
          }
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}

export function SeoPageAnalyzeButton({ url }: { url: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuditStatus>("idle");
  const [isPending, startTransition] = useTransition();

  function analyzePage() {
    startTransition(async () => {
      setStatus("running");
      const response = await fetch("/api/admin/seo-audit/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ url }),
      });
      setStatus(response.ok ? "done" : "error");
      if (response.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={analyzePage}
      className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/50 disabled:cursor-wait disabled:opacity-70"
    >
      {status === "running" ? "Audit en cours..." : status === "done" ? "Audit terminé" : "Analyser cette page"}
    </button>
  );
}
