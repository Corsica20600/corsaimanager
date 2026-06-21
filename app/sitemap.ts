import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";
import { seoPages } from "@/lib/seo-pages";

const baseUrl = "https://corsaimanager.com";

export const dynamic = "force-dynamic";

const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/agence-ia-france", changeFrequency: "weekly", priority: 1 },
  { path: "/audit-ia", changeFrequency: "weekly", priority: 0.9 },
  { path: "/crm-ia-pme", changeFrequency: "weekly", priority: 0.9 },
  { path: "/assistant-ia-telephone", changeFrequency: "weekly", priority: 0.9 },
  { path: "/applications-metier", changeFrequency: "weekly", priority: 0.8 },
  { path: "/automatisation-entreprise", changeFrequency: "weekly", priority: 0.8 },
  { path: "/transformation-digitale-pme", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/realisations", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/intelligence-artificielle-corse", changeFrequency: "weekly", priority: 0.9 },
  { path: "/expertise-ia-corse", changeFrequency: "weekly", priority: 0.9 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const seoRoutes = seoPages.map((page) => ({
    path: `/${page.slug}`,
    changeFrequency: "weekly" as const,
    priority: page.type === "local" ? 0.8 : 0.85,
  }));
  const blogRoutes = getPublishedPosts().map((post) => ({
    path: `/blog/${post.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const uniqueRoutes = new Map<string, (typeof routes)[number]>();

  for (const route of [...routes, ...seoRoutes, ...blogRoutes]) {
    if (isExcludedFromSitemap(route.path)) continue;
    const existing = uniqueRoutes.get(route.path);
    if (!existing || route.priority > existing.priority) {
      uniqueRoutes.set(route.path, route);
    }
  }

  return Array.from(uniqueRoutes.values()).map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

function isExcludedFromSitemap(pathname: string) {
  return [
    "/admin",
    "/api",
    "/audit-ia/success",
    "/audit-seo-ia",
  ].some((excludedPath) => pathname === excludedPath || pathname.startsWith(`${excludedPath}/`));
}
