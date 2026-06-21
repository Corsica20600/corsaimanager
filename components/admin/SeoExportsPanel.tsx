"use client";

import { useMemo, useState, useTransition } from "react";
import type { SeoActionPlanItem, SeoExportPayload } from "@/lib/seo/exportReport";

export function SeoExportsPanel({ payload }: { payload: SeoExportPayload }) {
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const markdown = useMemo(() => buildMarkdown(payload), [payload]);
  const chatGptText = useMemo(() => buildChatGptText(payload), [payload]);
  const json = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  function runExport(type: "markdown" | "json" | "pdf" | "copy_plan" | "chatgpt") {
    startTransition(async () => {
      await recordExport(type, payload);
      if (type === "markdown") downloadFile("rapport-seo-corsaimanager.md", markdown, "text/markdown;charset=utf-8");
      if (type === "json") downloadFile("donnees-seo-corsaimanager.json", json, "application/json;charset=utf-8");
      if (type === "copy_plan") await copyText(buildActionPlanText(payload.actionPlan));
      if (type === "chatgpt") await copyText(chatGptText);
      if (type === "pdf") exportPdf(payload, markdown);
      setStatus(statusLabel(type));
    });
  }

  return (
    <section id="exports-rapports" className="mt-8">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Exports & Rapports</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">Exporter le cockpit SEO complet</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
              Rapport Markdown, données JSON, copie pour analyse ChatGPT, plan complet et PDF imprimable.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
            Score moyen: <span className="font-semibold text-zinc-100">{payload.summary.averageInternalScore}/100</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <ExportButton disabled={isPending} onClick={() => runExport("markdown")}>Exporter le rapport Markdown</ExportButton>
          <ExportButton disabled={isPending} onClick={() => runExport("json")}>Exporter les données JSON</ExportButton>
          <ExportButton disabled={isPending} onClick={() => runExport("copy_plan")}>Copier le plan complet</ExportButton>
          <ExportButton disabled={isPending} onClick={() => runExport("pdf")}>Exporter PDF</ExportButton>
          <ExportButton disabled={isPending} onClick={() => runExport("chatgpt")}>Copier pour analyse ChatGPT</ExportButton>
        </div>

        {status ? (
          <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
            {status}
          </p>
        ) : null}

        <section className="mt-6">
          <h3 className="text-xl font-semibold text-zinc-100">Plan de travail SEO</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <ActionColumn title="P1 — À faire maintenant" items={payload.actionPlan.filter((item) => item.level === "P1")} />
            <ActionColumn title="P2 — À faire cette semaine" items={payload.actionPlan.filter((item) => item.level === "P2")} />
            <ActionColumn title="P3 — À faire ce mois-ci" items={payload.actionPlan.filter((item) => item.level === "P3")} />
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Preview title="Aperçu Markdown" content={markdown.slice(0, 1600)} />
          <Preview title="Aperçu JSON" content={json.slice(0, 1600)} />
        </section>
      </div>
    </section>
  );
}

function ExportButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15 disabled:cursor-wait disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function ActionColumn({ title, items }: { title: string; items: SeoActionPlanItem[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h4 className="font-semibold text-zinc-100">{title}</h4>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <article key={`${item.level}-${item.page}-${item.recommendation}`} className="rounded-xl border border-white/10 bg-zinc-950/30 px-3 py-3 text-sm text-zinc-300">
            <p className="font-semibold text-zinc-100">{item.page}</p>
            <p className="mt-1 text-xs text-cyan-100">{item.priority} - impact {item.estimatedImpact} - effort {item.estimatedEffort}</p>
            <p className="mt-2 text-zinc-400">{item.problem}</p>
            <p className="mt-2">{item.recommendation}</p>
            <p className="mt-2 text-xs text-zinc-500">Données: {item.dataUsed.join(", ")}</p>
          </article>
        ))}
        {!items.length ? <p className="text-sm text-zinc-500">Aucune action dans ce niveau.</p> : null}
      </div>
    </div>
  );
}

function Preview({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950/70 p-4 text-xs leading-relaxed text-zinc-400">
        {content}
      </pre>
    </div>
  );
}

function buildMarkdown(payload: SeoExportPayload) {
  return [
    "# Rapport SEO CorsaiManager",
    "",
    `Date: ${payload.generatedAt}`,
    "",
    "## Résumé global SEO",
    `- Pages analysées: ${payload.summary.analyzedPages}`,
    `- Score interne moyen: ${payload.summary.averageInternalScore}/100`,
    `- Pages sous 80/100: ${payload.summary.pagesUnder80}`,
    `- Clics Search Console: ${payload.summary.searchConsoleClicks}`,
    `- Impressions Search Console: ${payload.summary.searchConsoleImpressions}`,
    `- CTR Search Console: ${formatPercent(payload.summary.searchConsoleCtr)}`,
    `- Sessions GA4: ${payload.summary.ga4Sessions}`,
    `- Sessions SEO GA4: ${payload.summary.ga4OrganicSessions}`,
    `- Engagement GA4: ${formatPercent(payload.summary.ga4EngagementRate)}`,
    "",
    "## Pages prioritaires",
    ...payload.priorityPages.slice(0, 12).map((page) => `- ${page.path}: ${page.globalScore}/100, priorité ${page.priority}`),
    "",
    "## Pages sous 80/100",
    ...payload.pagesUnder80.slice(0, 20).map((page) => `- ${page.path}: ${page.globalScore}/100 — ${page.issues.join(" ")}`),
    "",
    "## Requêtes Google principales",
    ...payload.queries.slice(0, 20).map((query) => `- ${query.query}: pos. ${query.position.toFixed(1)}, ${query.impressions} impressions, CTR ${formatPercent(query.ctr)}, action: ${query.action}`),
    "",
    "## Opportunités SEO",
    ...payload.seoOpportunities.slice(0, 12).map((query) => `- ${query.opportunity} — ${query.query}: ${query.action}`),
    "",
    "## Recommandations IA",
    ...payload.aiRecommendations.slice(0, 8).map((page) => `- ${page.page}: ${page.actionPlan.join(" / ")}`),
    "",
    "## Nouvelles pages recommandées",
    ...payload.newPages.slice(0, 12).map((page) => `- ${page.url}: ${page.title} — H1: ${page.h1}`),
    "",
    "## Plan de travail priorisé",
    buildActionPlanText(payload.actionPlan),
  ].join("\n");
}

