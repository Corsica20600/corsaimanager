import type { Metadata } from "next";
import { IntelligenceArtificielleCorsePage } from "@/components/sections/intelligence-artificielle-corse-page";

const title = "Intelligence artificielle en Corse pour PME | CorsaiManager";
const description =
  "Intelligence artificielle en Corse pour PME : automatisation, assistants IA, applications métier et CRM intelligent, avec accompagnement partout en France.";
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
    areaServed: "France",
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
