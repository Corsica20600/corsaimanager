import type { Metadata } from "next";
import { ApplicationsMetierPage } from "@/components/sections/applications-metier-page";

export const metadata: Metadata = {
  title: "Applications métier sur mesure | CorsaiManager",
  description:
    "Développement d’applications métier modernes pour PME : CRM, automatisation, dashboards, gestion formation, réservation et outils professionnels sur mesure.",
  alternates: {
    canonical: "https://corsaimanager.com/applications-metier",
  },
};

export default function ApplicationsMetierRoute() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Applications métier sur mesure pour PME",
    provider: { "@type": "Organization", name: "CorsaiManager", url: "https://corsaimanager.com" },
    areaServed: "France",
    serviceType: "Développement d’application métier sur mesure",
    url: "https://corsaimanager.com/applications-metier",
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Quand créer une application métier sur mesure ?",
        acceptedAnswer: { "@type": "Answer", text: "Quand les logiciels standards imposent trop de contournements, dispersent les données ou ralentissent les équipes avec des doubles saisies." },
      },
      {
        "@type": "Question",
        name: "Une application métier peut-elle intégrer de l’IA ?",
        acceptedAnswer: { "@type": "Answer", text: "Oui. L’IA peut résumer, classer, générer des documents, assister les utilisateurs ou automatiser certaines étapes métier." },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, faqSchema]) }} />
      <ApplicationsMetierPage />
    </>
  );
}
