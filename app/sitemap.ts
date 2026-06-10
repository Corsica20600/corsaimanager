import type { MetadataRoute } from "next";
import { seoPages } from "@/lib/seo-pages";

const baseUrl = "https://corsaimanager.com";

const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/realisations", changeFrequency: "weekly", priority: 0.9 },
  { path: "/audit-ia", changeFrequency: "weekly", priority: 0.9 },
  { path: "/assistant-ia-telephone", changeFrequency: "monthly", priority: 0.8 },
  { path: "/crm-ia-pme", changeFrequency: "monthly", priority: 0.8 },
  { path: "/automatisation-entreprise", changeFrequency: "monthly", priority: 0.8 },
  { path: "/applications-metier", changeFrequency: "monthly", priority: 0.8 },
  { path: "/intelligence-artificielle-corse", changeFrequency: "weekly", priority: 0.9 },
  { path: "/expertise-ia-corse", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const seoRoutes = seoPages.map((page) => ({
    path: `/${page.slug}`,
    changeFrequency: "weekly" as const,
    priority: page.type === "local" ? 0.8 : 0.85,
  }));

  return [...routes, ...seoRoutes].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
