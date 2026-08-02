import type { Metadata } from "next";
import { ApplicationsMetierPage } from "@/components/sections/applications-metier-page";
import {
  breadcrumbSchema,
  publicPageMetadata,
  seoImages,
  softwareApplicationSchema,
} from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Applications métier sur mesure pour PME",
  description:
    "Développement d’applications métier modernes pour PME : CRM, automatisation, dashboards, gestion formation, réservation et outils professionnels sur mesure.",
  path: "/applications-metier",
  image: seoImages.applications,
});

export default function ApplicationsMetierRoute() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Applications métier sur mesure pour PME",
    provider: { "@type": "Organization", name: "CorsaiManager", url: "https://www.corsaimanager.com" },
    areaServed: "France",
    serviceType: "Développement d’application métier sur mesure",
    url: "https://www.corsaimanager.com/applications-metier",
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
  const softwareSchema = softwareApplicationSchema({
    name: "Applications métier CorsaiManager",
    description:
      "Applications métier sur mesure pour centraliser les données, automatiser les processus et piloter l'activité des PME.",
    path: "/applications-metier",
    image: seoImages.applications.url,
  });
  const breadcrumb = breadcrumbSchema([{ name: "Applications métier", path: "/applications-metier" }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, faqSchema, softwareSchema, breadcrumb]) }} />
      <ApplicationsMetierPage />
    </>
  );
}
