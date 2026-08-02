import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async redirects() {
    return [
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
};

export default nextConfig;
