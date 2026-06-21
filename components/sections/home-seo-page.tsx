import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Bot, Briefcase, CheckCircle2, Headphones, Layers, PhoneCall, Workflow } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";

const faqItems = [
  {
    question: "Qu'est-ce que l'automatisation IA pour PME ?",
    answer:
      "L'automatisation IA consiste à confier à des assistants, workflows et applications intelligentes les tâches répétitives qui ralentissent une PME: relances, qualification de demandes, suivi commercial, génération de documents, reporting ou synchronisation d'outils.",
  },
  {
    question: "Une PME peut-elle utiliser l'IA sans équipe technique interne ?",
    answer:
      "Oui. CorsaiManager conçoit des solutions simples à piloter, documentées et adaptées aux équipes existantes. L'objectif n'est pas de complexifier l'organisation, mais de créer des outils utiles, mesurables et faciles à adopter.",
  },
  {
    question: "Quelle différence entre un CRM classique et un CRM IA ?",
    answer:
      "Un CRM classique stocke les informations. Un CRM IA aide à décider quoi faire ensuite: priorisation des prospects, relances automatiques, résumés d'échanges, détection des opportunités et suivi commercial plus régulier.",
  },
  {
    question: "À quoi sert un audit IA pour une entreprise ?",
    answer:
      "L'audit IA identifie les tâches à automatiser, les outils à connecter, les risques à éviter et les premiers gains possibles. Il permet de prioriser un plan d'action réaliste avant de développer une solution.",
  },
  {
    question: "Quels processus peut-on automatiser avec l'IA ?",
    answer:
      "Les processus les plus fréquents sont la qualification de leads, les relances commerciales, la création de devis, le traitement de demandes clients, la gestion documentaire, les rappels internes et le reporting d'activité.",
  },
  {
    question: "CorsaiManager intervient-il seulement en Corse ?",
    answer:
      "Non. CorsaiManager est basé en Corse, mais accompagne les PME partout en France. Les audits, ateliers, développements et suivis peuvent être réalisés à distance ou sur site selon le projet.",
  },
  {
    question: "Combien de temps faut-il pour lancer une première automatisation ?",
    answer:
      "Un premier workflow utile peut souvent être cadré en quelques jours puis testé rapidement. Les applications métier plus complètes demandent un cadrage plus poussé, avec priorisation des fonctionnalités et déploiement progressif.",
  },
  {
    question: "Comment mesurer le retour sur investissement d'un projet IA ?",
    answer:
      "Le ROI se mesure avec des indicateurs simples: temps gagné, taux de réponse, nombre de relances traitées, opportunités mieux suivies, réduction des erreurs, satisfaction client et chiffre d'affaires mieux piloté.",
  },
];

const serviceLinks = [
  { href: "/audit-ia", title: "Audit IA", icon: Bot },
  { href: "/crm-ia-pme", title: "CRM IA", icon: Briefcase },
  { href: "/assistant-ia-telephone", title: "Assistant téléphonique IA", icon: PhoneCall },
  { href: "/applications-metier", title: "Applications métier", icon: Layers },
  { href: "/automatisation-entreprise", title: "Automatisation des processus", icon: Workflow },
];

export function HomeSeoPage() {
  return (
    <main className="pb-24 pt-8 sm:pt-12">
      <HeroSection />
      <WhyAiSection />
      <AuditSection />
      <CrmSection />
      <AssistantSection />
      <ApplicationsSection />
      <AutomationSection />
      <UseCasesSection />
      <InternalLinksSection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section>
      <Container>
        <div className="grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <Pill>IA concrète pour PME en France</Pill>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Automatisation IA, CRM intelligent et applications métier pour PME
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300">
              CorsaiManager aide les PME françaises à transformer leurs processus avec l&apos;intelligence artificielle:
              automatisation commerciale, CRM IA, assistant téléphonique IA, applications métier sur mesure et workflows
              connectés. L&apos;objectif est simple: gagner du temps, mieux suivre les prospects, réduire les tâches répétitives
              et créer des outils réellement utiles aux équipes.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-400">
              Basé en Corse, CorsaiManager accompagne les PME partout en France avec une approche pragmatique:
              audit, priorisation, prototype, déploiement et amélioration continue. Chaque projet part d&apos;un problème
              métier concret, pas d&apos;une démonstration technologique hors sol.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit-ia"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
              >
                Demander un audit IA
              </Link>
              <Link
                href="/automatisation-entreprise"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
              >
                Voir les automatisations
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-[0_0_70px_rgba(34,211,238,0.14)]">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Cockpit PME augmenté</p>
            <div className="mt-6 grid gap-3">
              {serviceLinks.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.08]"
                >
                  <span className="flex items-center gap-3 text-zinc-100">
                    <service.icon size={18} className="text-cyan-300" />
                    {service.title}
                  </span>
                  <ArrowRight size={16} className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
                </Link>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm leading-relaxed text-cyan-50">
                Le bon projet IA commence par une question: quelle action répétitive empêche vos équipes de vendre,
                répondre, produire ou piloter correctement ?
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function WhyAiSection() {
  return (
    <Section
      eyebrow="Pourquoi maintenant"
      title="Pourquoi l'IA est devenue indispensable aux PME"
      intro="Les PME françaises doivent répondre plus vite, mieux exploiter leurs données et garder un suivi commercial régulier malgré des équipes souvent limitées. L'IA devient utile lorsqu'elle s'intègre aux outils existants et supprime les frictions quotidiennes."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Les demandes clients arrivent par email, téléphone, formulaire, réseaux sociaux ou bouche-à-oreille. Sans automatisation, les informations se perdent et les relances deviennent irrégulières.",
          "Les dirigeants ont besoin de visibilité: pipeline, priorités commerciales, tâches à traiter, devis en attente, clients à rappeler et opportunités à ne pas oublier.",
          "L'IA permet de créer des assistants opérationnels capables de qualifier, résumer, proposer une action et déclencher un workflow tout en laissant les décisions importantes à l'humain.",
        ].map((text) => (
          <article key={text} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-zinc-300">
            <CheckCircle2 className="mb-4 text-cyan-300" size={20} />
            {text}
          </article>
        ))}
      </div>
    </Section>
  );
}

