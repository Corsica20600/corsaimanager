/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChartNoAxesCombined, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";
import { breadcrumbSchema, publicPageMetadata, seoImages } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Réalisations IA pour PME",
  description:
    "Réalisations IA pour PME : études de cas CRM IA, agents IA, assistant téléphonique IA, applications métier, automatisation, gains de temps et ROI.",
  path: "/realisations",
  image: seoImages.aiTeam,
});

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
    name: "AI-Team",
    summary:
      "Équipe d'agents IA supervisés pour coordonner prospection, qualification commerciale, marketing, SEO et actions CRM.",
    context:
      "Les actions commerciales, SEO et marketing étaient réparties entre plusieurs outils, avec un besoin fort de validation humaine avant toute action sensible.",
    solution:
      "Création d'un cockpit d'agents IA spécialisés : Léo orchestre, Oscar prépare la prospection, Emma qualifie, Noah prépare les campagnes, Sophie analyse le SEO et Marc assiste les appels.",
    features: [
      "Agents IA spécialisés par métier",
      "Recommandations à valider avant exécution",
      "Connexion CorsaiManager, OpenClaw, Search Console et Analytics",
      "Pilotage des tâches, recommandations et indicateurs",
    ],
    benefits: [
      "Meilleure coordination entre prospection, CRM et marketing",
      "Actions préparées plus vite sans perte de contrôle",
      "Vision claire des priorités à traiter",
    ],
    stack: ["Next.js", "OpenAI", "Neon", "Prisma", "CorsaiManager API"],
    timeline: ["Cadrage agents", "Cockpit IA", "Connecteurs", "Validation humaine"],
    screenshots: [
      { src: "/screens/ai-team-dashboard.png", alt: "Dashboard AI-Team avec agents IA supervisés" },
      { src: "/screens/ai-team-agents.png", alt: "Roster des agents IA AI-Team" },
    ],
    ctaLabel: "Découvrir les agents IA",
    ctaHref: "/agents-ia",
  },
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

const realisationsFaq = [
  {
    question: "Quels types de projets IA CorsaiManager réalise-t-il ?",
    answer:
      "CorsaiManager réalise des audits IA, CRM intelligents, assistants téléphoniques IA, applications métier sur mesure, automatisations commerciales et workflows connectés pour PME.",
  },
  {
    question: "Comment mesurer le ROI d'une réalisation IA ?",
    answer:
      "Le ROI se mesure avec le temps gagné, les relances automatisées, la réduction des erreurs, l'amélioration du taux de réponse, la qualité du suivi et les conversions générées.",
  },
  {
    question: "Une PME peut-elle commencer par un petit projet ?",
    answer:
      "Oui. Les meilleurs projets commencent souvent par un périmètre court : qualification de leads, relance de devis, résumé d'appel ou tableau de bord opérationnel.",
  },
  {
    question: "Les réalisations peuvent-elles être adaptées à d'autres secteurs ?",
    answer:
      "Oui. Les principes sont réutilisables : centraliser les données, automatiser les tâches répétitives, assister les équipes et mesurer les résultats métier.",
  },
];

export default function RealisationsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: realisationsFaq.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Réalisations IA CorsaiManager",
    itemListElement: caseStudies.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.name,
        description: project.summary,
        provider: {
          "@type": "Organization",
          name: "CorsaiManager",
        },
      },
    })),
  };
  const breadcrumb = breadcrumbSchema([{ name: "Réalisations", path: "/realisations" }]);

  return (
    <div className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, creativeWorkSchema, breadcrumb]) }} />
      <SharedPageHero
        badge="Réalisations"
        title="Réalisations IA pour PME : CRM, assistants, applications et automatisation"
        description="Découvrez des études de cas IA concrètes : enjeux business, solutions développées, gains de temps, ROI, bénéfices métiers et cas d'usage réutilisables."
      />

      <Container>
        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Études de cas IA orientées résultats</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Une réalisation IA réussie ne se résume pas à une interface ou à une démonstration technique. Elle doit résoudre un problème métier : mieux qualifier les demandes, relancer les prospects, centraliser les données, produire des documents, répondre aux appels ou donner une vision claire des indicateurs.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Les projets présentés montrent comment CorsaiManager transforme l'intelligence artificielle en outils opérationnels pour PME : CRM IA, assistant téléphonique IA, application métier, automatisation commerciale et workflows connectés.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
            <h2 className="text-2xl font-semibold text-zinc-100">Résultats observés</h2>
            <div className="mt-5 grid gap-3 text-sm text-zinc-300">
              {["Temps administratif réduit", "Relances plus régulières", "Meilleure qualification des leads", "Pipeline commercial plus lisible", "Données centralisées", "ROI suivi par indicateurs"].map((item) => (
                <p key={item} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">{item}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Cas d&apos;usage IA couverts</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {[
              ["/crm-ia-pme", "CRM IA", "Scoring, relances et pipeline intelligent."],
              ["/agents-ia", "Agents IA", "Équipe IA supervisée pour préparer les actions."],
              ["/assistant-ia-telephone", "Assistant téléphonique IA", "Réponse, qualification et résumé d'appels."],
              ["/applications-metier", "Applications métier", "Outils internes, dashboards et portails."],
              ["/automatisation-entreprise", "Automatisation", "Workflows, documents et reporting."],
            ].map(([href, title, text]) => (
              <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/50">
                <h3 className="font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{text}</p>
              </Link>
            ))}
          </div>
        </section>

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

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Bénéfices métiers et ROI</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Gain de temps : réduction des tâches répétitives, des relances manuelles et des doubles saisies.",
              "ROI commercial : meilleur suivi des prospects, réactivité accrue et opportunités moins souvent oubliées.",
              "Qualité opérationnelle : données centralisées, règles plus fiables et tableaux de bord plus lisibles.",
            ].map((item) => (
              <article key={item} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-sm leading-relaxed text-zinc-300">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Questions fréquentes</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {realisationsFaq.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-zinc-100">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Vous voulez créer une réalisation IA rentable ?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            Commencez par un audit IA pour identifier le bon cas d'usage, le bon périmètre et les indicateurs de ROI à suivre.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/audit-ia" className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950">
              Demander un audit IA
            </Link>
            <Link href="/contact" className="inline-flex justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100">
              Contacter CorsaiManager
            </Link>
          </div>
        </section>
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
