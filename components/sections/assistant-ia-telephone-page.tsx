"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  CirclePlay,
  Dumbbell,
  Hotel,
  House,
  MessageSquareReply,
  PhoneMissed,
  Stethoscope,
  UtensilsCrossed,
  Workflow,
  Wrench,
} from "lucide-react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Pill } from "@/components/ui/pill";

const problems = [
  {
    icon: PhoneMissed,
    title: "Appels manqués",
    text: "Vos prospects appellent pendant que vous êtes occupé.",
  },
  {
    icon: MessageSquareReply,
    title: "Demandes répétitives",
    text: "Votre équipe perd du temps sur les mêmes questions.",
  },
  {
    icon: BellRing,
    title: "Leads perdus",
    text: "Chaque appel non traité peut représenter un client perdu.",
  },
  {
    icon: Workflow,
    title: "Suivi compliqué",
    text: "Les informations importantes ne sont pas centralisées.",
  },
];

const workflow = [
  "Client appelle",
  "IA répond",
  "Qualification automatique",
  "Résumé envoyé",
  "Lead créé dans CRM",
];

const useCases = [
  {
    icon: UtensilsCrossed,
    title: "Restaurants",
    text: "Réservations mieux traitées, moins d’appels perdus aux heures de rush.",
  },
  {
    icon: Hotel,
    title: "Hôtels",
    text: "Demandes clients captées 24/7 avec transfert intelligent aux équipes.",
  },
  {
    icon: Stethoscope,
    title: "Cabinets médicaux",
    text: "Pré-qualification des demandes et meilleure orientation des appels.",
  },
  {
    icon: Wrench,
    title: "Artisans",
    text: "Qualification instantanée des urgences et des besoins d’intervention.",
  },
  {
    icon: House,
    title: "Immobilier",
    text: "Qualification des acquéreurs/vendeurs et relance plus rapide des leads.",
  },
  {
    icon: Dumbbell,
    title: "Salles de sport",
    text: "Réponses automatiques et conversion plus fluide des prospects entrants.",
  },
];

const kpis = [
  { kind: "count", label: "Appels traités", value: 92, suffix: "%" },
  { kind: "count", label: "Gain de temps", value: 40, suffix: "%" },
  { kind: "text", label: "Réponse", text: "Instantanée" },
  { kind: "text", label: "Disponibilité", text: "24/7" },
] as const;

const demoTabs = [
  { key: "video", label: "Vidéo Démo" },
  { key: "screens", label: "Screenshots" },
  { key: "summary", label: "Résumé IA" },
] as const;

type DemoTabKey = (typeof demoTabs)[number]["key"];

