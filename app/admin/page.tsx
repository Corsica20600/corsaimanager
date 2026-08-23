import Link from "next/link";
import { adminLoginAction, adminLogoutAction } from "@/app/admin/actions";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { formatBillingMoney } from "@/lib/billing/format";
import { getCommunitySummary } from "@/lib/community-ai";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const modules = [
  {
    title: "CRM prospection",
    description: "Prospects, relances, pipeline commercial et fiches clients.",
    href: "/crm",
  },
  {
    title: "Agent review",
    description: "Validation humaine des remontées OpenClaw avant envoi.",
    href: "/crm/agent-review",
  },
  {
    title: "Ventes",
    description: "Devis, factures, paiements, abonnements et Stripe Billing.",
    href: "/ventes",
  },
  {
    title: "Achats",
    description: "Factures fournisseurs détectées par IA dans les boîtes mail.",
    href: "/ventes/achats",
  },
  {
    title: "Audit SEO",
    description: "Audit interne, exports et suivi Search Console.",
    href: "/admin/audit-seo",
  },
  {
    title: "Site public",
    description: "Retour au site CorsaiManager et aux pages visibles.",
    href: "/",
  },
];

export default async function AdminPage({ searchParams }: Props) {
  const isAuth = await isAdminAuthenticated();
  const params = await searchParams;

  if (!isAuth) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <section className="grid min-h-[70vh] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Admin CorsaiManager</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              Cockpit privé pour piloter l&apos;activité, l&apos;IA et les ventes.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300">
              Un point d&apos;entrée unique pour le CRM, OpenClaw, les factures, les achats fournisseurs, Stripe et les outils de pilotage.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <h2 className="text-xl font-semibold text-zinc-100">Connexion administrateur</h2>
            {params.error ? (
              <p className="mt-3 rounded-xl border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-sm text-rose-200">
                Mot de passe incorrect.
              </p>
            ) : null}
            <form action={adminLoginAction} className="mt-5 grid gap-3">
              <input
                name="password"
                type="password"
                placeholder="Mot de passe admin"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
              >
                Ouvrir le cockpit
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  const [data, community] = await Promise.all([getAdminDashboardData(), getCommunitySummary()]);
  const health = [
    ["SMTP", data.integrations.env.smtp],
    ["OpenAI", data.integrations.env.openai],
    ["Blob", data.integrations.env.blob],
    ["Cron", data.integrations.env.cron],
    ["Stripe", data.integrations.env.stripe],
    ["Google", data.integrations.env.analytics],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Cockpit CorsaiManager</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-100">Administration centrale</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300">
            Vue transverse pour CorsaiManager, Sentieru et Traknio : prospection, validation IA, revenus, achats et intégrations.
          </p>
        </div>
        <form action={adminLogoutAction}>
          <button className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-zinc-200 hover:border-cyan-300/50">
            Déconnexion
          </button>
        </form>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Prospects CRM" value={data.crm.summary.total} hint={`${data.crm.summary.relances_aujourdhui} relance(s) aujourd'hui`} />
        <MetricCard label="À valider OpenClaw" value={data.integrations.openClawPending} hint="Prospects en attente ou à enrichir" />
        <MetricCard label="CA facturé mois" value={formatBillingMoney(data.billing.invoiced_this_month_cents, "EUR")} hint={`${data.billing.overdue_invoices} facture(s) en retard`} />
        <MetricCard label="Achats à valider" value={data.purchases.needs_review} hint={formatBillingMoney(data.purchases.month_total_cents, "EUR")} />
      </section>

      <section className="mt-8 rounded-2xl border border-violet-300/20 bg-violet-300/[0.04] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-200/80">Community Manager</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-100">Pilotage éditorial CorsaiManager</h2>
            <p className="mt-2 text-sm text-zinc-400">Community AI reste l&apos;espace de travail complet. Le CRM affiche seulement l&apos;essentiel.</p>
          </div>
          <a href={community.url} target="_blank" rel="noreferrer" className="rounded-full border border-violet-300/40 bg-violet-300/10 px-4 py-2 text-sm font-semibold text-violet-100 hover:border-violet-200 hover:bg-violet-300/20">Ouvrir Community Manager</a>
        </div>
        {community.connected ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <CommunityMetric label="Publications ce mois" value={community.publishedThisMonth} />
            <CommunityMetric label="Programmées" value={community.scheduled} />
            <CommunityMetric label="Contenus à valider" value={community.awaitingReview} />
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-amber-200/20 bg-amber-200/5 px-4 py-3 text-sm text-amber-100">Connexion à terminer : {community.reason}</p>
        )}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="group rounded-2xl border border-white/10 bg-zinc-900/60 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/[0.05]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-zinc-100">{module.title}</h2>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">Ouvrir</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{module.description}</p>
          </Link>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-semibold text-zinc-100">Priorités du jour</h2>
          <div className="mt-4 grid gap-3">
            <Priority label="Valider les emails OpenClaw" value={`${data.integrations.openClawPending} élément(s)`} href="/crm/agent-review" />
            <Priority label="Contrôler les achats fournisseurs" value={`${data.purchases.needs_review} facture(s)`} href="/ventes/achats?status=NEEDS_REVIEW" />
            <Priority label="Suivre les impayés" value={`${data.billing.overdue_invoices} facture(s)`} href="/ventes/factures?payment=overdue" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-semibold text-zinc-100">Santé des connexions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {health.map(([label, ok]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm text-zinc-400">{label}</p>
                <p className={`mt-1 text-sm font-semibold ${ok ? "text-emerald-200" : "text-amber-200"}`}>
                  {ok ? "Configuré" : "À vérifier"}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Le cron achats tourne en quotidien tant que le projet Vercel reste en Hobby. Passage horaire prévu après migration Pro.
          </p>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-100">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </article>
  );
}

function CommunityMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-4"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-3xl font-semibold text-zinc-100">{value}</p></div>;
}

function Priority({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-cyan-300/40">
      <span className="text-zinc-200">{label}</span>
      <span className="text-cyan-100">{value}</span>
    </Link>
  );
}
