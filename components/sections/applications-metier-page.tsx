"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarRange,
  ChartColumnBig,
  Dumbbell,
  FileStack,
  Gauge,
  Layers,
  LayoutDashboard,
  MessagesSquare,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Workflow,
} from "lucide-react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Pill } from "@/components/ui/pill";

const whatsappUrl =
  "https://wa.me/33665018730?text=Bonjour%2C%20je%20souhaite%20%C3%A9changer%20au%20sujet%20d%E2%80%99un%20audit%20IA.";

const problems = [
  { icon: Layers, title: "Outils dispersés", text: "Vos équipes jonglent entre plusieurs logiciels." },
  { icon: Workflow, title: "Processus manuels", text: "Des tâches répétitives ralentissent votre activité." },
  { icon: Target, title: "Logiciels inadaptés", text: "Les solutions standards ne correspondent pas à vos besoins." },
  { icon: Activity, title: "Perte de visibilité", text: "Les données importantes sont difficiles à centraliser." },
];

const appTypes = [
  { icon: BriefcaseBusiness, title: "CRM commercial", desc: "Pilotage du pipeline et relances", benefit: "Conversion accélérée" },
  { icon: BookOpenCheck, title: "Gestion formation", desc: "Sessions, stagiaires, suivi administratif", benefit: "Organisation plus fluide" },
  { icon: CalendarRange, title: "Réservation / planning", desc: "Calendriers et disponibilités en temps réel", benefit: "Moins d’erreurs de planning" },
  { icon: Users, title: "Suivi clients", desc: "Historique centralisé des interactions", benefit: "Expérience client homogène" },
  { icon: FileStack, title: "Gestion documentaire", desc: "Documents générés et classés automatiquement", benefit: "Gain de temps opérationnel" },
  { icon: LayoutDashboard, title: "Dashboard entreprise", desc: "Indicateurs clés en un coup d’œil", benefit: "Décisions plus rapides" },
  { icon: Dumbbell, title: "Application fitness", desc: "Coaching, abonnements et suivi membres", benefit: "Engagement renforcé" },
  { icon: Workflow, title: "Outils internes PME", desc: "Processus métier sur mesure", benefit: "Productivité durable" },
];

const caseStudies = [
  {
    name: "FitAI",
    screenshot: "/screens/fitai-dashboard.jpg",
    stack: ["Next.js", "Analytics", "Automation"],
    problem: "Suivi membres et parcours coaching fragmentés.",
    solution: "Application dédiée avec tableau de bord, programmes et suivi centralisé.",
    benefit: "Meilleure rétention et pilotage opérationnel simplifié.",
  },
  {
    name: "CRM IA Commercial",
    screenshot: "/screens/crm-dashboard.jpg",
    stack: ["Next.js", "PostgreSQL", "Workflows IA"],
    problem: "Relances manuelles et pipeline peu priorisé.",
    solution: "CRM intelligent avec scoring, relances et historique client unifié.",
    benefit: "Priorisation commerciale plus efficace et taux de conversion en hausse.",
  },
  {
    name: "Gestion formation SST",
    screenshot: "/screens/konformup-dashboard.jpg",
    stack: ["Next.js", "Automatisation", "API métier"],
    problem: "Organisation des sessions et documents trop chronophage.",
    solution: "Outil métier pour sessions, convocations, documents et reporting.",
    benefit: "Charge administrative réduite et process fiabilisés.",
  },
  {
    name: "Dashboards opérationnels",
    screenshot: "/screens/konformup-pipeline.jpg",
    stack: ["BI", "APIs", "Orchestration"],
    problem: "Peu de visibilité sur les KPI business quotidiens.",
    solution: "Dashboards sur mesure connectés aux flux terrain.",
    benefit: "Décisions plus rapides, meilleure coordination équipes.",
  },
];

const developmentProcess = ["Audit", "Prototype", "Développement", "Tests", "Déploiement", "Évolutions"];
const stack = ["Next.js", "OpenAI", "PostgreSQL", "Neon", "Vercel", "APIs", "Stripe", "Twilio"];

const advantages = [
  "Développement rapide",
  "Solution évolutive",
  "IA intégrée",
  "Hébergement moderne",
  "Responsive mobile",
  "Accompagnement personnalisé",
];

