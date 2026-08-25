/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { breadcrumbSchema, publicPageMetadata, seoImages } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Transformation digitale PME avec IA",
  description:
    "Transformation digitale PME : audit IA, agents IA, automatisation, CRM IA, applications métier, outils connectés et feuille de route orientée ROI.",
  path: "/transformation-digitale-pme",
  image: seoImages.aiTeam,
});

const links = [
  ["/audit-ia", "Audit IA"],
  ["/crm-ia-pme", "CRM IA"],
  ["/agents-ia", "Agents IA"],
  ["/automatisation-entreprise", "Automatisation"],
  ["/applications-metier", "Applications métier"],
  ["/agence-ia-france", "Accompagnement IA pour PME"],
  ["/contact", "Contact"],
];

const faq = [
  ["Qu'est-ce que la transformation digitale d'une PME ?", "C'est l'amélioration des processus, outils, données et usages pour rendre l'entreprise plus efficace, plus fiable et plus pilotable."],
  ["Quel est le lien entre transformation digitale et IA ?", "L'IA devient utile lorsque les processus et données sont suffisamment structurés. Elle accélère ensuite les relances, les réponses, le reporting ou la qualification."],
  ["Par où commencer ?", "Par un audit des processus, des tâches répétitives, des outils existants et des irritants qui coûtent du temps chaque semaine."],
  ["Faut-il remplacer tous les logiciels ?", "Non. CorsaiManager privilégie d'abord les connexions, automatisations et améliorations ciblées avant de proposer une application métier si nécessaire."],
  ["Comment mesurer le ROI ?", "Avec le temps gagné, les erreurs évitées, les délais réduits, les conversions commerciales, la qualité du suivi et la satisfaction des équipes."],
  ["CorsaiManager accompagne-t-il les PME partout en France ?", "Oui. Basé en Corse, CorsaiManager accompagne les PME partout en France avec des ateliers à distance et un suivi opérationnel."],
];

