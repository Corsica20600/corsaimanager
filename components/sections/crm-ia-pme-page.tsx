"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  Funnel,
  GraduationCap,
  HandCoins,
  Hotel,
  MailCheck,
  Radar,
  RefreshCw,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Pill } from "@/components/ui/pill";

const whatsappUrl =
  "https://wa.me/33665018730?text=Bonjour%2C%20je%20souhaite%20%C3%A9changer%20au%20sujet%20d%E2%80%99un%20audit%20IA.";

const problems = [
  { icon: Users, title: "Prospects dispersés", text: "Les données commerciales sont éclatées entre plusieurs outils." },
  { icon: BellRing, title: "Relances oubliées", text: "Des opportunités se refroidissent faute de suivi régulier." },
  { icon: Funnel, title: "Pipeline peu lisible", text: "Difficile de savoir où concentrer les efforts de vente." },
  { icon: ClipboardList, title: "Trop de tâches manuelles", text: "Vos équipes passent plus de temps à saisir qu’à vendre." },
];

const features = [
  { icon: Funnel, title: "Pipeline intelligent", text: "Vue claire des étapes, priorités et prochaines actions." },
  { icon: RefreshCw, title: "Relances automatiques", text: "Séquences déclenchées selon le comportement du prospect." },
  { icon: MailCheck, title: "Emails IA", text: "Messages commerciaux assistés, contextualisés et rapides à envoyer." },
  { icon: Radar, title: "Scoring prospects", text: "Priorisation automatique des leads les plus chauds." },
  { icon: Users, title: "Historique client", text: "Interactions centralisées pour un suivi précis et cohérent." },
  { icon: FileSpreadsheet, title: "Reporting commercial", text: "KPI en temps réel sur conversion, relances et performance." },
];

const workflow = ["Prospect", "Qualification", "Relance", "Opportunité", "Conversion", "Suivi client"];

const useCases = [
  { icon: BriefcaseBusiness, title: "Commerciaux terrain", text: "Suivi mobile des leads et relances automatisées après rendez-vous." },
  { icon: Target, title: "Agents commerciaux", text: "Meilleure priorisation des prospects à fort potentiel." },
  { icon: Building2, title: "PME B2B", text: "Pipeline consolidé et visibilité complète du cycle de vente." },
  { icon: HandCoins, title: "Prestataires de services", text: "Moins d’administratif, plus de temps pour convertir." },
  { icon: GraduationCap, title: "Centres de formation", text: "Suivi des candidats, relances et pilotage des inscriptions." },
  { icon: Hotel, title: "Fournisseurs CHR", text: "Gestion efficace des demandes entrantes et des comptes clients." },
];

const kpis = [
  { label: "Gain de temps administratif", value: 40, suffix: "%" },
  { label: "Suivi client plus clair", value: 100, suffix: "%" },
  { label: "Relances plus régulières", value: 3, suffix: "x" },
  { label: "Meilleure priorisation commerciale", value: 2, suffix: "x" },
];

export function CrmIAPmePage() {
  return (
    <div className="relative overflow-hidden pb-24">
      <BackgroundFx />
      <Container>
        <Hero />

        <section id="cas-usage" className="mt-16 sm:mt-20">
          <SectionHeader title="Les blocages qui freinent votre croissance commerciale" />
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
              <SectionHeader title="Un CRM IA qui travaille pour votre équipe" />
              <p className="mt-5 text-sm leading-relaxed text-zinc-300 sm:text-base">
                Centralisez vos clients et prospects, activez un scoring IA pour prioriser les leads,
                automatisez les relances, assistez vos emails commerciaux et suivez chaque opportunité
                jusqu’à la conversion.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["CRM centralisé", "Scoring IA", "Relances auto", "Emails assistés", "Opportunités live"].map((badge) => (
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
              <h3 className="text-lg font-medium text-zinc-100">Workflow commercial</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {workflow.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200"
                  >
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedReveal>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Fonctionnalités clés" />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={feature.title} delay={index * 0.05}>
                <feature.icon className="text-cyan-300" size={20} />
                <h3 className="mt-4 text-lg font-medium text-zinc-100">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{feature.text}</p>
              </Card>
            ))}
          </div>
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
          <SectionHeader title="Démonstration produit CRM" />
          <div className="mt-7 rounded-3xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur sm:p-7">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-xl border border-white/10">
                <Image
                  src="/screens/crm-dashboard.jpg"
                  alt="Dashboard CRM IA CorsaiManager"
                  width={1200}
                  height={760}
                  className="aspect-[16/10] h-auto w-full object-cover transition duration-700 hover:scale-[1.02]"
                />
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-5 text-sm leading-relaxed text-zinc-300">
                <p className="text-cyan-200">Exemple de démonstration</p>
                <p className="mt-3">
                  Pipeline intelligent avec scoring en temps réel, relances automatiques par étape
                  et recommandations d’actions commerciales prioritaires pour l’équipe.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Indicateurs d’impact" />
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, index) => (
              <Card key={kpi.label} delay={index * 0.06}>
                <p className="text-sm text-zinc-400">{kpi.label}</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-100">
                  <CountUp value={kpi.value} suffix={kpi.suffix} />
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <AnimatedReveal>
            <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center shadow-[0_0_50px_rgba(34,211,238,0.16)] sm:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Transformez votre suivi commercial en machine à opportunités
              </h2>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/audit-ia#audit-request"
                  className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
                >
                  Réserver un audit IA
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
                >
                  Contact WhatsApp
                </a>
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
          <Pill>CRM IA PME</Pill>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            Un CRM IA pour piloter vos prospects, clients et relances
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Centralisez vos données commerciales, automatisez les relances et priorisez les meilleures opportunités grâce à l’intelligence artificielle.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/audit-ia#audit-request"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
            >
              Demander un audit IA
            </Link>
            <a
              href="#cas-usage"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Voir les cas d’usage
              <ArrowRight size={15} />
            </a>
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
                  "0 0 0 rgba(34,211,238,0.08)",
                  "0 0 30px rgba(34,211,238,0.16)",
                  "0 0 0 rgba(34,211,238,0.08)",
                ],
              }}
              transition={{ duration: 7, repeat: Infinity }}
            />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-200">CRM Dashboard</span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[11px] text-emerald-200">
                Live
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <HeroStat label="Pipeline actif" value="128 leads" />
              <HeroStat label="Relances auto" value="34/jour" />
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] text-zinc-400">Opportunités prioritaires</p>
              <p className="mt-1 text-sm text-zinc-200">Score IA élevé: 14 prospects à traiter</p>
              <p className="mt-1 text-[11px] text-cyan-200">CA potentiel: 74 000€</p>
            </div>
          </motion.div>
        </AnimatedReveal>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
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
        <Sparkles size={16} />
        <span className="text-xs uppercase tracking-[0.16em]">CRM Intelligent</span>
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
      <div className="absolute left-[8%] top-20 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute right-[9%] top-40 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.12]" />
      <div className="absolute bottom-16 left-[35%] h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
      <Activity className="absolute left-[16%] top-[36%] text-cyan-300/20" size={80} />
    </div>
  );
}