export function AssistantIATelephonePage() {
  const [activeDemoTab, setActiveDemoTab] = useState<DemoTabKey>("video");
  const demoPanel = useMemo(() => {
    if (activeDemoTab === "screens") {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {["/screens/voxiq-dashboard.jpg", "/screens/voxiq-pipeline.jpg"].map((src) => (
            <div key={src} className="overflow-hidden rounded-xl border border-white/10">
              <Image
                src={src}
                alt="Capture dashboard assistant IA"
                width={1200}
                height={760}
                className="aspect-[16/10] h-auto w-full object-cover transition duration-700 hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
      );
    }

    if (activeDemoTab === "summary") {
      return (
        <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-5 text-sm leading-relaxed text-zinc-300">
          <p className="text-cyan-200">Résumé IA - exemple</p>
          <p className="mt-3">
            Appel entrant qualifié: prospect intéressé par un assistant téléphonique IA pour gérer les
            demandes hors horaires. Besoin exprimé: réduction des appels manqués, intégration CRM et
            suivi automatique des leads. Priorité: élevée. Prochaine action recommandée: démonstration
            de 20 minutes avec l’équipe commerciale.
          </p>
        </div>
      );
    }

    return (
      <div className="relative flex aspect-video items-center justify-center rounded-xl border border-dashed border-cyan-300/35 bg-zinc-950/70">
        <div className="text-center">
          <CirclePlay className="mx-auto text-cyan-300" size={36} />
          <p className="mt-3 text-sm text-zinc-300">Emplacement vidéo Loom / YouTube</p>
        </div>
      </div>
    );
  }, [activeDemoTab]);

  return (
    <div className="relative overflow-hidden pb-24">
      <BackgroundFx />
      <Container>
        <Hero />

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Les points de friction les plus fréquents" />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {problems.map((problem, index) => (
              <Card key={problem.title} delay={index * 0.05}>
                <problem.icon className="text-cyan-300" size={20} />
                <h3 className="mt-4 text-lg font-medium text-zinc-100">{problem.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{problem.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <AnimatedReveal>
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur sm:p-8">
              <SectionHeader title="Une IA qui répond, qualifie et synchronise" />
              <p className="mt-5 text-sm leading-relaxed text-zinc-300 sm:text-base">
                L’assistant IA répond instantanément, comprend les demandes, qualifie les appels et
                transmet automatiquement un résumé exploitable.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["24/7", "IA vocale", "CRM sync", "Résumés automatiques"].map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={0.08}>
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur sm:p-8">
              <h3 className="text-lg font-medium text-zinc-100">Workflow visuel</h3>
              <div className="mt-5 space-y-3">
                {workflow.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="relative rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-sm text-zinc-200">{step}</span>
                    {index < workflow.length - 1 ? (
                      <div className="pointer-events-none absolute -bottom-3 left-5 h-3 w-px bg-gradient-to-b from-cyan-300/80 to-transparent" />
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedReveal>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Cas d’usage métiers" />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {useCases.map((item, index) => (
              <Card key={item.title} delay={index * 0.05}>
                <item.icon className="text-cyan-300" size={19} />
                <h3 className="mt-4 text-lg font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Démonstration produit" />
          <div className="mt-7 rounded-3xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur sm:p-7">
            <div className="flex flex-wrap gap-2">
              {demoTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveDemoTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    activeDemoTab === tab.key
                      ? "border border-cyan-300/30 bg-cyan-300/15 text-cyan-100"
                      : "border border-white/15 bg-white/[0.03] text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="mt-5">{demoPanel}</div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="KPIs attendus" />
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, index) => (
              <Card key={kpi.label} delay={index * 0.06}>
                <p className="text-sm text-zinc-400">{kpi.label}</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-100">
                  {kpi.kind === "count" ? <CountUp value={kpi.value} suffix={kpi.suffix} /> : kpi.text}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <AnimatedReveal>
            <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center shadow-[0_0_50px_rgba(34,211,238,0.16)] sm:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Passez à un accueil client intelligent
              </h2>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
                >
                  Réserver une démonstration
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
  );
}

function Hero() {
  return (
    <section className="pt-16 sm:pt-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <AnimatedReveal>
          <Pill>Assistant IA Téléphonique</Pill>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            Votre standard téléphonique IA disponible 24h/24
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Ne perdez plus d’appels clients. L’IA répond, qualifie les demandes et transmet
            automatiquement les informations importantes à votre équipe.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
            >
              Réserver une démo
            </Link>
            <Link
              href="/audit-ia"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Demander un audit IA
            </Link>
          </div>
        </AnimatedReveal>

        <AnimatedReveal delay={0.08}>
          <motion.div
            className="relative rounded-3xl border border-white/10 bg-zinc-900/70 p-5 shadow-[0_0_60px_rgba(34,211,238,0.14)] backdrop-blur sm:p-6"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-3xl"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(34,211,238,0.09)",
                  "0 0 35px rgba(34,211,238,0.18)",
                  "0 0 0 rgba(34,211,238,0.09)",
                ],
              }}
              transition={{ duration: 7, repeat: Infinity }}
            />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-200">Voice AI Dashboard</span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[11px] text-emerald-200">
                Online
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatPill label="Appels traités" value="218" />
              <StatPill label="Temps moyen" value="42 sec" />
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] text-zinc-400">Dernière qualification</p>
              <p className="mt-1 text-sm text-zinc-200">Lead chaud - Demande de démo assistant IA</p>
              <p className="mt-1 text-[11px] text-cyan-200">Résumé synchronisé CRM</p>
            </div>
          </motion.div>
        </AnimatedReveal>
      </div>
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <AnimatedReveal>
      <div className="flex items-center gap-2 text-cyan-200">
        <Activity size={16} />
        <span className="text-xs uppercase tracking-[0.16em]">Solution SaaS IA</span>
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{title}</h2>
    </AnimatedReveal>
  );
}

function Card({
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

function BackgroundFx() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[7%] top-16 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute right-[8%] top-36 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute bottom-20 left-[35%] h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.12]" />
    </div>
  );
}
