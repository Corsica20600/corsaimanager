"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CirclePlay,
  Clock3,
  Headphones,
  MessageSquareText,
  PhoneCall,
  Sparkles,
  Waves,
} from "lucide-react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";

const painPoints = [
  "Appels ratés pendant les pics d'activité ou en dehors des horaires.",
  "Qualification manuelle irrégulière des demandes entrantes.",
  "Perte d'informations entre téléphone, email et CRM.",
];

const solutionBlocks = [
  {
    icon: Headphones,
    title: "Accueil téléphonique IA 24/7",
    text: "Réponses instantanées, ton professionnel constant, et transfert intelligent selon vos règles.",
  },
  {
    icon: MessageSquareText,
    title: "Qualification automatique",
    text: "Collecte des besoins, urgence, budget et contexte pour orienter chaque appel vers la bonne action.",
  },
  {
    icon: Sparkles,
    title: "Résumé exploitable",
    text: "Synthèse claire de chaque appel, prête à être suivie par vos équipes commerciales ou support.",
  },
];

const workflowSteps = [
  "L’appel entrant est pris en charge automatiquement.",
  "L’IA identifie le besoin et pose les questions clés.",
  "Le prospect est qualifié et catégorisé.",
  "Un résumé est généré et envoyé à l’équipe.",
  "Le suivi est lancé dans votre workflow commercial.",
];

const useCases = [
  {
    title: "Cabinets & services",
    text: "Filtrer les appels, planifier les échanges utiles et réduire les interruptions sans valeur.",
  },
  {
    title: "Commerce local",
    text: "Répondre aux demandes simples, capter plus d'opportunités et limiter les appels manqués.",
  },
  {
    title: "Santé & bien-être",
    text: "Gérer les premières demandes, orienter correctement et conserver une expérience client fluide.",
  },
  {
    title: "BTP & terrain",
    text: "Qualifier rapidement les urgences chantier et transmettre les infos essentielles en temps réel.",
  },
];

export function AssistantIATelephonePage() {
  return (
    <div className="relative overflow-hidden pb-24">
      <BackgroundGlow />

      <section className="pt-16 sm:pt-20">
        <Container>
          <AnimatedReveal>
            <Pill>Assistant IA Téléphonique</Pill>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              Répondez plus vite, qualifiez mieux, convertissez davantage d&apos;appels.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Une solution d’assistant téléphonique IA pensée pour les PME: accueil pro 24/7,
              qualification intelligente et transmission des informations clés à vos équipes.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit-ia"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
              >
                Demander un audit IA
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
              >
                Échanger avec un expert
              </Link>
            </div>
          </AnimatedReveal>
        </Container>
      </section>

      <Container>
        <section className="mt-14 sm:mt-16">
          <SectionTitle
            icon={AlertTriangle}
            title="Les problèmes les plus fréquents"
            subtitle="Quand le téléphone devient un goulet d’étranglement commercial."
          />
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {painPoints.map((point, index) => (
              <PremiumCard key={point} delay={index * 0.06}>
                <p className="text-sm leading-relaxed text-zinc-300">{point}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionTitle
            icon={Waves}
            title="La solution IA CorsaiManager"
            subtitle="Un assistant vocal modernisé, connecté à vos enjeux métier."
          />
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {solutionBlocks.map((item, index) => (
              <PremiumCard key={item.title} delay={index * 0.06}>
                <item.icon className="text-cyan-300" size={20} />
                <h3 className="mt-4 text-lg font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionTitle
            icon={PhoneCall}
            title="Workflow visuel"
            subtitle="Du premier appel au suivi commercial, sans rupture."
          />
          <div className="mt-7 rounded-3xl border border-white/10 bg-zinc-900/55 p-5 backdrop-blur sm:p-7">
            <div className="grid gap-3 md:grid-cols-5">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:border-cyan-300/35 hover:bg-cyan-300/[0.08]"
                >
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Étape {index + 1}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-200">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionTitle
            icon={CheckCircle2}
            title="Cas d’usage métiers"
            subtitle="Des scénarios concrets pour PME de terrain."
          />
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {useCases.map((item, index) => (
              <PremiumCard key={item.title} delay={index * 0.05}>
                <h3 className="text-lg font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionTitle
            icon={CirclePlay}
            title="Démonstration"
            subtitle="Emplacement prévu pour votre future vidéo Loom/YouTube + captures produit."
          />
          <div className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <AnimatedReveal>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 p-3 backdrop-blur">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.2),transparent_40%)] opacity-80" />
                <div className="relative flex aspect-video items-center justify-center rounded-xl border border-dashed border-cyan-300/35 bg-zinc-950/70">
                  <div className="text-center">
                    <CirclePlay className="mx-auto text-cyan-300" size={34} />
                    <p className="mt-3 text-sm text-zinc-300">Zone vidéo (Loom / YouTube embed)</p>
                  </div>
                </div>
              </div>
            </AnimatedReveal>

            <AnimatedReveal delay={0.08}>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-3 backdrop-blur">
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src="/screens/voxiq-dashboard.jpg"
                    alt="Aperçu dashboard assistant IA téléphonique"
                    width={1200}
                    height={760}
                    className="aspect-[16/10] h-auto w-full object-cover transition duration-700 hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                  <Clock3 size={13} className="text-cyan-300" />
                  Capture UI de démonstration
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <AnimatedReveal>
            <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center sm:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Prêt à activer votre assistant téléphonique IA ?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
                Réservez un audit IA gratuit et identifiez vos gains prioritaires en quelques jours.
              </p>
              <Link
                href="/audit-ia"
                className="mt-7 inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
              >
                Réserver un audit IA
              </Link>
            </div>
          </AnimatedReveal>
        </section>
      </Container>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[8%] top-24 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute right-[10%] top-44 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.12]" />
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Sparkles;
  title: string;
  subtitle: string;
}) {
  return (
    <AnimatedReveal>
      <div className="flex items-center gap-2 text-cyan-200">
        <Icon size={16} />
        <span className="text-xs uppercase tracking-[0.16em]">Assistant IA</span>
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">{subtitle}</p>
    </AnimatedReveal>
  );
}

function PremiumCard({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <AnimatedReveal delay={delay}>
      <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07] hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]">
        {children}
      </article>
    </AnimatedReveal>
  );
}
