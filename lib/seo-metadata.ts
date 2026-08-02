import type { Metadata } from "next";

const siteUrl = "https://www.corsaimanager.com";
const siteName = "CorsaiManager";

const defaultImage = {
  url: "/screens/ai-team-dashboard.png",
  width: 1800,
  height: 1000,
  alt: "Dashboard CorsaiManager avec automatisation IA pour PME",
};

export function publicPageMetadata({
  title,
  description,
  path,
  image = defaultImage,
  type = "website",
}: {
  title: string;
  description: string;
  path: `/${string}`;
  image?: typeof defaultImage;
  type?: "website" | "article";
}): Metadata {
  const url = `${siteUrl}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "fr_FR",
      type,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

export const seoImages = {
  aiTeam: defaultImage,
  agents: {
    url: "/screens/ai-team-agents.png",
    width: 1800,
    height: 1000,
    alt: "Équipe d'agents IA CorsaiManager",
  },
  crm: {
    url: "/screens/crm-dashboard.jpg",
    width: 1200,
    height: 760,
    alt: "Dashboard CRM IA CorsaiManager",
  },
  phone: {
    url: "/screens/voxiq-dashboard.jpg",
    width: 1200,
    height: 760,
    alt: "Assistant téléphonique IA et dashboard d'appels",
  },
  applications: {
    url: "/screens/konformup-dashboard.jpg",
    width: 1200,
    height: 760,
    alt: "Application métier sur mesure pour PME",
  },
  automation: {
    url: "/screens/konformup-pipeline.jpg",
    width: 1200,
    height: 760,
    alt: "Workflow d'automatisation IA pour entreprise",
  },
} as const;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    email: "contact@corsaimanager.com",
    telephone: "+33665018730",
    areaServed: "France",
    sameAs: [
      "https://www.linkedin.com/company/118844174",
      "https://www.facebook.com/profile.php?id=61590717481751",
    ],
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteName,
    url: siteUrl,
    image: `${siteUrl}/images/logo.png`,
    email: "contact@corsaimanager.com",
    telephone: "+33665018730",
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Corse",
      addressCountry: "FR",
    },
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    serviceType: [
      "Audit IA",
      "Automatisation IA",
      "CRM IA",
      "Applications métier",
      "Agents IA",
    ],
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: `/${string}` }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: siteUrl,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        item: `${siteUrl}${item.path}`,
      })),
    ],
  };
}

export function softwareApplicationSchema({
  name,
  description,
  path,
  image = seoImages.aiTeam.url,
}: {
  name: string;
  description: string;
  path: `/${string}`;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${siteUrl}${path}`,
    image: `${siteUrl}${image}`,
    provider: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
  };
}
