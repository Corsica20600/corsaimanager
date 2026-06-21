import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.corsaimanager.com",
          },
        ],
        destination: "https://corsaimanager.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
