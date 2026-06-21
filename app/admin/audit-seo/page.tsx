import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getGoogleConnectionStatus, getSearchConsoleReport, type SearchConsoleMetric, type SearchPerformanceReport } from "@/lib/google/searchConsole";
import { buildAdminSeoAudit } from "@/lib/seo/siteAudit";

export default async function AdminSeoAuditPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin");

  const report = buildAdminSeoAudit();
  const [googleStatus, google28d, google3m] = await Promise.all([
    getGoogleConnectionStatus(),
    getSearchConsoleReport({ range: "28d" }),
    getSearchConsoleReport({ range: "3m" }),
  ]);
  const priorityPages = report.pages.filter((page) => page.globalScore < 100 || page.priority === "Critique" || page.priority === "Haute");
  const googleMetricsByPath = mapGoogleMetricsByPath(google28d.pages);
  const buckets = [
    { label: "Pages à 100 %", pages: report.pages.filter((page) => page.globalScore === 100), tone: "emerald" },
    { label: "Pages entre 80 et 99", pages: report.pages.filter((page) => page.globalScore >= 80 && page.globalScore < 100), tone: "cyan" },
    { label: "Pages entre 60 et 79", pages: report.pages.filter((page) => page.globalScore >= 60 && page.globalScore < 80), tone: "amber" },
    { label: "Pages sous 60", pages: report.pages.filter((page) => page.globalScore < 60), tone: "rose" },
  ];
  const roadmap = buildOptimizationRoadmap(report);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Audit SEO interne</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">
            Positionnement France entière
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
            Analyse des pages CorsaiManager pour détecter les contenus trop locaux, les metadata faibles,
            le maillage interne insuffisant et les opportunités SEO nationales.
          </p>
          <p className="mt-3 max-w-3xl rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-relaxed text-amber-50">
            Le score 100/100 indique une page optimisée selon les critères internes CorsaiManager.
            Il ne garantit pas une position Google.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:border-cyan-300/50 hover:text-cyan-200"
        >
          Retour admin
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Pages analysées" value={report.summary.analyzedPages} />
        <Stat label="Score moyen" value={report.summary.averageScore} suffix="/100" />
        <Stat label="Pages trop locales" value={report.summary.tooLocalPages} />
        <Stat label="Pages à optimiser" value={report.summary.pagesToOptimize} />
        <Stat label="Prioritaires" value={report.summary.priorityPages} />
      </section>

      <nav className="mt-8 flex flex-wrap gap-2">
        {[
          ["Audit interne", "#audit-interne"],
          ["Google Search Console", "#google-search-console"],
          ["Opportunités Google", "#opportunites-google"],
          ["Plan d'optimisation", "#plan-optimisation"],
        ].map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 transition hover:border-cyan-300/40 hover:text-cyan-100"
          >
            {label}
          </a>
        ))}
      </nav>

      <GoogleSearchConsolePanel status={googleStatus} report28d={google28d} report3m={google3m} />
      <GoogleOpportunitiesPanel report={google28d} />

      <section id="audit-interne" className="mt-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Pages à 100 %</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {buckets.map((bucket) => (
            <BucketCard key={bucket.label} label={bucket.label} pages={bucket.pages} tone={bucket.tone} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel title="Opportunités de contenu">
          <ul className="space-y-2">
            {report.opportunities.map((item) => (
              <li key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                {item}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Mots-clés nationaux à viser">
          <div className="flex flex-wrap gap-2">
            {report.targetKeywords.map((keyword) => (
              <span key={keyword} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                {keyword}
              </span>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Pages prioritaires</h2>
          <a
            href="#plan-optimisation"
            className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
          >
            Générer le plan d&apos;optimisation
          </a>
        </div>
        <div className="mt-4 grid gap-4">
          {priorityPages.slice(0, 12).map((page) => (
            <PageAuditCard key={page.path} page={page} googleMetric={googleMetricsByPath.get(page.path)} />
          ))}
        </div>
      </section>

      <section id="plan-optimisation" className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Feuille de route Objectif 100">
          <RoadmapGroup title="Corrections rapides" items={roadmap.quickFixes} />
          <RoadmapGroup title="Corrections contenu" items={roadmap.contentFixes} />
          <RoadmapGroup title="Corrections maillage interne" items={roadmap.internalLinks} />
          <RoadmapGroup title="Nouvelles pages à créer" items={roadmap.newPages} />
        </Panel>
        <Panel title="Grille de scoring 100 points">
          <div className="grid gap-2 text-sm text-zinc-300">
            {[
              ["Metadata", "15 pts"],
              ["Structure Hn", "15 pts"],
              ["Contenu", "20 pts"],
              ["Maillage interne", "15 pts"],
              ["Conversion / CTA", "10 pts"],
              ["Images / ALT", "10 pts"],
              ["Positionnement France entière", "10 pts"],
              ["Lisibilité", "5 pts"],
            ].map(([label, points]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>{label}</span>
                <span className="font-semibold text-cyan-100">{points}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Stat({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-100">
        {value}
        {suffix}
      </p>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
      <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function PageAuditCard({
  page,
  googleMetric,
}: {
  page: ReturnType<typeof buildAdminSeoAudit>["pages"][number];
  googleMetric?: SearchConsoleMetric;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={page.path} className="text-lg font-semibold text-cyan-100 transition hover:text-cyan-200">
            {page.path}
          </Link>
          <p className="mt-1 text-sm text-zinc-300">{page.title}</p>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-zinc-500">{page.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
            {page.globalScore}/100
          </span>
          <span className={priorityClass(page.priority)}>{page.priority}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-3">
        <Metric label="Score actuel" value={`${page.globalScore}/100`} />
        <Metric label="Objectif" value="100/100" />
        <Metric label="Écart restant" value={`${page.scoreGap} points`} />
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4 md:grid-cols-5">
        <Metric label="Clics Google" value={googleMetric ? String(googleMetric.clicks) : "-"} />
        <Metric label="Impressions" value={googleMetric ? String(googleMetric.impressions) : "-"} />
        <Metric label="CTR" value={googleMetric ? formatCtr(googleMetric.ctr) : "-"} />
        <Metric label="Position" value={googleMetric?.position ? googleMetric.position.toFixed(1) : "-"} />
        <Metric label="Potentiel SEO" value={googleMetric ? googlePotentialLabel(googleMetric) : "À connecter"} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(page.scores).map(([key, score]) => (
          <div key={key} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">{scoreLabel(key)}</p>
            <p className="mt-1 text-lg font-semibold text-zinc-100">{score}/{scoreMax(key)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Checklist Objectif 100</h3>
          <div className="mt-2 grid gap-2">
            {page.checklist.map((item) => (
              <div key={item.key} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-zinc-200">
                    {item.passed ? "Validé" : "À corriger"} - {item.label}
                  </span>
                  <span className="text-xs font-semibold text-cyan-100">
                    {item.points}/{item.maxPoints} pts
                  </span>
                </div>
                {!item.passed ? <p className="mt-1 text-xs leading-relaxed text-zinc-400">{item.recommendation}</p> : null}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Actions nécessaires pour atteindre 100</h3>
          <ul className="mt-2 space-y-2">
            {page.objectiveActions.length ? page.objectiveActions.map((action) => (
              <li key={`${action.action}-${action.points}`} className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-50">
                {action.action}: +{action.points} pts
              </li>
            )) : (
              <li className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
                Page à 100 selon la grille interne.
              </li>
            )}
          </ul>
          <h3 className="mt-4 text-sm font-semibold text-zinc-200">Recommandations IA orientées 100 %</h3>
          <div className="mt-2 space-y-2 text-sm text-zinc-300">
            <p><span className="text-zinc-500">Title:</span> {page.improvedSeo.title}</p>
            <p><span className="text-zinc-500">Description:</span> {page.improvedSeo.description}</p>
            <p><span className="text-zinc-500">H1:</span> {page.improvedSeo.h1}</p>
            <p><span className="text-zinc-500">CTA:</span> {page.improvedSeo.cta}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function GoogleSearchConsolePanel({
  status,
  report28d,
  report3m,
}: {
  status: Awaited<ReturnType<typeof getGoogleConnectionStatus>>;
  report28d: SearchPerformanceReport;
  report3m: SearchPerformanceReport;
}) {
  return (
    <section id="google-search-console" className="mt-8">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Google Search Console</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">Cockpit données Google</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
              Croisement des scores internes CorsaiManager avec les impressions, clics, CTR, positions et requêtes réelles.
            </p>
          </div>
          <Link
            href="/api/google/auth"
            className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
          >
            Connecter Google Search Console
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Statut connexion</p>
            <p className={status.connected ? "mt-2 text-lg font-semibold text-emerald-100" : "mt-2 text-lg font-semibold text-amber-100"}>
              {status.connected ? "Connecté" : "Non connecté"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Compte Google connecté: <span className="text-zinc-200">{status.connectedEmail ?? (status.connected ? "Connecté, email non disponible" : "Non connecté")}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Propriété Search Console détectée: <span className="text-zinc-200">{status.detectedSiteUrl ?? status.siteUrl ?? "GOOGLE_SEARCH_CONSOLE_SITE_URL manquant"}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Domaine surveillé: <span className="text-zinc-200">{status.watchedDomain ?? "Non configuré"}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Callback OAuth: <span className="text-zinc-200">{status.redirectUri}</span>
            </p>
            {status.redirectUriStatus !== "ok" ? (
              <p className="mt-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs leading-relaxed text-amber-50">
                Variable GOOGLE_REDIRECT_URI à vérifier sur Vercel. Valeur attendue: {status.expectedRedirectUri}
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Dernière synchronisation: <span className="text-zinc-200">{status.lastSyncedAt ? formatDateTime(status.lastSyncedAt) : "Jamais"}</span>
            </p>
            {status.error ? <p className="mt-2 text-sm text-amber-100">{status.error}</p> : null}
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              Scope actif: Search Console readonly. Le scope GA4 readonly est préparé pour une évolution ultérieure.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Clics 28 j" value={report28d.summary.clicks.toLocaleString("fr-FR")} />
            <MetricCard label="Impressions 28 j" value={report28d.summary.impressions.toLocaleString("fr-FR")} />
            <MetricCard label="CTR moyen" value={formatCtr(report28d.summary.ctr)} />
            <MetricCard label="Position moyenne" value={report28d.summary.position ? report28d.summary.position.toFixed(1) : "-"} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-4">
          <Metric label="Période 28 jours" value={`${report28d.startDate} → ${report28d.endDate}`} />
          <Metric label="Clics 3 mois" value={report3m.summary.clicks.toLocaleString("fr-FR")} />
          <Metric label="Impressions 3 mois" value={report3m.summary.impressions.toLocaleString("fr-FR")} />
          <Metric label="CTR 3 mois" value={formatCtr(report3m.summary.ctr)} />
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Clics</th>
                <th className="px-4 py-3">Impressions</th>
                <th className="px-4 py-3">CTR</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Opportunité détectée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {report28d.pages.slice(0, 12).map((page) => (
                <tr key={page.url} className="text-zinc-300">
                  <td className="max-w-md truncate px-4 py-3">{page.url}</td>
                  <td className="px-4 py-3">{page.clicks}</td>
                  <td className="px-4 py-3">{page.impressions}</td>
                  <td className="px-4 py-3">{formatCtr(page.ctr)}</td>
                  <td className="px-4 py-3">{page.position.toFixed(1)}</td>
                  <td className="px-4 py-3">{googlePotentialLabel(page)}</td>
                </tr>
              ))}
              {!report28d.pages.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-zinc-500">
                    Connectez Search Console pour afficher les performances par page.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function GoogleOpportunitiesPanel({ report }: { report: SearchPerformanceReport }) {
  const nearTop10 = report.opportunities.filter((item) => item.type === "near_top_10");
  const lowCtr = report.opportunities.filter((item) => item.type === "low_ctr");
  const needsContent = report.opportunities.filter((item) => item.type === "needs_content");
  const newPages = report.opportunities.filter((item) => item.type === "new_page");

  return (
    <section id="opportunites-google" className="mt-8 grid gap-6 lg:grid-cols-2">
      <Panel title="Opportunités Google">
        <RoadmapGroup title="Pages proches du top 10" items={nearTop10.map((item) => item.detail)} />
        <RoadmapGroup title="Requêtes avec impressions mais CTR faible" items={lowCtr.map((item) => item.detail)} />
        <RoadmapGroup title="Pages à renforcer" items={needsContent.map((item) => item.detail)} />
        <RoadmapGroup title="Nouvelles pages à créer" items={newPages.map((item) => item.detail)} />
      </Panel>
      <Panel title="Recommandations IA basées Google">
        <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
          <p>
            Les recommandations IA doivent maintenant croiser score interne, requêtes Search Console, CTR et position moyenne.
          </p>
          <p>
            Priorité: réécrire title/meta sur les pages à impressions fortes et CTR faible, renforcer les pages en positions 8 à 20,
            puis créer des pages dédiées pour les requêtes à impressions récurrentes sans page claire.
          </p>
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-cyan-50">
            Sorties attendues: title orienté CTR, meta description, sections à ajouter, FAQ issue des requêtes,
            liens internes et nouvelles pages à créer.
          </div>
        </div>
      </Panel>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function scoreLabel(key: string) {
  const labels: Record<string, string> = {
    metadata: "Metadata",
    structure: "Hn",
    content: "Contenu",
    internalLinks: "Maillage",
    conversion: "CTA",
    imagesAlt: "Images",
    nationalPositioning: "France",
    readability: "Lisibilité",
  };
  return labels[key] ?? key;
}

function scoreMax(key: string) {
  const max: Record<string, number> = {
    metadata: 15,
    structure: 15,
    content: 20,
    internalLinks: 15,
    conversion: 10,
    imagesAlt: 10,
    nationalPositioning: 10,
    readability: 5,
  };
  return max[key] ?? 100;
}

function BucketCard({
  label,
  pages,
  tone,
}: {
  label: string;
  pages: ReturnType<typeof buildAdminSeoAudit>["pages"];
  tone: string;
}) {
  const styles: Record<string, string> = {
    emerald: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    rose: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  };
  return (
    <article className={`rounded-2xl border p-5 ${styles[tone]}`}>
      <p className="text-sm">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{pages.length}</p>
      <div className="mt-3 space-y-1 text-xs">
        {pages.slice(0, 4).map((page) => (
          <p key={page.path} className="truncate">{page.path} - {page.globalScore}/100</p>
        ))}
        {pages.length > 4 ? <p>+{pages.length - 4} autres pages</p> : null}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function priorityClass(priority: string) {
  const styles: Record<string, string> = {
    Critique: "rounded-full border border-rose-300/30 bg-rose-300/10 px-3 py-1 text-xs font-semibold text-rose-100",
    Haute: "rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100",
    Moyenne: "rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100",
    Faible: "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300",
  };
  return styles[priority] ?? styles.Faible;
}

function RoadmapGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildOptimizationRoadmap(report: ReturnType<typeof buildAdminSeoAudit>) {
  const pages = report.pages;
  const missingMeta = pages.filter((page) => page.checklist.some((item) => item.key === "meta" && !item.passed)).length;
  const lowContent = pages.filter((page) => page.checklist.some((item) => item.key === "content" && !item.passed)).length;
  const lowLinks = pages.filter((page) => page.checklist.some((item) => item.key === "links" && !item.passed)).length;
  const missingFaq = pages.filter((page) => page.checklist.some((item) => item.key === "faq" && !item.passed)).length;

  return {
    quickFixes: [
      `Réécrire les meta descriptions des ${missingMeta} pages concernées.`,
      "Ajouter un CTA clair au-dessus de la ligne de flottaison sur les pages commerciales.",
      "Vérifier les ALT des images utiles sur les pages avec captures ou visuels produit.",
    ],
    contentFixes: [
      `Renforcer le contenu des ${lowContent} pages sous le seuil interne.`,
      `Ajouter une FAQ SEO sur ${missingFaq} pages prioritaires.`,
      "Ajouter des paragraphes cas d'usage, ROI et méthode CorsaiManager sur les pages commerciales.",
    ],
    internalLinks: [
      `Ajouter au moins 5 liens internes sur les ${lowLinks} pages concernées.`,
      "Relier chaque article stratégique à /consultant-ia-pme, /audit-ia et une page service.",
      "Créer des liens croisés entre CRM IA, automatisation PME, assistant téléphonique IA et applications métier.",
    ],
    newPages: report.opportunities,
  };
}

function mapGoogleMetricsByPath(metrics: SearchConsoleMetric[]) {
  const map = new Map<string, SearchConsoleMetric>();

  for (const metric of metrics) {
    if (!metric.url) continue;
    try {
      const pathname = new URL(metric.url).pathname.replace(/\/$/, "") || "/";
      map.set(pathname, metric);
    } catch {
      const pathname = metric.url.replace(/^https?:\/\/[^/]+/i, "").replace(/\/$/, "") || "/";
      map.set(pathname, metric);
    }
  }

  return map;
}

function googlePotentialLabel(metric: SearchConsoleMetric) {
  if (metric.impressions === 0) return "Indexation / contenu";
  if (metric.impressions >= 250 && metric.ctr < 0.02) return "CTR à améliorer";
  if (metric.position >= 8 && metric.position <= 20) return "Proche top 10";
  if (metric.position > 20 && metric.position <= 50) return "Contenu à renforcer";
  return "Suivi";
}

function formatCtr(ctr: number) {
  return `${(ctr * 100).toFixed(1)}%`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}
