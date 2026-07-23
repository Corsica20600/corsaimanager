import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  ChartNoAxesCombined,
  Headset,
  PhoneCall,
  Sparkles,
  Workflow,
} from "lucide-react";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";
import { breadcrumbSchema, publicPageMetadata, seoImages } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Services IA pour PME",
  description:
    "Services IA pour PME : agents IA, assistant téléphonique, CRM intelligent, applications métier, automatisation et accompagnement stratégique.",
  path: "/services",
  image: seoImages.aiTeam,
});

const services = [
  {
    icon: PhoneCall,
    title: "Assistant IA Téléphonique",
    problem: "Appels non qualifiés, réponses inégales et suivi client irrégulier.",
    solution:
      "Un assistant vocal IA qui qualifie les appels, répond aux demandes fréquentes et synchronise les données dans votre CRM.",
    benefits: [
      "Réponse continue 24/7",
      "Qualification automatique des prospects",
      "Résumés d'appels exploitables pour vos équipes",
    ],
    features: ["Routing intelligent", "Scripts adaptatifs", "Résumé IA", "Intégration CRM"],
    screenshot: "/screens/voxiq-dashboard.jpg",
    cta: "/audit-ia",
  },
  {
    icon: ChartNoAxesCombined,
    title: "CRM IA Commercial",
    problem: "Pipeline dispersé, relances manuelles et opportunités mal priorisées.",
    solution:
      "Un CRM augmenté par l'IA pour centraliser le suivi, prioriser les actions et automatiser les relances commerciales.",
    benefits: [
      "Pipeline clair et pilotable",
      "Relances automatiques contextualisées",
      "Meilleure conversion des leads chauds",
    ],
    features: ["Scoring IA", "Séquences multicanal", "Vue 360 client", "Reporting live"],
    screenshot: "/screens/crm-dashboard.jpg",
    cta: "/audit-ia",
  },
  {
    icon: Workflow,
    title: "Automatisation Entreprise",
    problem: "Processus manuels chronophages entre ventes, support et opérations.",
    solution:
      "Workflows intelligents interconnectés pour automatiser les tâches répétitives et fluidifier vos opérations.",
    benefits: [
      "Réduction des frictions opérationnelles",
      "Exécution plus rapide des tâches",
      "Meilleure fiabilité des process",
    ],
    features: ["Orchestration API", "Déclencheurs métier", "Validation automatique", "Historique d'actions"],
    screenshot: "/screens/konformup-pipeline.jpg",
    cta: "/audit-ia",
  },
  {
    icon: Briefcase,
    title: "Applications Métier",
    problem: "Outils génériques peu adaptés à vos équipes et à vos objectifs terrain.",
    solution:
      "Des applications métier sur mesure avec interface premium, pensées pour vos flux réels et vos contraintes business.",
    benefits: [
      "Adoption rapide par vos équipes",
      "Gain de productivité concret",
      "Architecture évolutive",
    ],
    features: ["UX sur mesure", "Gestion des rôles", "Tableaux de bord", "Connecteurs métier"],
    screenshot: "/screens/fitai-dashboard.jpg",
    cta: "/contact",
  },
  {
    icon: Headset,
    title: "Accompagnement IA",
    problem: "Manque de méthode claire pour déployer l'IA sans risque ni perte de temps.",
    solution:
      "Un accompagnement stratégique et opérationnel pour cadrer, prioriser, déployer et optimiser vos solutions IA.",
    benefits: [
      "Vision claire des priorités",
      "Décisions guidées par ROI",
      "Montée en valeur continue",
    ],
    features: ["Audit initial", "Roadmap 90 jours", "Suivi KPI", "Optimisation continue"],
    screenshot: "/screens/konformup-dashboard.jpg",
    cta: "/audit-ia",
  },
];

const useCases = [
  {
    title: "Restaurants",
    text: "Automatisation des réservations, relances clients et réponses instantanées pour améliorer l'expérience et remplir davantage les créneaux.",
  },
  {
    title: "Salles de sport",
    text: "CRM IA pour gérer prospects et abonnés, activer les relances et piloter la conversion commerciale en continu.",
  },
  {
    title: "Centres de formation",
    text: "Qualification automatique des demandes, orchestration des inscriptions et suivi des candidats sans surcharge administrative.",
  },
  {
    title: "PME commerciales",
    text: "Centralisation des données clients, automatisation des mails/devis et accélération du cycle de vente.",
  },
];

const techs = ["OpenAI", "Next.js", "Supabase", "Vercel", "Stripe", "Twilio", "Make"];

