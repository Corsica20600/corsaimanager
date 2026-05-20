import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getLeadsStats } from "@/lib/leads-repository";
import { adminLoginAction } from "@/app/admin/actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const isAuth = await isAdminAuthenticated();
  if (isAuth) {
    redirect("/admin/leads");
  }
  const params = await searchParams;

  const stats = await getLeadsStats();

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Dashboard CorsaiManager</h1>
      <p className="mt-2 text-zinc-400">Accès privé administrateur</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total leads" value={stats.total} />
        <StatCard label="Nouveaux leads" value={stats.new_count} />
        <StatCard label="Leads chauds" value={stats.hot_count} />
        <StatCard label="Leads traités" value={stats.treated_count} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur">
          <h2 className="text-xl font-medium text-zinc-100">Connexion admin</h2>
          {params.error ? (
            <p className="mt-3 rounded-xl border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-sm text-rose-200">
              Mot de passe incorrect.
            </p>
          ) : null}
          <form action={adminLoginAction} className="mt-4 space-y-3">
            <input
              name="password"
              type="password"
              placeholder="Mot de passe admin"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
            >
              Ouvrir le dashboard
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur">
          <h2 className="text-xl font-medium text-zinc-100">Raccourci</h2>
          <p className="mt-2 text-sm text-zinc-300">Après connexion, accédez directement à la liste des leads.</p>
          <Link
            href="/admin/leads"
            className="mt-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-200/60"
          >
            Aller vers /admin/leads
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
    </article>
  );
}
