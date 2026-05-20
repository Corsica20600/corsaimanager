import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChartNoAxesCombined, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Portfolio CorsaiManager: études de cas IA concrètes pour PME avec enjeux, solutions, résultats et stack technologique.",
};

type CaseStudy = {
  name: string;
  summary: string;
  context: string;
  solution: string;
  features: string[];
  benefits: string[];
  stack: string[];
  timeline: string[];
  screenshots: { src: string; alt: string }[];
  ctaLabel: string;
  ctaHref: string;
};

const caseStudies: CaseStudy[] = [
  {
    name: "Voxiq",
    summary:
      "Assistant IA téléphonique pour qualification automatique des appels et génération de résumés exploitables.",
    context:
      "L'équipe commerciale perdait du temps sur des appels non qualifiés et le compte-rendu manuel des échanges.",
    solution:
      "Conception d'un assistant vocal IA connecté au CRM pour filtrer les appels, structurer les informations et remonter des synthèses actionnables.",
    features: [
      "Qualification intelligente des appels entrants",
      "Résumés d'appels automatiques envoyés aux commerciaux",
      "Synchronisation CRM en temps réel",
      "Routage vers le bon interlocuteur",
    ],
    benefits: [
      "Moins d'appels à faible valeur pour l'équipe",
      "Suivi commercial plus fiable",
      "Accélération du temps de réponse client",
    ],
    stack: ["Next.js", "OpenAI", "Twilio", "Supabase"],
    timeline: ["Cadrage", "Prototype vocal", "Intégration CRM", "Mise en production"],
    screenshots: [
      { src: "/screens/voxiq-dashboard.jpg", alt: "Dashboard Voxiq" },
      { src: "/screens/voxiq-pipeline.jpg", alt: "Pipeline Voxiq" },
    ],
    ctaLabel: "Demander un audit similaire",
    ctaHref: "/audit-ia",
  },
  {
    name: "FitAI Pro",
    summary:
      "Application fitness premium avec programmes, suivi et logique coach intelligente.",
    context:
      "Le client voulait proposer une expérience digitale engageante sans complexifier le suivi des utilisateurs.",
    solution:
      "Développement d'une application métier orientée performance utilisateur avec personnalisation des parcours et analytics d'engagement.",
    features: [
      "Programmes adaptatifs par profil",
      "Suivi de progression visuel",
      "Recommandations coach assistées par IA",
      "Interface mobile premium",
    ],
    benefits: [
      "Meilleure rétention des utilisateurs",
      "Expérience client plus différenciante",
      "Vision claire des performances",
    ],
    stack: ["Next.js", "Vercel", "Stripe", "Analytics"],
    timeline: ["Discovery", "UX/UI", "Développement", "Optimisation continue"],
    screenshots: [
      { src: "/screens/fitai-dashboard.jpg", alt: "Dashboard FitAI Pro" },
      { src: "/screens/fitai-mobile.jpg", alt: "Interface mobile FitAI Pro" },
    ],
    ctaLabel: "Parler de votre application",
    ctaHref: "/contact",
  },
  {
    name: "CRM Intelligent",
    summary:
      "CRM commercial augmenté par IA avec relances et pipeline automatisé.",
    context:
      "Les données prospects étaient fragmentées et les relances dépendaient trop des actions manuelles.",
    solution:
      "Mise en place d'un CRM unifié avec priorisation IA des opportunités et scénarios de relance automatisés.",
    features: [
      "Scoring automatique des leads",
      "Relances email multi-étapes",
      "Pipeline de vente en temps réel",
      "Tableaux de bord décisionnels",
    ],
    benefits: [
      "Pipeline plus prévisible",
      "Relances plus régulières",
      "Hausse du taux de conversion commercial",
    ],
    stack: ["Next.js", "Supabase", "OpenAI", "Make"],
    timeline: ["Audit process", "Modélisation pipeline", "Automatisation", "Pilotage KPI"],
    screenshots: [
      { src: "/screens/crm-dashboard.jpg", alt: "Dashboard CRM intelligent" },
      { src: "/screens/crm-pipeline.jpg", alt: "Pipeline CRM intelligent" },
    ],
    ctaLabel: "Optimiser mon CRM",
    ctaHref: "/audit-ia",
  },
  {
    name: "Gestion Formation SST",
    summary:
      "Application métier sur mesure pour gestion de sessions, documents et conformité.",
    context:
      "L'organisation des sessions SST et la gestion documentaire étaient dispersées sur plusieurs outils.",
    solution:
      "Création d'une plateforme centralisée pour piloter inscriptions, sessions, documents réglementaires et suivi conformité.",
    features: [
      "Planification de sessions",
      "Gestion des pièces justificatives",
      "Automatisation des rappels et relances",
      "Tableau de conformité opérationnelle",
    ],
    benefits: [
      "Moins de tâches administratives",
      "Suivi conformité simplifié",
      "Traçabilité renforcée",
    ],
    stack: ["Next.js", "Supabase", "Workflows", "Vercel"],
    timeline: ["Recueil besoins", "Architecture", "Déploiement", "Support évolutif"],
    screenshots: [
      { src: "/screens/konformup-dashboard.jpg", alt: "Dashboard gestion formation SST" },
      { src: "/screens/konformup-pipeline.jpg", alt: "Pipeline gestion formation SST" },
    ],
    ctaLabel: "Lancer un projet métier",
    ctaHref: "/contact",
  },
];

