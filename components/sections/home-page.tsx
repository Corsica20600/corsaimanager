"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Briefcase,
  ChartNoAxesCombined,
  Clock3,
  Dumbbell,
  GraduationCap,
  Handshake,
  Headset,
  Layers,
  Lock,
  PhoneCall,
  Store,
  Target,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";

const services = [
  {
    icon: PhoneCall,
    title: "Assistant IA Téléphonique",
    description:
      "Gestion intelligente des appels entrants et qualification automatique des prospects.",
    href: "/assistant-ia-telephone",
  },
  {
    icon: ChartNoAxesCombined,
    title: "CRM IA Commercial",
    description:
      "Pipeline augmenté par l'IA, scoring prédictif et priorisation des opportunités à fort potentiel.",
  },
  {
    icon: Workflow,
    title: "Automatisation Entreprise",
    description:
      "Workflows IA interconnectés pour réduire les frictions opérationnelles et accélérer l'exécution.",
  },
  {
    icon: Briefcase,
    title: "Applications Métier",
    description:
      "Outils sur mesure pour vos équipes, conçus pour votre réalité terrain et vos objectifs business.",
  },
];

const reasons = [
  {
    icon: Handshake,
    title: "Expertise terrain",
    metric: "Vision business concrète",
    description:
      "Des solutions conçues avec une compréhension réelle des problématiques commerciales et opérationnelles.",
  },
  {
    icon: Target,
    title: "Automatisation intelligente",
    metric: "Impact mesurable",
    description:
      "Réduction des tâches répétitives, optimisation des workflows et gain de temps mesurable.",
  },
  {
    icon: Layers,
    title: "Applications sur mesure",
    metric: "Adaptées à votre activité",
    description:
      "Chaque solution est adaptée à votre activité, vos équipes et vos objectifs.",
  },
  {
    icon: Headset,
    title: "Accompagnement humain",
    metric: "Approche pragmatique",
    description:
      "Une approche accessible et pragmatique pour intégrer l’IA dans votre entreprise.",
  },
];

const useCases = [
  {
    icon: Store,
    title: "Restaurants",
    problem: "Réservations et demandes clients dispersées, suivi manuel chronophage.",
    solution: "Assistant IA omnicanal + automatisation des réponses et relances clients.",
    result: "Temps administratif réduit, meilleure expérience client et plus de réservations confirmées.",
  },
  {
    icon: Dumbbell,
    title: "Salles de sport",
    problem: "Relances abonnements irrégulières et faible suivi des prospects chauds.",
    solution: "CRM IA avec scoring leads, séquences de relance et notifications commerciales.",
    result: "Hausse du taux de conversion et pipeline commercial plus fiable.",
  },
  {
    icon: GraduationCap,
    title: "Centres de formation",
    problem: "Traitement manuel des demandes d'information et des inscriptions.",
    solution: "Workflow IA de qualification, réponse instantanée et orchestration documentaire.",
    result: "Réduction des délais de réponse et meilleure fluidité d'inscription.",
  },
  {
    icon: Users,
    title: "PME commerciales",
    problem: "Données clients fragmentées, actions commerciales peu synchronisées.",
    solution: "Centralisation CRM intelligent + automatisation emails, devis et relances.",
    result: "Visibilité 360° du cycle de vente et productivité commerciale accrue.",
  },
];

const processSteps = [
  "Audit IA",
  "Analyse des besoins",
  "Développement de la solution",
  "Déploiement",
  "Optimisation continue",
];

export function HomePageSections() {
  return (
    <div className="space-y-20 pb-24 pt-8 sm:space-y-24 sm:pt-10">
      <HeroSection />
      <TechStackSection />
      <ServicesSection />
      <OffersSection />
      <UseCasesSection />
      <ProcessSection />
      <WhySection />
      <TrustSection />
      <ProjectsSection />
      <StatsSection />
      <FinalCtaSection />
    </div>
  );
}

