import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/sections/seo-landing-page";
import { getSeoPage, seoPages } from "@/lib/seo-pages";

const siteUrl = "https://corsaimanager.com";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return seoPages
    .filter((page) => page.type !== "local")
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page || page.type === "local") {
    return {};
  }

  const canonical = `${siteUrl}/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: "CorsaiManager",
      type: "website",
      locale: "fr_FR",
    },
  };
}

export default async function SeoPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page || page.type === "local") {
    notFound();
  }

  const pageUrl = `${siteUrl}/${page.slug}`;
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.h1,
    provider: {
      "@type": "Organization",
      name: "CorsaiManager",
      url: siteUrl,
    },
    areaServed: "France",
    serviceType: page.h1,
    description: page.description,
    mainEntityOfPage: pageUrl,
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, faqSchema]) }}
      />
      <SeoLandingPage page={page} />
    </>
  );
}
