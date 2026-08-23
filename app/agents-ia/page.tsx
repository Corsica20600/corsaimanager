/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";
import {
  breadcrumbSchema,
  publicPageMetadata,
  seoImages,
  softwareApplicationSchema,
} from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Équipe d'agents IA pour PME",
  description:
    "Équipe d'agents IA CorsaiManager : prospection, qualification commerciale, marketing, SEO, téléphone et orchestration supervisée par validation humaine.",
  path: "/agents-ia",
  image: seoImages.agents,
});

const agents = [
  {
    name: "Léo",
    role: "Chef d'équipe IA",
    image: "/screens/ai-agent-leo.png",
    color: "violet",
    mission: "Priorise les tâches, arbitre les recommandations et coordonne les autres agents.",
    useCases: ["Briefing quotidien", "Priorisation des actions", "Validation des recommandations"],
  },
  {
    name: "Emma",
    role: "Agent Commercial",
    image: "/screens/ai-agent-emma.png",
    color: "emerald",
    mission: "Qualifie les prospects, détecte les signaux d'achat et prépare les relances.",
    useCases: ["Scoring commercial", "Brouillons email", "Relances à valider"],
  },
  {
    name: "Noah",
    role: "Agent Marketing",
    image: "/screens/ai-agent-noah.png",
    color: "sky",
    mission: "Transforme les signaux marché en contenus, campagnes et messages commerciaux.",
    useCases: ["Angles de campagne", "Posts LinkedIn", "Nurturing multicanal"],
  },
  {
    name: "Sophie",
    role: "Agent SEO",
    image: "/screens/ai-agent-sophie.png",
    color: "amber",
    mission: "Analyse les pages, Search Console et Analytics pour proposer les priorités SEO.",
    useCases: ["Audit SEO", "Pages prioritaires", "Optimisations à valider"],
  },
  {
    name: "Marc",
    role: "Agent Téléphone",
    image: "/screens/ai-agent-marc.png",
    color: "fuchsia",
    mission: "Prépare les appels, scripts et comptes rendus sans déclencher d'action non validée.",
    useCases: ["Scripts d'appel", "Qualification orale", "Prise de rendez-vous"],
  },
  {
    name: "Oscar",
    role: "Agent Prospection",
    image: "/screens/ai-agent-oscar.png",
    color: "cyan",
    mission: "Nettoie, enrichit et prépare les lots de prospection avant import CRM.",
    useCases: ["OpenClaw", "Déduplication", "Enrichissement prospects"],
  },
];

const workflow = [
  "Les agents détectent les opportunités et préparent les actions.",
  "L'humain garde la main sur les validations importantes.",
  "Les actions validées sont synchronisées avec le CRM, les emails ou les outils métier.",
  "Les résultats alimentent le tableau de bord pour améliorer les prochaines décisions.",
];

const faqs = [
  {
    question: "Les agents IA envoient-ils des emails automatiquement ?",
    answer:
      "Non. Les agents préparent les brouillons et recommandations. L'envoi reste soumis à validation humaine pour garder le contrôle sur la relation client.",
  },
  {
    question: "Peut-on connecter les agents au CRM CorsaiManager ?",
    answer:
      "Oui. Les agents peuvent créer des prospects, enrichir les données, préparer des actions commerciales et remonter les éléments à valider dans le CRM.",
  },
  {
    question: "Quels agents installer en premier dans une PME ?",
    answer:
      "Le meilleur départ est souvent Oscar pour la prospection, Emma pour la qualification commerciale et Léo pour l'orchestration des priorités.",
  },
];

const seoQuestions = [
  {
    title: "Quel agent IA choisir pour commencer ?",
    text:
      "Une PME gagne souvent à démarrer par Oscar pour structurer la prospection, Emma pour qualifier les opportunités et Léo pour prioriser les décisions à valider.",
  },
  {
    title: "Comment garder le contrôle avec plusieurs agents IA ?",
    text:
      "Chaque agent prépare une recommandation traçable, mais les emails, appels, exports CRM et publications restent soumis à validation humaine avant exécution.",
  },
  {
    title: "Quels résultats attendre d'une équipe d'agents IA ?",
    text:
      "L'objectif est de réduire les tâches répétitives, améliorer la régularité commerciale et transformer les signaux marketing, SEO ou CRM en actions concrètes.",
  },
];

