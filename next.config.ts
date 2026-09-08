import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async redirects() {
    return [
      { source: "/blog/blog-ia-pme-publi-publi", destination: "/blog/blog-ia-publier-regularite-ameliore-leads", permanent: true },
      { source: "/blog/blog-ia-pme-publier-regulierement", destination: "/blog/blog-ia-publier-regularite-ameliore-leads", permanent: true },
      { source: "/blog/blog-ia-pour-pme-pourquoi-publier-regulierement-ameliore-les-leads", destination: "/blog/blog-ia-publier-regularite-ameliore-leads", permanent: true },
      { source: "/blog/linkedin-pme-transformer-article-en-prospects", destination: "/blog/linkedin-pour-pme-comment-transformer-un-article-de-blog-en-prospects", permanent: true },
      { source: "/blog/comment-utiliser-chatgpt-dans-une-pme-corse", destination: "/blog/comment-utiliser-chatgpt-dans-une-pme-corse-en-2026", permanent: true },
      { source: "/blog/automatisation-ia-taches-pme", destination: "/blog/automatisation-ia-taches-deleguer", permanent: true },
      {
        source: "/intelligence-artificielle-corse",
        destination: "/agence-ia-france",
        permanent: true,
      },
      {
        source: "/expertise-ia-corse",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/ia-corse",
        destination: "/consultant-ia-pme",
        permanent: true,
      },
      {
        source: "/automatisation-ia-corse",
        destination: "/automatisation-entreprise",
        permanent: true,
      },
      {
        source: "/assistant-ia-bastia",
        destination: "/assistant-ia-telephone",
        permanent: true,
      },
      {
        source: "/crm-ia-corse",
        destination: "/crm-ia-pme",
        permanent: true,
      },
      {
        source: "/application-metier-corse",
        destination: "/applications-metier",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https://www.google-analytics.com https://www.clarity.ms https://u.clarity.ms https://b.clarity.ms https://vitals.vercel-insights.com; frame-src 'self' https://calendly.com https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" },
    ] }];
  },
};

export default nextConfig;
