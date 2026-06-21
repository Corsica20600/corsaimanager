"use client";

export default function CrmError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-rose-200/70">CRM</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Impossible de charger le CRM</h1>
        <p className="mt-3 text-sm text-rose-100/80">{error.message || "Une erreur est survenue pendant le chargement."}</p>
        <button
          onClick={reset}
          className="mt-5 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-2.5 text-sm font-semibold text-zinc-950"
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}