export default function AgentsIaPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  const softwareSchema = softwareApplicationSchema({
    name: "AI-Team CorsaiManager",
    description:
      "Cockpit d'agents IA supervisés pour piloter prospection, qualification commerciale, marketing, SEO et actions CRM.",
    path: "/agents-ia",
    image: seoImages.agents.url,
  });
  const breadcrumb = breadcrumbSchema([{ name: "Équipe IA", path: "/agents-ia" }]);

  return (
    <div className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, softwareSchema, breadcrumb]) }} />
      <SharedPageHero
        badge="Agents IA CorsaiManager"
        title="Une équipe d'agents IA pour piloter la prospection, le marketing et le CRM"
        description="AI-Team réunit plusieurs agents spécialisés : chacun a un rôle métier précis, propose des actions concrètes et laisse les décisions sensibles à validation humaine."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["6", "agents spécialisés"],
            ["100%", "supervision humaine"],
            ["CRM", "connecté à CorsaiManager"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-3xl font-semibold text-cyan-100">{value}</p>
              <p className="mt-2 text-sm text-zinc-300">{label}</p>
            </div>
          ))}
        </div>
      </SharedPageHero>

      <Container>
        <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-3 shadow-[0_0_60px_rgba(34,211,238,0.16)]">
            <div className="mb-3 rounded-xl border border-white/10 bg-zinc-950/90 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
                </div>
                <p className="text-xs text-zinc-500">AI-Team cockpit</p>
              </div>
            </div>
            <Image
              src="/screens/ai-team-dashboard.png"
              alt="Dashboard AI-Team avec agents IA, tâches et recommandations à valider"
              width={1800}
              height={1000}
              priority
              className="rounded-2xl border border-white/10 object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Cockpit supervisé</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Des agents utiles, pas une boîte noire</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Chaque agent travaille sur un périmètre clair : prospection, qualification, SEO, marketing, appels ou coordination. Les recommandations remontent dans un tableau de bord, avec les actions à valider avant exécution.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Cette approche évite l'effet boîte noire : les agents IA apportent de la vitesse,
              mais la PME garde la décision commerciale, la cohérence du message et la maîtrise
              des données envoyées vers le CRM.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                "Validation humaine avant les actions sensibles",
                "Connexion possible au CRM, à OpenClaw, Google Analytics, Search Console et aux emails",
                "Traçabilité des tâches, recommandations et résultats",
              ].map((item) => (
                <p key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-300" size={16} />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Équipe IA</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Les agents disponibles</h2>
            </div>
            <Link href="/realisations" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-100">
              Voir les réalisations
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <article key={agent.name} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/35">
                <div className="flex items-center gap-4">
                  <Image
                    src={agent.image}
                    alt={`Portrait de ${agent.name}, ${agent.role}`}
                    width={96}
                    height={96}
                    className={`h-20 w-20 rounded-full border object-cover ${ringClass(agent.color)}`}
                  />
                  <div>
                    <h3 className="text-2xl font-semibold text-zinc-100">{agent.name}</h3>
                    <p className={textClass(agent.color)}>{agent.role}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-zinc-300">{agent.mission}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {agent.useCases.map((useCase) => (
                    <span key={useCase} className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-300">
                      {useCase}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Où connecter cette équipe IA ?
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
            Les agents IA prennent de la valeur quand ils sont reliés à vos outils métier :
            CRM, prospection, téléphone, contenus, analytics et automatisations.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              ["/crm-ia-pme", "CRM IA", "Centraliser prospects, relances et priorités commerciales."],
              ["/automatisation-entreprise", "Automatisation", "Transformer les recommandations en workflows validés."],
              ["/assistant-ia-telephone", "Téléphone IA", "Qualifier les appels et créer des actions de suivi."],
              ["/audit-ia", "Audit IA", "Choisir les agents à déployer en premier."],
            ].map(([href, title, text]) => (
              <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/50">
                <h3 className="font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Du signal à l'action validée</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Le principe est simple : les agents accélèrent la préparation, mais l'entreprise garde la décision. C'est le bon équilibre pour automatiser sans perdre la maîtrise commerciale.
            </p>
            <div className="mt-6 space-y-3">
              {workflow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-zinc-900/55 p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-3">
            <Image
              src="/screens/ai-team-agents.png"
              alt="Roster des agents IA Léo, Emma, Noah, Sophie, Marc et Oscar"
              width={1800}
              height={1000}
              className="rounded-2xl border border-white/10 object-cover"
            />
          </div>
        </section>

        <section className="mt-14">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Questions clients</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">
              Comment utiliser des agents IA dans une PME sans perdre la main ?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Les recherches autour des agents IA montrent une attente simple : comprendre
              quoi automatiser, où placer la validation humaine et comment mesurer l'impact
              commercial réel.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {seoQuestions.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-xl font-semibold text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Workflow,
              title: "Orchestration",
              text: "Les agents travaillent ensemble : Oscar prépare les prospects, Emma qualifie, Noah nourrit, Sophie améliore la visibilité et Léo priorise.",
            },
            {
              icon: ShieldCheck,
              title: "Contrôle humain",
              text: "Les emails, campagnes et actions sensibles restent à valider. L'IA accélère, elle ne remplace pas le pilotage.",
            },
            {
              icon: Sparkles,
              title: "Déploiement PME",
              text: "L'équipe peut être adaptée à votre secteur, vos outils existants et vos objectifs de croissance.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <item.icon className="text-cyan-300" size={22} />
              <h3 className="mt-4 text-xl font-semibold text-zinc-100">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
            FAQ agents IA pour PME
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
                <h3 className="text-lg font-semibold text-zinc-100">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Vous voulez une équipe IA adaptée à votre activité ?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            On part de vos tâches répétitives, de vos outils actuels et des décisions que vous voulez garder à la main.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/audit-ia#audit-request" className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950">
              Demander un audit IA
            </Link>
            <Link href="/contact" className="inline-flex justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100">
              Parler des agents IA
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}

function ringClass(color: string) {
  const classes: Record<string, string> = {
    amber: "border-amber-300/45 shadow-[0_0_24px_rgba(252,211,77,0.22)]",
    cyan: "border-cyan-300/45 shadow-[0_0_24px_rgba(34,211,238,0.22)]",
    emerald: "border-emerald-300/45 shadow-[0_0_24px_rgba(52,211,153,0.22)]",
    fuchsia: "border-fuchsia-300/45 shadow-[0_0_24px_rgba(217,70,239,0.22)]",
    sky: "border-sky-300/45 shadow-[0_0_24px_rgba(56,189,248,0.22)]",
    violet: "border-violet-300/45 shadow-[0_0_24px_rgba(167,139,250,0.22)]",
  };

  return classes[color] ?? classes.cyan;
}

function textClass(color: string) {
  const classes: Record<string, string> = {
    amber: "text-amber-200",
    cyan: "text-cyan-200",
    emerald: "text-emerald-200",
    fuchsia: "text-fuchsia-200",
    sky: "text-sky-200",
    violet: "text-violet-200",
  };

  return classes[color] ?? classes.cyan;
}
