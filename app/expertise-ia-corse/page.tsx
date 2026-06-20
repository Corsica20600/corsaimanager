import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck, Network, Sparkles } from "lucide-react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";

export const metadata: Metadata = {
  title: "Solutions IA pour PME françaises | CorsaiManager",
  description:
    "Découvrez les solutions IA de CorsaiManager pour PME françaises : automatisation IA, CRM intelligent, assistant IA, applications métier et logiciels sur mesure.",
  alternates: {
    canonical: "https://corsaimanager.com/services",
  },
};

const services = [
  {
    href: "/consultant-ia-pme",
    label: "Consultant IA PME",
    text: "Une vision générale de l'intelligence artificielle pour les PME françaises qui veulent identifier les premiers cas d'usage utiles.",
  },
  {
    href: "/automatisation-pme",
    label: "Automatisation IA PME",
    text: "Des workflows pour réduire les tâches répétitives, fiabiliser les relances et fluidifier l'exécution quotidienne.",
  },
  {
    href: "/crm-ia-pme",
    label: "CRM IA PME",
    text: "Un suivi commercial augmenté par l'IA pour prioriser les prospects, automatiser les relances et mieux piloter le pipeline.",
  },
  {
    href: "/logiciel-metier-sur-mesure",
    label: "Logiciel métier sur mesure",
    text: "Des outils adaptés à vos processus lorsque les logiciels standards imposent trop de contournements.",
  },
  {
    href: "/assistant-ia-telephone",
    label: "Assistant IA pour PME",
    text: "Un assistant IA pour capter les appels, qualifier les demandes et transmettre des résumés exploitables.",
  },
  {
    href: "/applications-metier",
    label: "Applications métier",
    text: "Des applications web modernes pour centraliser vos données, automatiser vos opérations et accompagner vos équipes.",
  },
];

const benefits = [
  "Clarifier les services IA disponibles pour les PME françaises.",
  "Relier les pages commerciales, administratives et métier autour d'une même expertise.",
  "Aider les visiteurs à choisir le bon point d'entrée selon leur besoin.",
  "Renforcer le maillage interne sans alourdir le menu principal.",
];

export default function ExpertiseIACorsePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "CorsaiManager",
    url: "https://corsaimanager.com",
    areaServed: "France",
    serviceType: "Automatisation IA, consultant IA, applications métier",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Biguglia",
      addressRegion: "Corse",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative overflow-hidden pb-24">
        <BackgroundFx />
        <Container>
          <section className="pt-16 sm:pt-20">
            <AnimatedReveal>
              <Pill>Solutions IA PME</Pill>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
                Solutions IA pour PME françaises
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                Cette page rassemble les principales expertises CorsaiManager pour intégrer
                l&apos;intelligence artificielle dans une PME française : automatisation, CRM IA,
                assistants, applications métier et logiciels sur mesure.
              </p>
            </AnimatedReveal>
          </section>

          <section className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit, index) => (
              <AnimatedReveal key={benefit} delay={index * 0.05}>
                <article className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
                  <CircleCheck className="text-cyan-300" size={18} />
                  <p className="mt-3 text-sm leading-relaxed text-zinc-200">{benefit}</p>
                </article>
              </AnimatedReveal>
            ))}
          </section>

          <section className="mt-16 sm:mt-20">
            <AnimatedReveal>
              <div className="flex items-center gap-2 text-cyan-200">
                <Network size={16} />
                <span className="text-xs uppercase tracking-[0.16em]">Services liés</span>
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Tous les services IA CorsaiManager
              </h2>
            </AnimatedReveal>
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service, index) => (
                <AnimatedReveal key={service.href} delay={index * 0.05}>
                  <Link
                    href={service.href}
                    className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl font-medium text-zinc-100">{service.label}</h3>
                      <ArrowRight
                        className="shrink-0 text-cyan-300 transition group-hover:translate-x-0.5"
                        size={17}
                      />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">{service.text}</p>
                  </Link>
                </AnimatedReveal>
              ))}
            </div>
          </section>

          <section className="mt-16 sm:mt-20">
            <AnimatedReveal>
              <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center sm:p-12">
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                  Choisir le bon point d&apos;entrée IA
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
                  Si vous hésitez entre CRM, automatisation, assistant IA ou application métier,
                  un échange permet de prioriser le parcours le plus rentable.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
                  >
                    Contacter CorsaiManager
                  </Link>
                  <Link
                    href="/audit-ia"
                    className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
                  >
                    Demander un audit IA
                  </Link>
                </div>
              </div>
            </AnimatedReveal>
          </section>
        </Container>
      </div>
    </>
  );
}

function BackgroundFx() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[7%] top-20 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute right-[8%] top-40 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute bottom-16 left-[35%] h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.12]" />
      <Sparkles className="absolute left-[12%] top-[34%] text-cyan-300/14" size={72} />
    </div>
  );
}