const faqs = [
  {
    question: "Quel service IA choisir en premier ?",
    answer:
      "Le bon point de départ est l'audit IA : il identifie les tâches répétitives, les données disponibles et les gains les plus rapides avant de choisir CRM IA, assistant téléphonique ou application métier.",
  },
  {
    question: "Les automatisations remplacent-elles les équipes ?",
    answer:
      "Non. CorsaiManager conçoit des workflows qui préparent, classent et relancent, mais les décisions sensibles restent validées par vos équipes.",
  },
  {
    question: "Peut-on connecter les services IA à un CRM existant ?",
    answer:
      "Oui. L'approche consiste à connecter les outils déjà utilisés lorsque c'est possible, puis à créer une application métier uniquement si le besoin dépasse les limites du CRM actuel.",
  },
];

export default function ServicesPage() {
  const whatsappMsg = encodeURIComponent(
    "Bonjour, je souhaite échanger au sujet d’un audit IA pour mon entreprise."
  );
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
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services IA CorsaiManager",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.solution,
        provider: { "@type": "Organization", name: "CorsaiManager" },
      },
    })),
  };
  const breadcrumb = breadcrumbSchema([{ name: "Services", path: "/services" }]);

  return (
    <div className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, serviceSchema, breadcrumb]) }} />
      <SharedPageHero
        badge="Services"
        title="Solutions IA et automatisation pour PME"
        description="Applications métier, assistants IA, CRM intelligents et automatisations sur mesure pour gagner du temps et accélérer votre activité."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/audit-ia"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
          >
            Réserver un audit IA
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
          >
            Nous contacter
          </Link>
        </div>
      </SharedPageHero>

      <Container>
        <section className="mt-10 space-y-5">
          {services.map((service) => (
            <article key={service.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-7">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <service.icon className="text-cyan-300" size={20} />
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">{service.title}</h2>
                  </div>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-300">
                    <p><span className="text-zinc-400">Problème:</span> {service.problem}</p>
                    <p><span className="text-zinc-400">Solution:</span> {service.solution}</p>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {service.benefits.map((benefit) => (
                      <p key={benefit} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200">
                        {benefit}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span key={feature} className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-300">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={service.cta}
                    className="mt-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
                  >
                    Demander un audit IA
                  </Link>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-2">
                  <div className="mb-2 rounded-lg border border-white/10 bg-zinc-950/90 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-300/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
                      </div>
                      <Sparkles className="text-cyan-300" size={14} />
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-white/10">
                    <Image
                      src={service.screenshot}
                      alt={`Aperçu ${service.title}`}
                      width={1200}
                      height={760}
                      className="aspect-[16/10] h-auto w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">
              Choisir le bon service
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">
              Quels services IA apportent un ROI rapide à une PME ?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Les meilleurs projets commencent rarement par une refonte complète. Ils ciblent
              une friction précise : appels non traités, relances oubliées, données dispersées,
              devis lents ou reporting manuel.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              CorsaiManager transforme ces irritants en services IA mesurables : audit initial,
              assistant téléphonique, CRM IA, automatisation commerciale ou application métier
              sur mesure.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
            <h3 className="text-xl font-semibold text-zinc-100">Méthode de priorisation</h3>
            <div className="mt-5 space-y-3">
              {[
                "Mesurer le temps perdu chaque semaine sur les tâches répétitives.",
                "Identifier les données déjà disponibles dans CRM, emails, appels ou formulaires.",
                "Choisir un premier workflow simple, validable et relié à un indicateur business.",
                "Déployer progressivement après validation des résultats.",
              ].map((item) => (
                <p key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-zinc-300">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Services IA complémentaires
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
            Les services CorsaiManager sont pensés pour se combiner : l&apos;audit priorise,
            l&apos;équipe d&apos;agents IA prépare les actions, le CRM structure le suivi et les
            automatisations exécutent les tâches répétitives.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              ["/agents-ia", "Équipe IA", "Agents supervisés pour prospection, SEO, marketing et CRM."],
              ["/realisations", "Réalisations", "Voir les cas concrets et captures des projets."],
              ["/blog", "Blog IA", "Lire les conseils pour choisir les bons cas d'usage."],
              ["/contact", "Contact", "Cadrer votre besoin avec CorsaiManager."],
            ].map(([href, title, text]) => (
              <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/50">
                <h3 className="font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">Cas d&apos;usage</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-xl font-medium text-zinc-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
            FAQ services IA
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-zinc-100">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-center text-sm font-medium uppercase tracking-[0.22em] text-zinc-400">
            Technologies modernes et évolutives
          </h2>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-3 backdrop-blur sm:p-4">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {techs.map((tech) => (
                <span
                  key={tech}
                  className="rounded-xl border border-white/10 bg-zinc-900/65 px-4 py-3 text-sm font-semibold tracking-wide text-zinc-200/90 transition duration-300 hover:border-cyan-300/40 hover:bg-cyan-300/[0.08] hover:shadow-[0_0_22px_rgba(34,211,238,0.24)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center sm:p-12">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
              Prêt à automatiser votre entreprise ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
              Réservez un audit IA gratuit et identifiez les gains possibles pour votre activité.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/audit-ia"
                className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
              >
                Audit IA Gratuit
              </Link>
              <a
                href={`https://wa.me/33665018730?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
