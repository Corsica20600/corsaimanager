import Link from "next/link";
import type { ReactNode } from "react";

export function SalesEmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Phase 1</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{description}</p>
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </section>
  );
}

export function SalesClientHint() {
  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm leading-relaxed text-zinc-200">
      Les documents de vente seront reliés à <strong>crm_prospects.id</strong>, uniquement pour les prospects au statut{" "}
      <strong>client</strong>. Aucune table client séparée n&apos;est créée pendant cette phase.
    </div>
  );
}

export function SalesBackLink() {
  return (
    <Link href="/ventes" className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200 hover:text-cyan-100">
      Retour au tableau de bord ventes
    </Link>
  );
}
