import type { MetadataRoute } from "next";

const baseUrl = "https://corsaimanager.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/crm/",
        "/audit-ia/success",
        "/audit-seo-ia",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
