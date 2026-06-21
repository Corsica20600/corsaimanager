import type { Metadata } from "next";
import Link from "next/link";
import { AuditForm } from "@/components/seo-audit/AuditForm";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";

export const metadata: Metadata = {
  title: "Audit SEO IA interne",
  description:
    "Analyse interne des pages CorsaiManager pour améliorer le référencement national, le contenu, le maillage interne et la conversion.",
};

const analyzedItems = [
  "Title, meta description et coherence avec l'intention de recherche",
  "H1, H2, profondeur du contenu et lisibilite",
  "Positionnement France entière et pertinence nationale",
  "Maillage interne vers les pages IA, CRM, automatisation et applications metier",
  "Clarté de l'offre, conversion et prochaine action",
  "Proposition de balises et plan H2 ameliores",
];

export default function SeoAuditPage() {
  return (
    <div className="pb-20">
      {/* TODO: Prévoir déplacement futur vers /admin/seo pour version interne avancée. */}
      <section className="pt-16 sm:pt-20">
        <Container>
          <div className="max-w-4xl">
            <Pill>Audit SEO IA</Pill>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              Audit SEO IA interne pour CorsaiManager
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Analysez une page de corsaimanager.com et obtenez des recommandations concretes pour ameliorer
              le referencement national, la clarte de l&apos;offre, le maillage interne et les conversions.
              Basé en Corse, CorsaiManager accompagne les PME partout en France.
            </p>
          </div>

          <div className="mt-10">
            <AuditForm />
          </div>
        </Container>
      </section>

      <Container>
        <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
                Ce que CorsaiManager analyse
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
                L&apos;objectif n&apos;est pas de produire un rapport decoratif. L&apos;outil repere les leviers qui peuvent aider
                une page CorsaiManager a mieux se positionner sur les recherches France entière et a convertir
                plus clairement les visiteurs qualifies.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {analyzedItems.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-zinc-950/35 px-4 py-3 text-sm leading-relaxed text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-cyan-300/15 to-blue-400/10 p-6 sm:p-8">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Prioriser les optimisations internes
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Pour une vue globale des pages du site, utilisez l&apos;audit SEO interne de l&apos;espace admin.
          </p>
          <Link
            href="/admin/audit-seo"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
          >
            Ouvrir l&apos;audit SEO interne
          </Link>
        </section>
      </Container>
    </div>
  );
}
