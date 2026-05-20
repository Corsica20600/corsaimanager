import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/sections/seo-landing-page";
import { getSeoPage, seoPages } from "@/lib/seo-pages";

const siteUrl = "https://corsaimanager.com";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return seoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page) {
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

  if (!page) {
    notFound();
  }

  const pageUrl = `${siteUrl}/${page.slug}`;
  const jsonLd =
    page.type === "local"
      ? {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "CorsaiManager",
          url: siteUrl,
          areaServed: ["Corse", "Bastia", "Biguglia", "Ajaccio", "France"],
          serviceType: page.h1,
          description: page.description,
        }
      : {
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "CorsaiManager",
          url: siteUrl,
          areaServed: "France",
          serviceType: page.h1,
          description: page.description,
        };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...jsonLd, mainEntityOfPage: pageUrl }) }}
      />
      <SeoLandingPage page={page} />
    </>
  );
}

