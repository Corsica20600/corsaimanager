import Link from "next/link";
import { SalesClientHint, SalesEmptyState } from "@/components/billing/SalesEmptyState";
import { billingPdfEngine } from "@/lib/billing/pdf";

const metrics = [
  ["CA encaissé du mois", "0 €"],
  ["CA facturé du mois", "0 €"],
  ["Reste à encaisser", "0 €"],
  ["Factures en retard", "0"],
  ["Devis en attente", "0"],
  ["MRR", "0 €"],
  ["ARR", "0 €"],
  ["Paiements échoués", "0"],
];

export default function SalesDashboardPage() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
          </article>
        ))}
      </section>

      <SalesEmptyState
        title="Fondations du module ventes prêtes à être appliquées"
        description="La Phase 1 prépare les tables, les calculs monétaires, la numérotation, l'accès admin, les dépendances Stripe/PDF et la navigation. Les données réelles resteront vides tant que le script SQL n'est pas appliqué sur Neon."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/ventes/catalogue" className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-2.5 text-sm font-semibold text-zinc-950">
            Voir le catalogue
          </Link>
          <Link href="/ventes/parametres" className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-zinc-100 hover:border-cyan-300/60">
            Paramètres
          </Link>
        </div>
      </SalesEmptyState>

      <div className="grid gap-5 lg:grid-cols-2">
        <SalesClientHint />
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-sm leading-relaxed text-zinc-300">
          <p className="font-medium text-zinc-100">PDF choisi</p>
          <p className="mt-2">
            {billingPdfEngine.packageName} : {billingPdfEngine.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