export default function RealisationsPage() {
  return (
    <div className="pb-20">
      <SharedPageHero
        badge="Réalisations"
        title="Des projets IA concrets qui créent de la valeur"
        description="Découvrez des études de cas réelles: enjeux business, solutions développées, fonctionnalités clés et résultats obtenus."
      />

      <Container>
        <div className="mt-10 space-y-8">
          {caseStudies.map((project, index) => (
            <article
              key={project.name}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-7"
            >
              <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cyan-200">Étude de cas {index + 1}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">{project.name}</h2>
                  <p className="mt-3 text-base leading-relaxed text-zinc-300">{project.summary}</p>

                  <div className="mt-5 grid gap-3 text-sm leading-relaxed text-zinc-300">
                    <Panel
                      icon={<ShieldCheck size={16} className="text-cyan-300" />}
                      title="Enjeux"
                      content={project.context}
                    />
                    <Panel
                      icon={<Sparkles size={16} className="text-cyan-300" />}
                      title="Solution"
                      content={project.solution}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-200">Fonctionnalités clés</h3>
                      <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                        {project.features.map((feature) => (
                          <li key={feature} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-zinc-200">Résultats</h3>
                      <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                        {project.benefits.map((benefit) => (
                          <li key={benefit} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-sm font-medium text-zinc-200">Timeline projet</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.timeline.map((step) => (
                        <span
                          key={step}
                          className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-sm font-medium text-zinc-200">Stack technologique</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={project.ctaHref}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
                  >
                    {project.ctaLabel}
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="space-y-3">
                  {project.screenshots.map((shot) => (
                    <div
                      key={shot.src}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 p-2"
                    >
                      <div className="mb-2 rounded-lg border border-white/10 bg-zinc-950/90 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-300/70" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            {index % 2 === 0 ? (
                              <PhoneCall size={12} className="text-cyan-300" />
                            ) : (
                              <ChartNoAxesCombined size={12} className="text-cyan-300" />
                            )}
                            app.corsaimanager.ai
                          </div>
                        </div>
                      </div>
                      <div className="relative overflow-hidden rounded-lg border border-white/10">
                        <Image
                          src={shot.src}
                          alt={shot.alt}
                          width={1200}
                          height={760}
                          className="aspect-[16/10] h-auto w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}

function Panel({
  icon,
  title,
  content,
}: {
  icon: ReactNode;
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm text-zinc-300">{content}</p>
    </div>
  );
}
