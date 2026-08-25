import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import type { BusinessPageConfig } from "@/lib/business-pages";

const internalLinks = [
  { href: "/", label: "Accueil" },
  { href: "/agence-ia-france", label: "Agence IA spécialisée PME" },
  { href: "/transformation-digitale-pme", label: "Transformation digitale PME" },
  { href: "/services", label: "Services" },
  { href: "/audit-ia", label: "Audit IA" },
  { href: "/crm-ia-pme", label: "CRM IA PME" },
  { href: "/assistant-ia-telephone", label: "Assistant IA téléphone" },
  { href: "/automatisation-entreprise", label: "Automatisation entreprise" },
];

const localLinksBySlug: Record<string, { href: string; label: string; text: string }> = {
  "/crm-ia-pme": {
    href: "/crm-ia-corse",
    label: "CRM IA en Corse",
    text: "Voir aussi la page locale dédiée aux PME corses.",
  },
  "/assistant-ia-telephone": {
    href: "/assistant-ia-bastia",
    label: "Assistant IA à Bastia",
    text: "Voir aussi la déclinaison locale pour Bastia et la Corse.",
  },
  "/automatisation-entreprise": {
    href: "/automatisation-ia-corse",
    label: "Automatisation IA en Corse",
    text: "Voir aussi la page locale dédiée aux entreprises corses.",
  },
  "/applications-metier": {
    href: "/application-metier-corse",
    label: "Application métier en Corse",
    text: "Voir aussi la page locale dédiée aux PME corses.",
  },
};

const methodSteps = [
  {
    title: "1. Cadrage du besoin",
    text: "Nous clarifions le contexte, les objectifs, les contraintes, les outils existants et les indicateurs qui permettront de mesurer le succès. Cette étape évite de partir sur une solution trop large ou mal alignée avec les priorités métier.",
  },
  {
    title: "2. Analyse des processus",
    text: "Les tâches, données, échanges et points de friction sont cartographiés. L'objectif est d'identifier les moments où une automatisation, un CRM IA ou un assistant peut réduire l'effort humain sans perdre le contrôle.",
  },
  {
    title: "3. Priorisation ROI",
    text: "Chaque idée est évaluée selon l'impact business, la facilité de mise en place, la qualité des données disponibles et le risque opérationnel. Les actions rapides sont séparées des chantiers plus structurants.",
  },
  {
    title: "4. Prototype ou workflow pilote",
    text: "Un premier périmètre est créé pour valider l'usage réel. Cette phase permet de tester la solution avec les équipes, d'ajuster les règles et de vérifier que le gain est visible dans le quotidien.",
  },
  {
    title: "5. Déploiement progressif",
    text: "La solution est déployée étape par étape avec documentation, formation légère et points de contrôle. Les validations humaines sont prévues lorsque les actions sont sensibles ou commerciales.",
  },
  {
    title: "6. Optimisation continue",
    text: "Après mise en place, les indicateurs sont suivis: temps gagné, taux de réponse, relances effectuées, conversions, qualité de suivi et satisfaction des équipes. L'IA devient alors un levier d'amélioration continue.",
  },
];

const useCases = [
  "Qualification automatique des demandes entrantes pour distinguer les prospects chauds, les demandes simples et les sujets à traiter rapidement.",
  "Relances commerciales structurées après un devis, un rendez-vous, un appel ou une demande de renseignement.",
  "Centralisation des informations clients afin que chaque membre de l'équipe retrouve le contexte, l'historique et la prochaine action.",
  "Création de résumés, emails, tâches ou notifications pour réduire la saisie manuelle et éviter les oublis.",
  "Suivi des indicateurs clés: demandes reçues, délais de réponse, opportunités ouvertes, relances effectuées et conversions.",
  "Connexion entre formulaires, CRM, téléphone, tableurs, outils métier et tableaux de bord pour créer un parcours plus fluide.",
];