function AuditSection() {
  return (
    <TextSection
      id="audit-ia"
      eyebrow="Diagnostic"
      title="Audit IA: identifier les gains rapides avant d'investir"
      ctaHref="/audit-ia"
      ctaLabel="Demander un audit IA"
      paragraphs={[
        "Un projet IA rentable ne commence pas par un outil, mais par un audit. CorsaiManager analyse vos processus, vos tâches répétitives, vos outils CRM, vos formulaires, vos relances, vos échanges clients et vos points de friction. L'audit permet de séparer les idées séduisantes des automatisations réellement utiles.",
        "Le livrable attendu est concret: une liste de cas d'usage, un niveau de priorité, une estimation d'impact, les données nécessaires, les risques à surveiller et une première feuille de route. Pour une PME, cette étape évite de multiplier les abonnements logiciels sans vision claire.",
      ]}
    />
  );
}

function CrmSection() {
  return (
    <TextSection
      id="crm-ia"
      eyebrow="Suivi commercial"
      title="CRM IA: mieux suivre les prospects et relancer au bon moment"
      ctaHref="/crm-ia-pme"
      ctaLabel="Découvrir le CRM IA"
      paragraphs={[
        "Un CRM intelligent ne se limite pas à stocker des contacts. Il aide vos équipes à prioriser les prospects, relancer les bonnes personnes, résumer les échanges, détecter les opportunités et garder une vision claire du cycle de vente. L'IA devient un copilote commercial qui transforme des données dispersées en actions simples.",
        "CorsaiManager peut connecter votre CRM existant ou développer un outil métier sur mesure. L'objectif est de rendre le suivi plus fiable: moins d'oublis, moins de saisie manuelle, plus de visibilité sur les leads chauds, les devis envoyés et les prochaines actions commerciales.",
      ]}
    />
  );
}

function AssistantSection() {
  return (
    <TextSection
      id="assistant-ia"
      eyebrow="Téléphone et qualification"
      title="Assistant téléphonique IA: ne plus perdre d'opportunités entrantes"
      ctaHref="/assistant-ia-telephone"
      ctaLabel="Voir l'assistant téléphonique IA"
      paragraphs={[
        "Les appels entrants restent un canal décisif pour beaucoup de PME. Pourtant, une demande non traitée, un message oublié ou une qualification imprécise peut faire perdre une opportunité. Un assistant téléphonique IA peut répondre, qualifier, résumer l'appel et transmettre l'information au bon endroit.",
        "La valeur n'est pas seulement dans la réponse automatique. Elle est dans la continuité: résumé envoyé au commercial, création d'une fiche prospect, notification interne, déclenchement d'une relance, ajout au CRM et suivi des demandes prioritaires.",
      ]}
    />
  );
}

function ApplicationsSection() {
  return (
    <TextSection
      id="applications-metier"
      eyebrow="Outils sur mesure"
      title="Applications métier sur mesure: remplacer les fichiers dispersés par un outil fiable"
      ctaHref="/applications-metier"
      ctaLabel="Explorer les applications métier"
      paragraphs={[
        "Beaucoup de PME pilotent encore des processus critiques avec des tableurs, emails, messages et outils non connectés. Une application métier sur mesure permet de centraliser les données, sécuriser les étapes, automatiser les actions répétitives et donner une interface claire aux équipes.",
        "CorsaiManager conçoit des applications modernes pour les besoins réels: suivi de production, gestion de demandes, dashboard commercial, outil de devis, portail client, workflow documentaire ou base métier interne. L'IA peut ensuite enrichir ces outils avec de la recherche, de la synthèse, de la génération ou de la recommandation.",
      ]}
    />
  );
}

