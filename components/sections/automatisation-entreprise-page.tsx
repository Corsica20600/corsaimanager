"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BellRing,
  Bot,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Handshake,
  Layers,
  Mail,
  MessageSquare,
  NotepadText,
  RefreshCw,
  Route,
  Sheet,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Pill } from "@/components/ui/pill";

const whatsappUrl =
  "https://wa.me/33665018730?text=Bonjour%2C%20je%20souhaite%20%C3%A9changer%20au%20sujet%20d%E2%80%99un%20audit%20IA.";

const problems = [
  { icon: ClipboardList, title: "Trop de tâches manuelles", text: "Vos équipes passent un temps précieux sur des actions répétitives." },
  { icon: BellRing, title: "Relances oubliées", text: "Des opportunités se perdent faute de suivi systématique." },
  { icon: FileText, title: "Documents répétitifs", text: "Devis et supports sont recréés à la main chaque semaine." },
  { icon: Layers, title: "Données dispersées", text: "Les informations sont éclatées entre plusieurs outils non connectés." },
];

const automations = [
  { icon: FileText, title: "Génération de devis", text: "Création automatique à partir d’un formulaire ou d’un brief client." },
  { icon: Mail, title: "Envoi d’emails commerciaux", text: "Messages contextualisés générés et envoyés selon vos règles." },
  { icon: RefreshCw, title: "Relances automatiques", text: "Suivi intelligent des prospects chauds et clients inactifs." },
  { icon: NotepadText, title: "Création de documents", text: "Compte-rendus, synthèses et documents métier produits automatiquement." },
  { icon: Sheet, title: "Reporting hebdomadaire", text: "Tableaux et indicateurs envoyés sans intervention manuelle." },
  { icon: Target, title: "Qualification de demandes", text: "Tri automatique des demandes selon priorité, urgence et valeur." },
  { icon: MessageSquare, title: "Notifications WhatsApp/email", text: "Alertes ciblées vers les bonnes personnes au bon moment." },
  { icon: Workflow, title: "Synchronisation CRM", text: "Mise à jour de votre pipeline en temps réel depuis vos flux." },
];

const timeline = [
  "Audit des tâches",
  "Cartographie des outils",
  "Création du workflow",
  "Tests",
  "Déploiement",
  "Optimisation continue",
];

const useCases = [
  { title: "Restaurants", text: "Réservations, demandes clients et gestion des avis automatisées." },
  { title: "Centres de formation", text: "Devis, convocations et documents pédagogiques générés automatiquement." },
  { title: "Commerciaux", text: "Relances, emails et mise à jour CRM orchestrés sans friction." },
  { title: "Salles de sport", text: "Suivi prospects, inscriptions et fidélisation plus réguliers." },
  { title: "Locations saisonnières", text: "Traitement des demandes, messages et planning simplifiés." },
  { title: "PME B2B", text: "Devis, reporting et suivi client industrialisés pour gagner en cadence." },
];

const stack = ["OpenAI", "Make", "Zapier", "Gmail", "Google Sheets", "Notion", "Vercel", "APIs métier"];