function buildChatGptText(payload: SeoExportPayload) {
  return [
    "Contexte :",
    "CorsaiManager veut améliorer son SEO national avec audit interne, Search Console, GA4 et recommandations IA.",
    "",
    "Résumé global :",
    `Score moyen ${payload.summary.averageInternalScore}/100, ${payload.summary.pagesUnder80} pages sous 80, ${payload.summary.searchConsoleImpressions} impressions Search Console, ${payload.summary.ga4Sessions} sessions GA4.`,
    "",
    "Pages prioritaires :",
    payload.priorityPages.slice(0, 12).map((page) => `- ${page.path}: ${page.globalScore}/100, ${page.priority}, problèmes: ${page.issues.join(" ")}`).join("\n"),
    "",
    "Requêtes Search Console :",
    payload.queries.slice(0, 20).map((query) => `- ${query.query}: position ${query.position.toFixed(1)}, impressions ${query.impressions}, CTR ${formatPercent(query.ctr)}, URL ${query.url ?? "à créer"}`).join("\n"),
    "",
    "Données GA4 :",
    `Sessions: ${payload.ga4.summary.sessions}, sessions organic: ${payload.ga4.organicSummary.sessions}, engagement: ${formatPercent(payload.ga4.summary.engagementRate)}, événements: ${payload.ga4.summary.eventCount}.`,
    "",
    "Opportunités :",
    payload.seoOpportunities.slice(0, 12).map((query) => `- ${query.query}: ${query.action}`).join("\n"),
    "",
    "Plan d’action :",
    buildActionPlanText(payload.actionPlan),
  ].join("\n");
}

function buildActionPlanText(items: SeoActionPlanItem[]) {
  return (["P1", "P2", "P3"] as const)
    .map((level) => {
      const title = level === "P1" ? "P1 — À faire maintenant" : level === "P2" ? "P2 — À faire cette semaine" : "P3 — À faire ce mois-ci";
      const lines = items
        .filter((item) => item.level === level)
        .map((item) => `- [${item.priority}] ${item.page}: ${item.problem} Recommandation: ${item.recommendation} Impact: ${item.estimatedImpact}. Effort: ${item.estimatedEffort}. Données: ${item.dataUsed.join(", ")}.`);
      return [title, ...lines].join("\n");
    })
    .join("\n\n");
}

function exportPdf(payload: SeoExportPayload, markdown: string) {
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) {
    downloadFile("rapport-seo-corsaimanager.html", buildPdfHtml(payload, markdown), "text/html;charset=utf-8");
    return;
  }
  popup.document.write(buildPdfHtml(payload, markdown));
  popup.document.close();
  popup.focus();
  popup.print();
}

function buildPdfHtml(payload: SeoExportPayload, markdown: string) {
  const escaped = escapeHtml(markdown);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport SEO CorsaiManager</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#111;line-height:1.5}h1{font-size:28px}h2{margin-top:28px;border-bottom:1px solid #ddd;padding-bottom:6px}pre{white-space:pre-wrap;font-family:Arial,sans-serif}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}.card{border:1px solid #ddd;border-radius:8px;padding:12px}.page-break{break-before:page}@media print{button{display:none}}}</style></head><body><h1>Rapport SEO CorsaiManager</h1><div class="summary"><div class="card">Score moyen<br><strong>${payload.summary.averageInternalScore}/100</strong></div><div class="card">Pages analysées<br><strong>${payload.summary.analyzedPages}</strong></div><div class="card">Opportunités<br><strong>${payload.summary.opportunitiesCount}</strong></div></div><pre>${escaped}</pre></body></html>`;
}

async function recordExport(type: string, payload: SeoExportPayload) {
  await fetch("/api/admin/seo-exports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type,
      pagesCount: payload.summary.analyzedPages,
      opportunitiesCount: payload.summary.opportunitiesCount,
      averageScore: payload.summary.averageInternalScore,
      actionPlan: payload.actionPlan,
    }),
  }).catch(() => undefined);
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyText(content: string) {
  await navigator.clipboard.writeText(content);
}

function statusLabel(type: string) {
  if (type === "markdown") return "Rapport Markdown exporté.";
  if (type === "json") return "Données JSON exportées.";
  if (type === "pdf") return "Export PDF ouvert dans le navigateur.";
  if (type === "chatgpt") return "Format ChatGPT copié.";
  return "Plan complet copié.";
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