function TechStackSection() {
  const techs = ["OpenAI", "Next.js", "Supabase", "Vercel", "Stripe", "Twilio", "Make"];

  return (
    <section>
      <Container>
        <AnimatedReveal>
          <h2 className="text-center text-sm font-medium uppercase tracking-[0.22em] text-zinc-400">
            Technologies modernes et évolutives
          </h2>
        </AnimatedReveal>
        <AnimatedReveal delay={0.08}>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-3 backdrop-blur sm:p-4">
            <motion.div
              className="flex items-center gap-2 overflow-x-auto sm:justify-center sm:gap-3"
              animate={{ x: [0, -8, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
              {techs.map((tech, index) => (
                <motion.div
                  key={tech}
                  className="shrink-0 rounded-xl border border-white/10 bg-zinc-900/65 px-4 py-3 text-center transition duration-300 hover:border-cyan-300/40 hover:bg-cyan-300/[0.08] hover:shadow-[0_0_22px_rgba(34,211,238,0.24)]"
                  initial={{ opacity: 0.75 }}
                  animate={{ opacity: [0.72, 0.95, 0.72] }}
                  transition={{ duration: 4.8, repeat: Infinity, delay: index * 0.28, ease: "easeInOut" }}
                >
                  <span className="text-sm font-semibold tracking-wide text-zinc-200/90 grayscale">
                    {tech}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedReveal>
      </Container>
    </section>
  );
}

function CtaButtons() {
  return (
    <div className="mt-8 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:gap-4">
      <Link
        href="/audit-ia"
        className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(34,211,238,0.45)]"
      >
        Réserver un audit IA
      </Link>
      <Link
        href="/services"
        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-100 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200 hover:shadow-[0_0_24px_rgba(34,211,238,0.22)]"
      >
        Voir les solutions
      </Link>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[76vh] sm:min-h-[82vh]">
      <Container>
        <div className="grid items-center gap-8 pt-8 md:grid-cols-[1.15fr_0.95fr] md:gap-10 md:pt-14">
          <AnimatedReveal>
            <div className="relative max-w-2xl">
              <motion.div
                className="pointer-events-none absolute -left-12 top-16 h-32 w-64 rounded-full bg-cyan-300/20 blur-3xl"
                animate={{ opacity: [0.36, 0.58, 0.4], scale: [1, 1.06, 1] }}
                transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <Pill>Automatisation IA pour PME</Pill>
              <h1 className="relative mt-6 text-4xl font-semibold leading-tight tracking-tight text-white drop-shadow-[0_8px_34px_rgba(34,211,238,0.28)] sm:text-5xl lg:text-6xl">
                Automatisez votre entreprise avec l&apos;intelligence artificielle
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                CRM intelligents, assistants IA, automatisation commerciale et applications métier sur mesure pour faire grandir votre PME plus vite.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-cyan-100/90">
                Gagnez du temps, automatisez vos relances et transformez vos outils en véritables assistants commerciaux.
              </p>
              <CtaButtons />
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={0.1}>
            <motion.div
              className="relative rounded-3xl border border-white/10 bg-zinc-900/70 p-4 shadow-[0_0_70px_rgba(34,211,238,0.18)] backdrop-blur sm:p-5"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-3xl"
                animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0.08)", "0 0 30px rgba(34,211,238,0.14)", "0 0 0 rgba(34,211,238,0.08)"] }}
                transition={{ duration: 7, repeat: Infinity }}
              />
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-200">Dashboard IA</span>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[11px] text-emerald-200">Actif</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-zinc-400">Leads traités</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">128</p>
                  <p className="text-[11px] text-cyan-200">+18% cette semaine</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-zinc-400">Taux de réponse</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">96%</p>
                  <p className="text-[11px] text-cyan-200">SLA {"<"} 2 min</p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Progression workflow commercial</span>
                  <span className="text-zinc-200">74%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "74%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {[
                  { label: "Relance automatique envoyée", time: "il y a 1 min", active: true },
                  { label: "Lead qualifié: PME BTP", time: "il y a 3 min", active: true },
                  { label: "Résumé d'appel synchronisé CRM", time: "il y a 6 min", active: false },
                ].map(({ label, time, active }, index) => (
                  <motion.div
                    key={label}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300"
                    animate={{ opacity: [0.82, 1, 0.82] }}
                    transition={{ duration: 3.8, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" : "bg-cyan-300/80"}`} />
                      {label}
                    </span>
                    <span className="text-zinc-500">{time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatedReveal>
        </div>
      </Container>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services">
      <Container>
        <AnimatedReveal>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">Services IA premium</h2>
        </AnimatedReveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {services.map((service, i) => (
            <AnimatedReveal key={service.title} delay={i * 0.06}>
              {service.href ? (
                <Link
                  href={service.href}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.08]"
                >
                  <service.icon className="text-cyan-300" size={22} />
                  <h3 className="mt-4 text-xl font-medium text-zinc-100">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">{service.description}</p>
                </Link>
              ) : (
                <article className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.08]">
                  <service.icon className="text-cyan-300" size={22} />
                  <h3 className="mt-4 text-xl font-medium text-zinc-100">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">{service.description}</p>
                </article>
              )}
            </AnimatedReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function OffersSection() {
  const offers = [
    {
      title: "Audit IA",
      price: "Gratuit",
      what:
        "Analyse de vos tâches répétitives, de vos outils actuels et des opportunités IA prioritaires.",
      who:
        "Idéal pour les PME qui veulent une vision claire avant d'investir.",
      benefit: "Vous repartez avec un plan concret et priorisé.",
    },
    {
      title: "Mise en place IA",
      price: "à partir de 990 €",
      what:
        "Configuration de vos automatisations, assistants IA et workflows commerciaux.",
      who:
        "Pour les entreprises prêtes à déployer rapidement une première solution utile.",
      benefit:
        "Mise en production rapide avec gains visibles sur vos opérations.",
    },
    {
      title: "Accompagnement mensuel",
      price: "à partir de 149 €/mois",
      what:
        "Suivi, optimisation continue, ajustements et nouvelles automatisations selon vos KPI.",
      who:
        "Pour les équipes qui veulent une amélioration continue sans surcharge interne.",
      benefit: "Performance durable et montée en valeur mois après mois.",
    },
  ];

  return (
    <section>
      <Container>
        <AnimatedReveal>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">Offres</h2>
        </AnimatedReveal>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {offers.map((offer, i) => (
            <AnimatedReveal key={offer.title} delay={i * 0.06}>
              <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition duration-300 hover:border-cyan-300/40 hover:bg-cyan-300/[0.08]">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-medium text-zinc-100">{offer.title}</h3>
                  <p className="text-sm font-semibold text-cyan-200">{offer.price}</p>
                </div>
                <p className="mt-4 text-sm text-zinc-400">
                  Ce que vous achetez: <span className="text-zinc-300">{offer.what}</span>
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Adapté à: <span className="text-zinc-300">{offer.who}</span>
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Bénéfice concret: <span className="text-cyan-100">{offer.benefit}</span>
                </p>
              </article>
            </AnimatedReveal>
          ))}
        </div>
        <AnimatedReveal delay={0.15}>
          <CtaButtons />
        </AnimatedReveal>
      </Container>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section>
      <Container>
        <AnimatedReveal>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">Cas d&apos;usage</h2>
        </AnimatedReveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {useCases.map((item, i) => (
            <AnimatedReveal key={item.title} delay={i * 0.05}>
              <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]">
                <item.icon className="text-cyan-300" size={20} />
                <h3 className="mt-4 text-xl font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm text-zinc-400">Problème: <span className="text-zinc-300">{item.problem}</span></p>
                <p className="mt-2 text-sm text-zinc-400">Solution IA: <span className="text-zinc-300">{item.solution}</span></p>
                <p className="mt-2 text-sm text-zinc-400">Résultat: <span className="text-cyan-100">{item.result}</span></p>
              </article>
            </AnimatedReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProcessSection() {
  return (
    <section>
      <Container>
        <AnimatedReveal>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">Méthode</h2>
            <div className="mt-8 grid gap-3 md:grid-cols-5">
              {processSteps.map((step, index) => (
                <div key={step} className="relative rounded-xl border border-white/10 bg-white/5 p-4 text-center shadow-[0_0_0_rgba(34,211,238,0)] transition hover:border-cyan-300/35 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Étape {index + 1}</p>
                  <p className="mt-2 text-sm font-medium text-zinc-100 sm:text-base">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedReveal>
      </Container>
    </section>
  );
}

function WhySection() {
  return (
    <section>
      <Container>
        <AnimatedReveal>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">Pourquoi CorsaiManager</h2>
        </AnimatedReveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {reasons.map((reason, i) => (
            <AnimatedReveal key={reason.title} delay={i * 0.07}>
              <article className="rounded-2xl border border-white/10 bg-zinc-900/55 p-6 backdrop-blur transition duration-300 hover:border-cyan-300/35 hover:bg-zinc-900/80">
                <reason.icon className="text-cyan-300" size={20} />
                <h3 className="mt-4 text-xl font-medium text-zinc-100">{reason.title}</h3>
                <p className="mt-2 text-xs uppercase tracking-wide text-cyan-200">{reason.metric}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{reason.description}</p>
              </article>
            </AnimatedReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function TrustSection() {
  const trust = [
    { icon: Clock3, label: "Disponibilité 24/7" },
    { icon: Lock, label: "Automatisation sécurisée" },
    { icon: TrendingUp, label: "Solutions évolutives" },
    { icon: Users, label: "Accompagnement humain" },
  ];

  return (
    <section>
      <Container>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((item, i) => (
            <AnimatedReveal key={item.label} delay={i * 0.05}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                <item.icon className="mx-auto text-cyan-300" size={18} />
                <p className="mt-3 text-sm font-medium text-zinc-200">{item.label}</p>
              </div>
            </AnimatedReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProjectsSection() {
  const projects = [
    {
      name: "Voxiq",
      screenshot: "/screens/voxiq-dashboard.jpg",
      clientType: "PME services",
      benefit: "Qualification d'appels plus rapide et suivi client instantané.",
      stack: ["Next.js", "IA vocale", "CRM API"],
      description:
        "Assistant téléphonique IA pour qualifier les appels, répondre aux clients et envoyer des résumés exploitables.",
    },
    {
      name: "FitAI Pro",
      screenshot: "/screens/fitai-dashboard.jpg",
      clientType: "Fitness & coaching",
      benefit: "Expérience membre plus engageante et meilleure rétention.",
      stack: ["React", "Analytics", "Automation"],
      description:
        "Application fitness personnelle avec programmes, suivi, interface premium et logique coach.",
    },
    {
      name: "CRM intelligent",
      screenshot: "/screens/crm-dashboard.jpg",
      clientType: "PME commerciales",
      benefit: "Pipeline commercial centralisé et relances automatisées.",
      stack: ["Next.js", "PostgreSQL", "Workflows IA"],
      description:
        "Suivi prospects/clients, relances automatiques, mails commerciaux et pipeline augmenté.",
    },
    {
      name: "Automatisations métier",
      screenshot: "/screens/konformup-dashboard.jpg",
      clientType: "Entreprise multi-équipes",
      benefit: "Réduction des tâches répétitives et meilleure exécution opérationnelle.",
      stack: ["API Orchestration", "No-code", "LLM Ops"],
      description:
        "Workflows IA pour devis, emails, documents, reporting et tâches répétitives.",
    },
  ];

  return (
    <section>
      <Container>
        <AnimatedReveal>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">Réalisations</h2>
        </AnimatedReveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {projects.map((project, index) => (
            <AnimatedReveal key={project.name} delay={index * 0.07}>
              <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 sm:p-7">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.16),transparent_36%)] opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="relative mb-5 overflow-hidden rounded-xl border border-white/15 bg-zinc-900/75 p-2 backdrop-blur">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_55%)]" />
                  <div className="mb-2 rounded-lg border border-white/10 bg-zinc-950/90 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-300/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
                      </div>
                      <p className="text-[10px] text-zinc-500">app.corsaimanager.ai</p>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950/80 shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
                    <Image
                      src={project.screenshot}
                      alt={`Capture ${project.name}`}
                      width={1200}
                      height={760}
                      className="aspect-[16/10] h-auto w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-cyan-300/15" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-cyan-200">Projet {index + 1}</p>
                  <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-0.5 text-[10px] text-cyan-200">Live</span>
                </div>
                <h3 className="mt-2 text-2xl font-medium text-zinc-100">{project.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 text-sm text-zinc-400">
                  <p>
                    Bénéfice principal: <span className="text-zinc-200">{project.benefit}</span>
                  </p>
                  <p>
                    Type de client: <span className="text-zinc-200">{project.clientType}</span>
                  </p>
                </div>
              </article>
            </AnimatedReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { label: "Automatisation 24/7", value: "24/7" },
    { label: "Réduction du temps administratif", value: "-70%" },
    { label: "Réponse instantanée", value: "<2 min" },
    { label: "Solutions évolutives", value: "Scalable" },
  ];

  return (
    <section>
      <Container>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, i) => (
            <AnimatedReveal key={item.label} delay={i * 0.06}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-3xl font-semibold text-zinc-100">{item.value}</p>
                <p className="mt-2 text-sm text-zinc-400">{item.label}</p>
              </div>
            </AnimatedReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FinalCtaSection() {
  const whatsappMsg = encodeURIComponent(
    "Bonjour, je souhaite échanger au sujet d’un audit IA pour mon entreprise."
  );

  return (
    <section>
      <Container>
        <AnimatedReveal>
          <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center sm:p-12">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">Prêt à automatiser votre entreprise ?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
              Réservez un audit IA gratuit et identifiez les gains possibles pour votre activité.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/audit-ia"
                className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(34,211,238,0.45)]"
              >
                Réserver un audit IA
              </Link>
              <a
                href={`https://wa.me/33665018730?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200 hover:shadow-[0_0_24px_rgba(34,211,238,0.22)]"
              >
                Contact WhatsApp
              </a>
            </div>
          </div>
        </AnimatedReveal>
      </Container>
    </section>
  );
}
