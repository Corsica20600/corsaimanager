import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminSeoAuditPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin");

  const aiTeamUrl = process.env.AI_TEAM_APP_URL ?? "https://ai-team-wine.vercel.app";
  const sophieUrl = `${aiTeamUrl.replace(/\/$/, "")}/agents/sophie`;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <div className="rounded-3xl border border-cyan-300/20 bg-zinc-950/70 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">
          <Sparkles size={17} />
          Module SEO transféré
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
          Sophie pilote maintenant l&apos;audit SEO dans AI-Team
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
          L&apos;ancien module SEO de CorsaiManager a été extrait pour vivre dans Sophie.
          CorsaiManager garde son rôle de site client et de CRM, tandis qu&apos;AI-Team
          centralise l&apos;audit, Search Console, GA4, les recommandations et la validation humaine.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            ["Audit SEO", "Lecture et scoring des pages depuis Sophie."],
            ["Google", "Connexion Search Console et GA4 côté AI-Team."],
            ["Validation", "Aucune publication automatique sans accord humain."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-zinc-100">{title}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={sophieUrl}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200"
          >
            Ouvrir Sophie SEO
            <ArrowRight size={17} />
          </a>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
          >
            <ShieldCheck size={17} />
            Retour admin
          </Link>
        </div>
      </div>
    </div>
  );
}