export function AutomatisationEntreprisePage() {
  return (
    <div className="relative overflow-hidden pb-24">
      <BackgroundFx />
      <Container>
        <Hero />

        <section id="automatisations-possibles" className="mt-16 sm:mt-20">
          <SectionHeader title="Les freins opérationnels les plus courants" />
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
              <SectionHeader title="Des workflows IA connectés à vos outils" />
              <p className="mt-5 text-sm leading-relaxed text-zinc-300 sm:text-base">
                Nous identifions les tâches à faible valeur ajoutée, puis nous créons des workflows
                automatisés connectés à vos outils existants.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Emails IA", "Devis automatisés", "Reporting", "Workflows métier", "Notifications", "Suivi client"].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200"
                    >
                      {badge}
                    </span>
                  ),
                )}
              </div>
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={0.08}>
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur sm:p-8">
              <h3 className="text-lg font-medium text-zinc-100">Workflow de déploiement</h3>
              <div className="mt-5 space-y-3">
                {timeline.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="relative rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200"
                  >
                    {step}
                    {index < timeline.length - 1 ? (
                      <div className="pointer-events-none absolute -bottom-3 left-5 h-3 w-px bg-gradient-to-b from-cyan-300/80 to-transparent" />
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedReveal>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Automatisations possibles" />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {automations.map((item, index) => (
              <Card key={item.title} delay={index * 0.04}>
                <item.icon className="text-cyan-300" size={19} />
                <h3 className="mt-4 text-base font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Cas d’usage métiers" />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {useCases.map((item, index) => (
              <Card key={item.title} delay={index * 0.05}>
                <h3 className="text-lg font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="Stack d’automatisation" />
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
          <SectionHeader title="Avant / Après" />
          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <Card>
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-rose-200">Avant</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-300">
                <li>saisie manuelle</li>
                <li>oubli de relance</li>
                <li>perte d’information</li>
                <li>documents refaits à la main</li>
              </ul>
            </Card>
            <Card delay={0.06}>
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-emerald-200">Après</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-300">
                <li>workflow automatique</li>
                <li>relance programmée</li>
                <li>résumé IA</li>
                <li>document généré</li>
                <li>notification envoyée</li>
              </ul>
            </Card>
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <SectionHeader title="KPIs attendus" />
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <p className="text-sm text-zinc-400">Temps gagné / semaine</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-100">5 à 10h</p>
            </Card>
            <Card delay={0.05}>
              <p className="text-sm text-zinc-400">Réduction des erreurs</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-100">
                <CountUp value={35} suffix="%" />
              </p>
            </Card>
            <Card delay={0.1}>
              <p className="text-sm text-zinc-400">Réponse plus rapide</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-100">
                <CountUp value={2} suffix="x" />
              </p>
            </Card>
            <Card delay={0.15}>
              <p className="text-sm text-zinc-400">Suivi client régulier</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-100">
                <CountUp value={3} suffix="x" />
              </p>
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <AnimatedReveal>
            <Link
              href="/automatisation-ia-corse"
              className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-zinc-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]"
            >
              <span className="font-semibold text-cyan-100">Automatisation IA en Corse</span>
              <span className="ml-2">Voir aussi la page locale dédiée aux entreprises corses.</span>
            </Link>
          </AnimatedReveal>
        </section>

        <section className="mt-16 sm:mt-20">
          <AnimatedReveal>
            <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center shadow-[0_0_50px_rgba(34,211,238,0.16)] sm:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Vos tâches répétitives ne devraient plus vous ralentir
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
                Réservez un audit IA gratuit pour identifier les automatisations les plus rentables dans votre entreprise.
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
                  Échanger sur WhatsApp
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
          <Pill>Automatisation IA</Pill>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            Automatisez vos tâches répétitives avec l’IA
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Emails, relances, devis, documents, reporting et workflows internes : gagnez du temps chaque semaine grâce à des automatisations conçues pour votre activité.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/audit-ia"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
            >
              Demander un audit IA
            </Link>
            <a
              href="#automatisations-possibles"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Voir les automatisations possibles
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
              <span className="text-sm font-medium text-zinc-200">Automation Workflow</span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[11px] text-emerald-200">
                Actif
              </span>
            </div>
            <div className="space-y-3">
              {["Demande client", "IA", "Validation", "Envoi", "Suivi"].map((step, index) => (
                <div key={step} className="relative rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-200">
                  {step}
                  {index < 4 ? (
                    <div className="pointer-events-none absolute -bottom-3 left-5 h-3 w-px bg-gradient-to-b from-cyan-300/80 to-transparent" />
                  ) : null}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatedReveal>
      </div>
    </section>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <AnimatedReveal>
      <div className="flex items-center gap-2 text-cyan-200">
        <Sparkles size={16} />
        <span className="text-xs uppercase tracking-[0.16em]">Automatisation IA</span>
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
      <Route className="absolute left-[12%] top-[36%] text-cyan-300/15" size={78} />
      <Bot className="absolute right-[14%] top-[28%] text-cyan-300/15" size={74} />
      <CalendarClock className="absolute right-[18%] bottom-[24%] text-cyan-300/15" size={72} />
      <CheckCircle2 className="absolute left-[30%] bottom-[22%] text-cyan-300/15" size={66} />
      <Gauge className="absolute left-[55%] top-[18%] text-cyan-300/15" size={68} />
      <Handshake className="absolute right-[34%] bottom-[16%] text-cyan-300/15" size={70} />
      <Mail className="absolute right-[26%] top-[52%] text-cyan-300/15" size={64} />
      <Activity className="absolute left-[42%] top-[54%] text-cyan-300/15" size={64} />
    </div>
  );
}
