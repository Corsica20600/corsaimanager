import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildAdminSeoAudit } from "@/lib/seo/siteAudit";

export default async function AdminSeoAuditPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin");

  const report = buildAdminSeoAudit();
  const priorityPages = report.pages.filter((page) => page.globalScore < 75 || page.localHits > page.nationalHits);

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
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Pages prioritaires</h2>
        <div className="mt-4 grid gap-4">
          {priorityPages.slice(0, 12).map((page) => (
            <PageAuditCard key={page.path} page={page} />
          ))}
        </div>
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

function PageAuditCard({ page }: { page: ReturnType<typeof buildAdminSeoAudit>["pages"][number] }) {
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
        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
          {page.globalScore}/100
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {Object.entries(page.scores).map(([key, score]) => (
          <div key={key} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">{scoreLabel(key)}</p>
            <p className="mt-1 text-lg font-semibold text-zinc-100">{score}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Alertes</h3>
          <ul className="mt-2 space-y-2">
            {page.issues.map((issue) => (
              <li key={issue} className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-50">
                {issue}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">SEO proposé</h3>
          <div className="mt-2 space-y-2 text-sm text-zinc-300">
            <p><span className="text-zinc-500">Title:</span> {page.improvedSeo.title}</p>
            <p><span className="text-zinc-500">Description:</span> {page.improvedSeo.description}</p>
            <p><span className="text-zinc-500">H1:</span> {page.improvedSeo.h1}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function scoreLabel(key: string) {
  const labels: Record<string, string> = {
    metadata: "Metadata",
    structure: "Hn",
    content: "Contenu",
    internalLinks: "Maillage",
    nationalPositioning: "France",
    conversion: "CTA",
    offerClarity: "Offre",
  };
  return labels[key] ?? key;
}
