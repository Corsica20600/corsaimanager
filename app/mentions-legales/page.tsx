/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Mail, Phone } from "lucide-react";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_LINK } from "@/lib/contact";
import { breadcrumbSchema, publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Mentions légales",
  description:
    "Mentions légales de CorsaiManager : éditeur du site, contact, hébergement, propriété intellectuelle, données personnelles et responsabilités.",
  path: "/mentions-legales",
});

const updatedAt = "28 juillet 2026";

const legalSections = [
  {
    title: "Éditeur du site",
    items: [
      ["Site", "https://corsaimanager.com"],
      ["Nom commercial", "CorsaiManager"],
      ["Statut", "Auto-entrepreneur"],
      ["Activité", "Automatisation IA, CRM IA, agents IA et applications métier pour PME"],
      ["Adresse professionnelle", "3175 Strada di a Marana, 20620 Biguglia, France"],
      ["Zone d'intervention", "Corse et France"],
      ["Responsable de publication", "CorsaiManager"],
      ["Email", CONTACT_EMAIL],
      ["Téléphone", CONTACT_PHONE_DISPLAY],
    ],
  },
  {
    title: "Informations administratives à compléter",
    items: [
      ["SIRET / SIREN", "en cours d'attribution"],
      ["RCS / RM", "à compléter si applicable"],
      ["Numéro de TVA intracommunautaire", "non applicable ou à compléter si attribué"],
    ],
  },
  {
    title: "Hébergement",
    items: [
      ["Hébergeur", "Vercel Inc."],
      ["Adresse", "440 N Barranca Avenue #4133, Covina, CA 91723, United States"],
      ["Site", "https://vercel.com"],
    ],
  },
];

export default function MentionsLegalesPage() {
  const breadcrumb = breadcrumbSchema([{ name: "Mentions légales", path: "/mentions-legales" }]);

  return (
    <div className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <SharedPageHero
        badge="Informations légales"
        title="Mentions légales"
        description="Les informations essentielles sur l'éditeur, l'hébergement, la propriété intellectuelle et les responsabilités liées au site CorsaiManager."
      />

      <Container>
        <section className="mt-10 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-6 text-sm leading-relaxed text-amber-50 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-200" size={22} />
            <div>
              <h2 className="text-xl font-semibold text-amber-50">À finaliser avec les informations juridiques exactes</h2>
              <p className="mt-3 text-amber-100/90">
                Cette page contient les mentions connues à ce jour. Le SIRET/SIREN est indiqué comme "en cours d'attribution" et devra être remplacé par le numéro officiel dès réception. Les champs marqués "à compléter" doivent être ajustés si une inscription RCS/RM ou un numéro de TVA devient applicable.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {legalSections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 backdrop-blur">
              <h2 className="text-xl font-semibold text-zinc-100">{section.title}</h2>
              <dl className="mt-5 space-y-4">
                {section.items.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-zinc-200">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Propriété intellectuelle</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              L'ensemble du site, de sa structure, de ses contenus, textes, visuels, logos, captures d'écran, éléments graphiques et éléments logiciels est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation préalable écrite est interdite.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Responsabilité</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              CorsaiManager s'efforce de fournir des informations exactes et à jour. Le contenu du site reste informatif et ne constitue pas un conseil juridique, fiscal ou financier. L'utilisateur demeure responsable de l'usage qu'il fait des informations et services présentés.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Données personnelles</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              Les traitements de données personnelles liés au site, aux formulaires, aux échanges commerciaux et aux outils de mesure d'audience sont décrits dans la{" "}
              <Link href="/politique-confidentialite" className="font-medium text-cyan-200 hover:text-cyan-100">
                politique de confidentialité
              </Link>
              .
            </p>
          </article>

          <article className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Contact légal</h2>
            <div className="mt-4 space-y-3 text-sm text-zinc-200">
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 transition hover:text-cyan-100">
                <Mail size={16} className="text-cyan-200" /> {CONTACT_EMAIL}
              </a>
              <a href={`tel:${CONTACT_PHONE_LINK}`} className="flex items-center gap-2 transition hover:text-cyan-100">
                <Phone size={16} className="text-cyan-200" /> {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          </article>
        </section>

        <p className="mt-8 text-xs text-zinc-500">Dernière mise à jour : {updatedAt}.</p>
      </Container>
    </div>
  );
}
