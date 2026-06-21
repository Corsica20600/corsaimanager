/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Link2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CalendlyInline } from "@/components/calendly/calendly-inline";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";
import { CALENDLY_URL, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_LINK, FACEBOOK_URL, LINKEDIN_URL, WHATSAPP_URL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact agence IA pour PME",
  description:
    "Contactez CorsaiManager pour un audit IA gratuit, un projet CRM IA, assistant téléphonique IA, application métier ou automatisation d'entreprise.",
  alternates: {
    canonical: "https://corsaimanager.com/contact",
  },
};

const contactFaq = [
  {
    question: "Pourquoi contacter CorsaiManager ?",
    answer:
      "Pour cadrer un projet IA concret : audit IA, automatisation de processus, CRM IA, assistant téléphonique IA ou application métier sur mesure pour PME.",
  },
  {
    question: "L'audit IA est-il adapté à une petite PME ?",
    answer:
      "Oui. L'audit sert justement à identifier un premier périmètre rentable, simple à tester et mesurable avant d'investir dans une solution plus large.",
  },
  {
    question: "CorsaiManager intervient-il partout en France ?",
    answer:
      "Oui. CorsaiManager est basé en Corse et accompagne les PME partout en France avec des échanges à distance, des ateliers de cadrage et un suivi opérationnel.",
  },
  {
    question: "Que faut-il préparer avant le premier échange ?",
    answer:
      "Il suffit de préparer vos objectifs, vos outils actuels, vos points de friction et les tâches répétitives qui ralentissent vos équipes.",
  },
];

export default function ContactPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: contactFaq.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SharedPageHero
        badge="Contact"
        title="Contactez CorsaiManager pour votre projet IA"
        description="Audit IA, CRM intelligent, assistant téléphonique IA, applications métier ou automatisation : partagez vos objectifs et obtenez un cadrage clair."
      />
      <Container>
        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Pourquoi contacter CorsaiManager ?</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              CorsaiManager aide les PME françaises à transformer une idée IA en projet utile. Le premier échange sert à comprendre vos contraintes, vos outils, vos flux commerciaux et les tâches qui prennent trop de temps. L'objectif n'est pas de vendre une solution générique, mais de déterminer si un audit IA, un CRM IA, un assistant téléphonique ou une application métier peut produire un gain réel.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Basé en Corse, CorsaiManager accompagne les PME partout en France avec une méthode simple : diagnostic, priorisation, prototype, déploiement et mesure des résultats.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
            <h2 className="text-2xl font-semibold text-zinc-100">Audit IA gratuit</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              L'audit IA permet d'identifier les automatisations prioritaires, les données à connecter, les risques à éviter et les gains possibles. C'est la meilleure première étape si vous hésitez entre CRM IA, assistant téléphonique, application métier ou automatisation des processus.
            </p>
            <Link href="/audit-ia" className="mt-5 inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-2.5 text-sm font-semibold text-zinc-950">
              Demander un audit IA gratuit
            </Link>
          </div>
        </section>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group rounded-xl border border-white/10 bg-zinc-900/70 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07] hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
            >
              <p className="flex items-center gap-2 text-sm text-zinc-400"><Mail size={16} className="text-cyan-300" /> Email</p>
              <p className="mt-2 text-zinc-100 transition group-hover:text-cyan-100">{CONTACT_EMAIL}</p>
            </a>
            <a
              href={`tel:${CONTACT_PHONE_LINK}`}
              className="group rounded-xl border border-white/10 bg-zinc-900/70 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07] hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
            >
              <p className="flex items-center gap-2 text-sm text-zinc-400"><Phone size={16} className="text-cyan-300" /> Téléphone</p>
              <p className="mt-2 text-zinc-100 transition group-hover:text-cyan-100">{CONTACT_PHONE_DISPLAY}</p>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-white/10 bg-zinc-900/70 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07] hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
            >
              <p className="flex items-center gap-2 text-sm text-zinc-400"><MessageCircle size={16} className="text-cyan-300" /> WhatsApp</p>
              <p className="mt-2 text-zinc-100 transition group-hover:text-cyan-100">Ouvrir la conversation</p>
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-white/10 bg-zinc-900/70 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07] hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
            >
              <p className="flex items-center gap-2 text-sm text-zinc-400"><Link2 size={16} className="text-cyan-300" /> LinkedIn</p>
              <p className="mt-2 text-zinc-100 transition group-hover:text-cyan-100">Voir la page pro</p>
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-white/10 bg-zinc-900/70 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07] hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
            >
              <p className="flex items-center gap-2 text-sm text-zinc-400"><Link2 size={16} className="text-cyan-300" /> Facebook</p>
              <p className="mt-2 text-zinc-100 transition group-hover:text-cyan-100">Voir la page</p>
            </a>
          </div>

          <div className="mt-6 grid gap-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-5 md:grid-cols-3">
            <p className="flex items-center gap-2 text-sm text-zinc-200"><Clock3 size={15} className="text-cyan-200" /> Lun-Ven: 9h-18h</p>
            <p className="flex items-center gap-2 text-sm text-zinc-200"><MapPin size={15} className="text-cyan-200" /> Corse / France</p>
            <p className="flex items-center gap-2 text-sm text-zinc-200"><MessageCircle size={15} className="text-cyan-200" /> Réponse sous 24h</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
            >
              Planifier un échange
            </a>
            <Link
              href="/audit-ia"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Audit IA gratuit
            </Link>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Déroulement d&apos;un accompagnement</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              "Cadrage du besoin, des objectifs et des outils existants.",
              "Audit des processus, des données et des tâches répétitives.",
              "Priorisation des actions selon impact, effort et ROI.",
              "Déploiement progressif avec mesure des résultats.",
            ].map((item) => (
              <article key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-zinc-300">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Solutions liées</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {[
              ["/audit-ia", "Audit IA"],
              ["/crm-ia-pme", "CRM IA PME"],
              ["/assistant-ia-telephone", "Assistant téléphonique IA"],
              ["/applications-metier", "Applications métier"],
              ["/automatisation-entreprise", "Automatisation entreprise"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/50 hover:text-cyan-100">
                {label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Réservez directement un échange de 30 minutes
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Vous pouvez aussi réserver immédiatement un créneau pour parler de votre audit IA.
          </p>
          <div className="mt-6">
            <CalendlyInline url={CALENDLY_URL} minHeight={760} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Questions fréquentes</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {contactFaq.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
                <h3 className="text-lg font-semibold text-zinc-100">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