function AutomationSection() {
  return (
    <TextSection
      id="automatisation"
      eyebrow="Processus"
      title="Automatisation des processus: connecter vos outils et réduire les tâches manuelles"
      ctaHref="/automatisation-entreprise"
      ctaLabel="Automatiser vos processus"
      paragraphs={[
        "L'automatisation des processus vise les tâches qui consomment du temps sans créer beaucoup de valeur: copier des données, envoyer des emails répétitifs, relancer manuellement, générer des documents, classer des demandes ou produire des rapports. L'IA ajoute une couche de compréhension et d'aide à la décision.",
        "Une automatisation réussie reste contrôlable. Les règles sont explicites, les données sensibles sont cadrées, les validations humaines sont prévues et les résultats sont mesurés. Cette approche convient particulièrement aux PME qui veulent avancer vite sans mettre en danger leur organisation.",
      ]}
    />
  );
}

function UseCasesSection() {
  const cases = [
    "Une PME de services veut qualifier automatiquement les demandes entrantes, créer une fiche prospect et notifier le bon commercial.",
    "Une entreprise commerciale veut automatiser les relances de devis et identifier les opportunités les plus proches de la signature.",
    "Une équipe administrative veut réduire la saisie manuelle entre formulaire, CRM, document PDF et tableau de suivi.",
    "Un centre de formation veut répondre plus vite aux demandes, envoyer les documents utiles et suivre les inscriptions sans perte d'information.",
    "Une PME avec beaucoup d'appels veut résumer les conversations, classer les demandes et garder un historique exploitable.",
    "Une direction veut un dashboard simple pour suivre activité, leads, tâches en retard, conversions et performance commerciale.",
  ];

  return (
    <Section
      eyebrow="Exemples concrets"
      title="Cas d'usage PME"
      intro="Les meilleurs projets IA commencent sur un périmètre clair. Voici des cas d'usage fréquents pour lesquels une PME peut obtenir rapidement un gain opérationnel."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {cases.map((item) => (
          <article key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-zinc-300">
            {item}
          </article>
        ))}
      </div>
    </Section>
  );
}

function InternalLinksSection() {
  return (
    <section className="py-10">
      <Container>
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Parcours conseillé</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Explorer les solutions IA CorsaiManager
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
            Pour construire un projet cohérent, commencez par l&apos;audit, puis reliez les besoins commerciaux,
            téléphoniques, applicatifs et opérationnels dans une feuille de route IA unique.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            <Link href="/audit-ia" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/50 hover:text-cyan-100">
              Audit IA
            </Link>
            <Link href="/crm-ia-pme" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/50 hover:text-cyan-100">
              CRM IA PME
            </Link>
            <Link href="/assistant-ia-telephone" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/50 hover:text-cyan-100">
              Assistant téléphonique IA
            </Link>
            <Link href="/applications-metier" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/50 hover:text-cyan-100">
              Applications métier
            </Link>
            <Link href="/automatisation-entreprise" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/50 hover:text-cyan-100">
              Automatisation entreprise
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FaqSection() {
  return (
    <Section
      eyebrow="FAQ SEO"
      title="Questions fréquentes sur l'IA pour PME"
      intro="Ces réponses aident à cadrer un projet d'automatisation IA, CRM intelligent ou application métier avant de lancer un audit."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {faqItems.map((faq) => (
          <article key={faq.question} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
            <h3 className="text-lg font-semibold text-zinc-100">{faq.question}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{faq.answer}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function FinalCtaSection() {
  return (
    <section>
      <Container>
        <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center sm:p-12">
          <Headphones className="mx-auto text-cyan-300" size={28} />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Vous voulez savoir quoi automatiser en priorité ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-300">
            Demandez un audit IA CorsaiManager. Nous analysons vos processus, vos outils, votre suivi commercial et vos
            opportunités d&apos;automatisation pour construire un plan d&apos;action utile à votre PME.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/audit-ia"
              className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
            >
              Demander un audit IA
            </Link>
            <Link
              href="/services"
              className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Comparer les solutions
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function TextSection({
  id,
  eyebrow,
  title,
  paragraphs,
  ctaHref,
  ctaLabel,
}: {
  id: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section id={id} className="py-10">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{title}</h2>
            <Link
              href={ctaHref}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/60"
            >
              {ctaLabel}
              <ArrowRight size={15} />
            </Link>
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

function Section({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section className="py-10">
      <Container>
        <div className="mb-8 max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">{intro}</p>
        </div>
        {children}
      </Container>
    </section>
  );
}

export { faqItems };
