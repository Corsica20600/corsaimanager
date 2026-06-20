import type { Metadata } from "next";
import Link from "next/link";
import { AuditForm } from "@/components/seo-audit/AuditForm";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";

export const metadata: Metadata = {
  title: "Audit SEO IA pour PME en France | CorsaiManager",
  description:
    "Analysez votre page avec un audit SEO alimente par l'IA : contenu, structure, SEO local, maillage interne et conversion.",
};

const analyzedItems = [
  "Title, meta description et coherence avec l'intention de recherche",
  "H1, H2, profondeur du contenu et lisibilite",
  "Signaux SEO France: PME, TPE, consultant IA, automatisation, CRM IA",
  "Maillage interne vers les pages IA, CRM, automatisation et applications metier",
  "CTA, conversion et clarté de la prochaine action",
  "Proposition de balises et plan H2 ameliores",
];

export default function SeoAuditPage() {
  return (
    <div className="pb-20">
      <section className="pt-16 sm:pt-20">
        <Container>
          <div className="max-w-4xl">
            <Pill>Audit SEO IA</Pill>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              Audit SEO IA pour les PME françaises
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Analysez une page de votre site et obtenez des recommandations concretes pour ameliorer votre
              visibilite, votre contenu et vos conversions.
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
                une page B2B locale a mieux se positionner et a convertir plus clairement les visiteurs qualifies.
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
            Vous voulez un audit complet de votre site ?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Demandez un diagnostic IA CorsaiManager pour identifier vos meilleures opportunites SEO, contenu,
            automatisation et conversion.
          </p>
          <Link
            href="/audit-ia"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
          >
            Demandez un diagnostic IA
          </Link>
        </section>
      </Container>
    </div>
  );
}
