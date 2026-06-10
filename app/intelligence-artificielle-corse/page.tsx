import type { Metadata } from "next";
import { IntelligenceArtificielleCorsePage } from "@/components/sections/intelligence-artificielle-corse-page";

const title = "Consultant Intelligence Artificielle en Corse | CorsaiManager";
const description =
  "CorsaiManager accompagne les entreprises corses dans l'intégration de l'intelligence artificielle : automatisation, assistants IA, applications métier, CRM intelligent et optimisation des processus commerciaux.";
const canonical = "https://corsaimanager.com/intelligence-artificielle-corse";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: "CorsaiManager",
    locale: "fr_FR",
    type: "website",
  },
};

export default function IntelligenceArtificielleCorseRoute() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "CorsaiManager",
    url: "https://corsaimanager.com",
    areaServed: "Corse",
    serviceType: "Automatisation IA, consultant IA, applications métier",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Biguglia",
      addressRegion: "Corse",
    },
    description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <IntelligenceArtificielleCorsePage />
    </>
  );
}
