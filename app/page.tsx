import type { Metadata } from "next";
import Link from "next/link";
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
      <section className="mx-auto mt-12 w-full max-w-7xl px-5 pb-12 sm:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">CorsaiManager</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Erwan Longin, fondateur de CorsaiManager</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
            Entrepreneur individuel basé à Biguglia, en Corse, Erwan Longin conçoit et développe des produits numériques, des applications métier et des solutions d’automatisation basées sur l’intelligence artificielle.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
            Titulaire du bloc de compétences « Piloter un projet d’intelligence artificielle », rattaché au titre professionnel de niveau 7 « Chef de projet en intelligence artificielle », obtenu le 3 avril 2025 auprès d’Ascencia Business School, membre du Collège de Paris.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-zinc-950">Contacter CorsaiManager</Link>
            <Link href="/mentions-legales" className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-zinc-100">Mentions légales</Link>
          </div>
        </div>
      </section>
      {[faqSchema, serviceSchema, breadcrumbSchema([])].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