export default function TransformationDigitalePmePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Transformation digitale PME",
    provider: { "@type": "Organization", name: "CorsaiManager", url: "https://www.corsaimanager.com" },
    areaServed: "France",
    serviceType: "Transformation digitale, automatisation IA et applications métier",
    url: "https://www.corsaimanager.com/transformation-digitale-pme",
  };
  const breadcrumb = breadcrumbSchema([{ name: "Transformation digitale PME", path: "/transformation-digitale-pme" }]);

  return (
    <main className="pb-24 pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, serviceSchema, breadcrumb]) }} />
      <Container>
        <section className="grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Pill>Transformation digitale PME</Pill>
            <h1 className="mt-6 max-w-5xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Transformation digitale PME : structurer vos outils, vos données et vos automatisations
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-300">
              La transformation digitale d'une PME n'est pas une course aux logiciels. C'est une démarche progressive pour rendre les processus plus fiables, les données plus accessibles et les équipes plus efficaces. CorsaiManager aide les PME françaises à passer d'un fonctionnement dispersé à un système clair : audit IA, CRM IA, automatisation, applications métier et tableaux de bord.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Une transformation digitale réussie commence par les irritants réels : relances oubliées, documents refaits à la main, données clients éclatées, appels non qualifiés, reporting manuel ou outils qui ne communiquent pas entre eux.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/audit-ia#audit-request" className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950">
                Lancer un audit IA
              </Link>
              <Link href="/agence-ia-france" className="inline-flex justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100">
                Découvrir notre agence IA
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Maillage prioritaire</p>
            <div className="mt-5 grid gap-3">
              {links.map(([href, label]) => (
                <Link key={href} href={href} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 transition hover:border-cyan-300/40">
                  {label}
                  <ArrowRight size={15} className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Pourquoi la transformation digitale devient prioritaire</h2>
          <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-base leading-relaxed text-zinc-300">
            <p>Une PME peut très bien fonctionner avec des outils simples pendant plusieurs années. Le problème apparaît lorsque l'activité grandit, que les canaux se multiplient et que les équipes passent trop de temps à compenser les limites du système. Les informations clients restent dans les emails, les relances sont faites à la main, les tableaux de bord prennent du retard et les décisions reposent sur des données incomplètes.</p>
            <p>La transformation digitale consiste à remettre de l'ordre dans ce fonctionnement. Elle ne suppose pas forcément de remplacer tous les outils. Elle peut commencer par connecter un formulaire au CRM, automatiser une relance, créer un dashboard, centraliser les demandes ou développer une petite application métier pour sécuriser un processus critique.</p>
            <p>L'intelligence artificielle accélère cette démarche lorsque les bases sont claires. Elle peut classer une demande, générer une réponse, résumer un appel, proposer une prochaine action ou détecter une opportunité qui stagne. Mais elle doit rester intégrée au processus métier, avec des règles compréhensibles et des validations humaines lorsque c'est nécessaire.</p>
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Les piliers d'une transformation digitale PME</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Audit IA", "Identifier les tâches répétitives, les outils existants, les données disponibles et les opportunités d'automatisation les plus rentables.", "/audit-ia"],
              ["CRM IA", "Centraliser prospects, clients, relances, devis et prochaines actions pour rendre le suivi commercial plus fiable.", "/crm-ia-pme"],
              ["Automatisation", "Connecter les outils et automatiser les actions répétitives : emails, documents, notifications, reporting et synchronisation.", "/automatisation-entreprise"],
              ["Applications métier", "Créer un outil adapté lorsque les logiciels standards ne suffisent plus ou imposent trop de contournements.", "/applications-metier"],
            ].map(([title, text, href]) => (
              <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 transition hover:border-cyan-300/45">
                <CheckCircle2 className="text-cyan-300" size={20} />
                <h3 className="mt-4 text-xl font-semibold text-zinc-100">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Méthode et ROI</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Diagnostiquer les processus, les irritants et les données qui ralentissent l'entreprise.",
              "Prioriser les projets selon l'impact, l'effort, le risque et le potentiel de ROI.",
              "Déployer progressivement avec mesures : temps gagné, erreurs évitées, relances, conversions et qualité du suivi.",
            ].map((item) => (
              <article key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-zinc-300">{item}</article>
            ))}
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">De l'audit IA à la feuille de route digitale</h2>
          <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-base leading-relaxed text-zinc-300">
            <p>Une feuille de route digitale utile ne liste pas seulement des outils à acheter. Elle hiérarchise les problèmes à résoudre. Une PME peut avoir besoin d'un CRM IA pour suivre ses prospects, d'un assistant téléphonique IA pour ne plus perdre d'appels, d'une automatisation pour envoyer des relances ou d'une application métier pour remplacer plusieurs tableurs. L'audit IA permet de placer ces sujets dans le bon ordre.</p>
            <p>La priorité est souvent donnée aux actions qui combinent impact rapide et faible complexité. Une relance automatisée, une notification interne, un résumé d'appel ou un tableau de bord simple peuvent déjà transformer le quotidien. Les projets plus structurants, comme une application métier sur mesure, peuvent ensuite être cadrés avec plus de données et de retours terrain.</p>
            <p>CorsaiManager aide les dirigeants à éviter deux pièges : tout faire en même temps, ou rester bloqué dans une réflexion trop longue. La bonne approche consiste à choisir un premier périmètre, tester, mesurer, apprendre, puis élargir. Cette progression rend la transformation digitale plus concrète et plus facile à accepter par les équipes.</p>
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Exemples de chantiers digitaux pour PME</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Centraliser les leads issus du site, du téléphone, des emails et des réseaux dans un CRM IA pour éviter les pertes d'information.",
              "Automatiser les relances après devis, rendez-vous ou demande entrante pour améliorer la régularité commerciale.",
              "Créer une application métier pour suivre dossiers, documents, statuts, tâches et indicateurs dans une interface unique.",
              "Déployer un assistant téléphonique IA capable de qualifier les appels, résumer les demandes et déclencher une tâche de rappel.",
            ].map((item) => (
              <article key={item} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-sm leading-relaxed text-zinc-300">{item}</article>
            ))}
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">FAQ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faq.map(([question, answer]) => (
              <article key={question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-zinc-100">{question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Construisez une transformation digitale utile</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">Commencez par un audit IA pour prioriser les actions à plus fort impact et éviter une transformation trop lourde.</p>
          <Link href="/contact" className="mt-8 inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950">
            Contacter CorsaiManager
          </Link>
        </section>
      </Container>
    </main>
  );
}
