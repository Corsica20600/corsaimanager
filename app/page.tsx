import type { Metadata } from "next";
import { faqItems, HomeSeoPage } from "@/components/sections/home-seo-page";

export const metadata: Metadata = {
  title: "Automatisation IA, CRM intelligent et applications métier pour PME | CorsaiManager",
  description:
    "CorsaiManager accompagne les PME en France avec automatisation IA, CRM intelligent, assistant téléphonique IA, applications métier sur mesure et audit IA.",
  alternates: {
    canonical: "https://corsaimanager.com/",
  },
  openGraph: {
    title: "Automatisation IA, CRM intelligent et applications métier pour PME",
    description:
      "Automatisation IA, CRM IA, assistant téléphonique IA et applications métier sur mesure pour PME françaises.",
    url: "https://corsaimanager.com/",
    type: "website",
  },
};

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CorsaiManager",
    url: "https://corsaimanager.com",
    description:
      "CorsaiManager accompagne les PME en France avec des solutions d'automatisation IA, CRM intelligent et applications métier sur mesure.",
    areaServed: "France",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Corse",
      addressCountry: "FR",
    },
    sameAs: ["https://corsaimanager.com"],
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Automatisation IA, CRM intelligent et applications métier pour PME",
    provider: {
      "@type": "Organization",
      name: "CorsaiManager",
      url: "https://corsaimanager.com",
    },
    serviceType: "Automatisation IA pour PME",
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Solutions IA CorsaiManager",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Audit IA" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "CRM IA pour PME" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Assistant téléphonique IA" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Applications métier sur mesure" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Automatisation des processus" } },
      ],
    },
  };

  return (
    <>
      <HomeSeoPage />
      {[faqSchema, organizationSchema, serviceSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
