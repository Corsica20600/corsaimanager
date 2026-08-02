import type { Metadata } from "next";
import { faqItems, HomeSeoPage } from "@/components/sections/home-seo-page";
import { breadcrumbSchema, publicPageMetadata, seoImages } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Automatisation IA, CRM intelligent et applications métier pour PME",
  description:
    "CorsaiManager accompagne les PME en France avec automatisation IA, CRM intelligent, assistant téléphonique IA, applications métier sur mesure et audit IA.",
  path: "/",
  image: seoImages.aiTeam,
});

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
    url: "https://www.corsaimanager.com",
    description:
      "CorsaiManager accompagne les PME en France avec des solutions d'automatisation IA, CRM intelligent et applications métier sur mesure.",
    areaServed: "France",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Corse",
      addressCountry: "FR",
    },
    sameAs: ["https://www.corsaimanager.com"],
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Automatisation IA, CRM intelligent et applications métier pour PME",
    provider: {
      "@type": "Organization",
      name: "CorsaiManager",
      url: "https://www.corsaimanager.com",
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
      {[faqSchema, organizationSchema, serviceSchema, breadcrumbSchema([])].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