export function BusinessSeoPage({
  config,
  children,
}: {
  config: BusinessPageConfig;
  children?: ReactNode;
}) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faq.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: config.h1,
    provider: {
      "@type": "Organization",
      name: "CorsaiManager",
      url: "https://www.corsaimanager.com",
    },
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    serviceType: config.badge,
    url: `https://www.corsaimanager.com${config.slug}`,
  };

  return (
    <main className="pb-24 pt-10">
      <Hero config={config} />
      <IntroSection title="Introduction claire" paragraphs={config.intro} />
      <ListSection title={config.problemTitle} eyebrow="Problème client" items={config.problems} />
      <IntroSection title={config.solutionTitle} eyebrow="Solution CorsaiManager" paragraphs={config.solution} />
      <ListSection title={config.benefitsTitle} eyebrow="Bénéfices concrets" items={config.benefits} />
      <UseCasesSection />
      <IntroSection title={config.clientCaseTitle} eyebrow="Cas client" paragraphs={config.clientCase} />
      <MethodSection />
      <LocalContextLink config={config} />
      <InternalLinksSection />
      <FaqSection items={config.faq} />
      <FinalCta config={config}>{children}</FinalCta>
      {[faqSchema, serviceSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </main>
  );
}

function LocalContextLink({ config }: { config: BusinessPageConfig }) {
  const localLink = localLinksBySlug[config.slug];
  if (!localLink) return null;

  return (
    <section className="py-6">
      <Container>
        <Link
          href={localLink.href}
          className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-zinc-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]"
        >
          <span className="font-semibold text-cyan-100">{localLink.label}</span>
          <span className="ml-2">{localLink.text}</span>
        </Link>
      </Container>
    </section>
  );
}

function Hero({ config }: { config: BusinessPageConfig }) {
  return (
    <section>
      <Container>
        <div className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Pill>{config.badge}</Pill>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              {config.h1}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300">
              {config.intro[0]}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit-ia#audit-request"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
              >
                Demander un audit IA
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
              >
                Voir les services
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Objectif business</p>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Transformer une intention SEO en action commerciale: comprendre le problème, montrer la méthode,
              rassurer le prospect et proposer un diagnostic clair.
            </p>
            <div className="mt-6 grid gap-3">
              {internalLinks.slice(0, 6).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.08]"
                >
                  {link.label}
                  <ArrowRight size={15} className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function IntroSection({
  eyebrow,
  title,
  paragraphs,
}: {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
}) {
  return (
    <section className="py-10">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            {eyebrow ? <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</p> : null}
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{title}</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="mb-4 text-base leading-relaxed text-zinc-300 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function ListSection({ eyebrow, title, items }: { eyebrow: string; title: string; items: string[] }) {
  return (
    <section className="py-10">
      <Container>
        <div className="mb-8 max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-zinc-300">
              <CheckCircle2 className="mb-4 text-cyan-300" size={20} />
              {item}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function UseCasesSection() {
  return (
    <ListSection
      eyebrow="Cas d'usage PME"
      title="Cas d'usage concrets pour PME"
      items={useCases}
    />
  );
}

function MethodSection() {
  return (
    <ListSection
      eyebrow="Méthode de mise en place"
      title="Une méthode progressive pour déployer sans complexifier"
      items={methodSteps.map((step) => `${step.title} — ${step.text}`)}
    />
  );
}

function InternalLinksSection() {
  return (
    <section className="py-10">
      <Container>
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Maillage interne</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Continuer votre parcours IA
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {internalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/50 hover:text-cyan-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function FaqSection({ items }: { items: BusinessPageConfig["faq"] }) {
  return (
    <section className="py-10">
      <Container>
        <div className="mb-8 max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">FAQ SEO</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Questions fréquentes
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.question} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
              <h3 className="text-lg font-semibold text-zinc-100">{item.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.answer}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FinalCta({
  config,
  children,
}: {
  config: BusinessPageConfig;
  children?: ReactNode;
}) {
  return (
    <section className="py-10">
      <Container>
        <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{config.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-300">{config.ctaText}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/audit-ia#audit-request"
              className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
            >
              Demander un audit IA
            </Link>
            <Link
              href="/services"
              className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Voir les services
            </Link>
          </div>
          {children ? <div className="mt-10 text-left">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
