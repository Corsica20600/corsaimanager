import type { Metadata } from "next";
import { AutomatisationEntreprisePage } from "@/components/sections/automatisation-entreprise-page";

export const metadata: Metadata = {
  title: "Automatisation IA pour entreprise | CorsaiManager",
  description:
    "Automatisez les tâches répétitives de votre PME avec l’IA : emails, relances, devis, documents, reporting et workflows métier.",
  alternates: {
    canonical: "https://corsaimanager.com/automatisation-entreprise",
  },
};

export default function AutomatisationEntrepriseRoute() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Automatisation IA pour entreprise",
    provider: { "@type": "Organization", name: "CorsaiManager", url: "https://corsaimanager.com" },
    areaServed: "France",
    serviceType: "Automatisation IA des processus",
    url: "https://corsaimanager.com/automatisation-entreprise",
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Quelles tâches peut-on automatiser avec l’IA ?",
        acceptedAnswer: { "@type": "Answer", text: "Emails, relances, devis, reporting, documents, notifications, qualification de demandes et synchronisation CRM peuvent être automatisés selon vos outils." },
      },
      {
        "@type": "Question",
        name: "CorsaiManager accompagne-t-il les PME partout en France ?",
        acceptedAnswer: { "@type": "Answer", text: "Oui. CorsaiManager est basé en Corse et accompagne les PME partout en France avec des ateliers à distance et un suivi opérationnel." },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, faqSchema]) }} />
      <AutomatisationEntreprisePage />
    </>
  );
}
