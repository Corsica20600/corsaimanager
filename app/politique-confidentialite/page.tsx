/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";
import { CONTACT_EMAIL } from "@/lib/contact";
import { breadcrumbSchema, publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité CorsaiManager : données collectées, finalités, bases légales, durées de conservation, cookies, prestataires et droits RGPD.",
  path: "/politique-confidentialite",
});

const updatedAt = "28 juillet 2026";

const processingRows = [
  {
    purpose: "Répondre aux demandes de contact et d'audit IA",
    data: "Nom, prénom, email, téléphone, société, site web, message, informations transmises dans les formulaires.",
    legalBasis: "Mesures précontractuelles, consentement ou intérêt légitime selon le contexte.",
    retention: "Jusqu'à 3 ans après le dernier échange commercial, sauf obligation légale contraire.",
  },
  {
    purpose: "Préparer et suivre la relation commerciale",
    data: "Coordonnées professionnelles, historique d'échanges, besoins exprimés, préférences de contact, notes CRM.",
    legalBasis: "Intérêt légitime de suivi commercial B2B et exécution de mesures précontractuelles.",
    retention: "Jusqu'à 3 ans après le dernier contact actif.",
  },
  {
    purpose: "Réaliser des audits IA, SEO ou CRM",
    data: "URL, réponses aux questionnaires, informations métier, éléments techniques nécessaires à l'analyse.",
    legalBasis: "Mesures précontractuelles ou exécution d'un service demandé.",
    retention: "Durée nécessaire au traitement de la demande, puis archivage limité si suivi commercial.",
  },
  {
    purpose: "Mesurer l'audience, améliorer le site et sécuriser le service",
    data: "Pages consultées, événements de navigation, identifiants techniques, adresse IP tronquée ou pseudonymisée lorsque le service le permet, journaux techniques.",
    legalBasis: "Consentement lorsque requis pour les traceurs, intérêt légitime pour la sécurité et les statistiques strictement nécessaires.",
    retention: "Jusqu'à 13 mois pour les mesures d'audience et jusqu'à 12 mois pour les journaux de sécurité, sauf besoin de preuve.",
  },
];

const providers = [
  "Vercel : hébergement, réseau de diffusion, logs techniques et analytics.",
  "Google Tag Manager, Google Ads ou Google Analytics : mesure d'audience et suivi de campagnes lorsque les variables sont configurées.",
  "Microsoft Clarity : analyse d'usage et amélioration de l'ergonomie en production.",
  "Calendly : prise de rendez-vous depuis la page contact.",
  "Prestataires email / SMTP : transmission des messages et suivi des échanges.",
  "Prestataires IA ou API métier : uniquement lorsque cela est nécessaire pour traiter une demande ou produire une analyse.",
];

const rights = [
  "accès aux données vous concernant",
  "rectification des données inexactes",
  "effacement lorsque la réglementation le permet",
  "limitation ou opposition au traitement",
  "portabilité des données fournies",
  "retrait du consentement pour les traitements fondés sur celui-ci",
  "réclamation auprès de la CNIL",
];

export default function PolitiqueConfidentialitePage() {
  const breadcrumb = breadcrumbSchema([{ name: "Politique de confidentialité", path: "/politique-confidentialite" }]);

  return (
    <div className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <SharedPageHero
        badge="Confidentialité"
        title="Politique de confidentialité"
        description="Comment CorsaiManager collecte, utilise, protège et conserve les données personnelles transmises via le site, les formulaires, les audits et les échanges commerciaux."
      />

      <Container>
        <section className="mt-10 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 shrink-0 text-cyan-200" size={26} />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Responsable du traitement</h2>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  Le responsable du traitement est CorsaiManager, joignable à{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-cyan-100 hover:text-white">
                    {CONTACT_EMAIL}
                  </a>
                  . Les informations administratives complètes de l'éditeur sont disponibles dans les{" "}
                  <Link href="/mentions-legales" className="font-medium text-cyan-100 hover:text-white">
                    mentions légales
                  </Link>
                  .
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <LockKeyhole className="mt-1 shrink-0 text-cyan-200" size={26} />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Principe général</h2>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  CorsaiManager limite la collecte aux données utiles pour répondre aux demandes, préparer les audits, assurer le suivi commercial, sécuriser le site et améliorer l'expérience utilisateur. Les données ne sont pas vendues.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Traitements réalisés</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[860px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                <tr className="border-b border-white/10">
                  <th className="px-3 py-3 font-medium">Finalité</th>
                  <th className="px-3 py-3 font-medium">Données concernées</th>
                  <th className="px-3 py-3 font-medium">Base légale</th>
                  <th className="px-3 py-3 font-medium">Conservation</th>
                </tr>
              </thead>
              <tbody>
                {processingRows.map((row) => (
                  <tr key={row.purpose} className="border-b border-white/10 align-top last:border-0">
                    <td className="px-3 py-4 font-medium text-zinc-100">{row.purpose}</td>
                    <td className="px-3 py-4 leading-relaxed text-zinc-300">{row.data}</td>
                    <td className="px-3 py-4 leading-relaxed text-zinc-300">{row.legalBasis}</td>
                    <td className="px-3 py-4 leading-relaxed text-zinc-300">{row.retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Cookies et traceurs</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              Le site peut utiliser des traceurs techniques, des outils de mesure d'audience et des solutions d'analyse de parcours comme Vercel Analytics, Google Tag Manager, Google Ads, Google Analytics ou Microsoft Clarity selon la configuration de production.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              Lorsque le consentement est requis, l'utilisateur doit pouvoir accepter, refuser ou modifier ses choix. Les traceurs strictement nécessaires au fonctionnement du site peuvent être déposés sans consentement préalable.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Destinataires et prestataires</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-300">
              {providers.map((provider) => (
                <li key={provider} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  {provider}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Transferts hors Union européenne</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              Certains prestataires techniques peuvent traiter des données en dehors de l'Union européenne. Dans ce cas, CorsaiManager s'appuie sur les garanties prévues par la réglementation applicable, notamment les clauses contractuelles types ou mécanismes équivalents mis en place par les prestataires concernés.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Sécurité</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              CorsaiManager met en place des mesures raisonnables pour protéger les données contre l'accès non autorisé, la perte, l'altération ou la divulgation. Les accès aux outils techniques et commerciaux sont limités aux personnes et prestataires qui en ont besoin.
            </p>
          </article>
        </section>

        <section className="mt-10 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Vos droits</h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">
            Vous pouvez exercer vos droits à tout moment en écrivant à{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-cyan-100 hover:text-white">
              {CONTACT_EMAIL}
            </a>
            . Pour faciliter le traitement, indiquez l'objet de votre demande et l'adresse email concernée.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rights.map((right) => (
              <div key={right} className="rounded-2xl border border-cyan-300/20 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-200">
                {right}
              </div>
            ))}
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-zinc-300">
            <Mail size={16} className="text-cyan-200" />
            En cas de difficulté, vous pouvez aussi saisir la CNIL.
          </p>
        </section>

        <p className="mt-8 text-xs text-zinc-500">Dernière mise à jour : {updatedAt}.</p>
      </Container>
    </div>
  );
}