export function ApplicationsMetierPage() {
  return (
    <div className="relative overflow-hidden pb-24">
      <BackgroundFx />
      <Container>
        <Hero />

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Les défis fréquents des équipes" />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {problems.map((item, index) => (
              <Card key={item.title} delay={index * 0.05}>
                <item.icon className="text-cyan-300" size={20} />
                <h3 className="mt-4 text-lg font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <AnimatedReveal>
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur sm:p-8">
              <SectionHeader title="Applications métier modernes et évolutives" />
              <p className="mt-5 text-sm leading-relaxed text-zinc-300 sm:text-base">
                Nous développons des applications métier modernes et évolutives adaptées à votre fonctionnement réel.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Web App", "Mobile Friendly", "IA intégrée", "Automatisation", "Dashboard", "APIs connectées"].map((badge) => (
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
              <h3 className="text-lg font-medium text-zinc-100">Process de développement</h3>
              <div className="mt-5 space-y-3">
                {developmentProcess.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="relative rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200"
                  >
                    {step}
                    {index < developmentProcess.length - 1 ? (
                      <div className="pointer-events-none absolute -bottom-3 left-5 h-3 w-px bg-gradient-to-b from-cyan-300/80 to-transparent" />
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedReveal>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Types d’applications métier" />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {appTypes.map((item, index) => (
              <Card key={item.title} delay={index * 0.04}>
                <item.icon className="text-cyan-300" size={19} />
                <h3 className="mt-4 text-base font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-300">{item.desc}</p>
                <p className="mt-2 text-xs text-cyan-200">{item.benefit}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Réalisations" />
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {caseStudies.map((project, index) => (
              <Card key={project.name} delay={index * 0.05}>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={project.screenshot}
                    alt={`Capture ${project.name}`}
                    width={1200}
                    height={760}
                    className="aspect-[16/10] h-auto w-full object-cover transition duration-700 hover:scale-[1.02]"
                  />
                </div>
                <h3 className="mt-4 text-xl font-medium text-zinc-100">{project.name}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span key={item} className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-300">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-zinc-400">Problématique: <span className="text-zinc-300">{project.problem}</span></p>
                <p className="mt-2 text-sm text-zinc-400">Solution: <span className="text-zinc-300">{project.solution}</span></p>
                <p className="mt-2 text-sm text-zinc-400">Bénéfice: <span className="text-cyan-100">{project.benefit}</span></p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Stack technologique" />
          <div className="mt-7 rounded-3xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur sm:p-7">
            <div className="flex flex-wrap gap-2">
              {stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200 transition duration-300 hover:border-cyan-300/35 hover:bg-cyan-300/[0.08]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Avantages" />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {advantages.map((item, index) => (
              <Card key={item} delay={index * 0.05}>
                <p className="text-lg font-medium text-zinc-100">{item}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="KPIs" />
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <p className="text-sm text-zinc-400">Temps gagné</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-100"><CountUp value={8} suffix="h/sem." /></p>
            </Card>
            <Card delay={0.05}>
              <p className="text-sm text-zinc-400">Processus automatisés</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-100"><CountUp value={70} suffix="%" /></p>
            </Card>
            <Card delay={0.1}>
              <p className="text-sm text-zinc-400">Centralisation des données</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-100"><CountUp value={100} suffix="%" /></p>
            </Card>
            <Card delay={0.15}>
              <p className="text-sm text-zinc-400">Productivité améliorée</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-100"><CountUp value={2} suffix="x" /></p>
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <AnimatedReveal>
            <Link
              href="/application-metier-corse"
              className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-zinc-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]"
            >
              <span className="font-semibold text-cyan-100">Application métier en Corse</span>
              <span className="ml-2">Voir aussi la page locale dédiée aux PME corses.</span>
            </Link>
          </AnimatedReveal>
        </section>

        <section className="mt-16 sm:mt-20">
          <AnimatedReveal>
            <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center shadow-[0_0_50px_rgba(34,211,238,0.16)] sm:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Transformez vos processus en outils intelligents
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
                Réservez un audit IA gratuit pour imaginer votre future application métier.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/audit-ia"
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
                  WhatsApp
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
          <Pill>Applications Métier</Pill>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            Des applications métier conçues pour votre activité
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            CRM, gestion commerciale, formation, réservation, dashboards, automatisation et outils métier : développez une solution adaptée à vos processus.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/audit-ia"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
            >
              Demander un audit IA
            </Link>
            <Link
              href="/realisations"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Voir des réalisations
              <ArrowRight size={15} />
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
                  "0 0 0 rgba(34,211,238,0.08)",
                  "0 0 30px rgba(34,211,238,0.16)",
                  "0 0 0 rgba(34,211,238,0.08)",
                ],
              }}
              transition={{ duration: 7, repeat: Infinity }}
            />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-200">Product Suite</span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[11px] text-emerald-200">
                Online
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <HeroStat label="Dashboard" value="Live analytics" />
              <HeroStat label="Mobile" value="Ready" />
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] text-zinc-400">Workflow</p>
              <p className="mt-1 text-sm text-zinc-200">Demande client → IA → Validation → Envoi → Suivi</p>
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
        <span className="text-xs uppercase tracking-[0.16em]">Applications Sur Mesure</span>
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
      <div className="absolute left-[7%] top-20 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute right-[8%] top-40 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute bottom-16 left-[35%] h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.12]" />
      <LayoutDashboard className="absolute left-[12%] top-[34%] text-cyan-300/14" size={76} />
      <Smartphone className="absolute right-[13%] top-[28%] text-cyan-300/14" size={72} />
      <ChartColumnBig className="absolute right-[22%] bottom-[24%] text-cyan-300/14" size={66} />
      <MessagesSquare className="absolute left-[32%] bottom-[19%] text-cyan-300/14" size={64} />
      <ShieldCheck className="absolute right-[34%] bottom-[14%] text-cyan-300/14" size={64} />
      <Gauge className="absolute left-[56%] top-[18%] text-cyan-300/14" size={66} />
    </div>
  );
}
