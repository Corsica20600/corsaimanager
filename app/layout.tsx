import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteShell } from "@/components/layout/site-shell";
import { ConsentManager } from "@/components/analytics/consent-manager";
import { organizationSchema, seoImages } from "@/lib/seo-metadata";

const geistSans = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.corsaimanager.com"),
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  title: {
    default: "CorsaiManager | Automatisation IA pour PME en France",
    template: "%s | CorsaiManager",
  },
  description:
    "CorsaiManager aide les PME françaises à automatiser leurs tâches, structurer leur CRM, créer des assistants IA et développer des applications métier sur mesure.",
  keywords: [
    "automatisation IA PME",
    "consultant IA PME",
    "agence IA France",
    "CRM intelligent",
    "assistant IA",
    "application métier",
    "automatisation commerciale",
  ],
  openGraph: {
    title: "CorsaiManager | Automatisation IA pour PME en France",
    description:
      "Automatisation IA, CRM intelligent, assistant téléphonique IA et applications métier sur mesure pour PME françaises.",
    url: "https://www.corsaimanager.com",
    siteName: "CorsaiManager",
    locale: "fr_FR",
    type: "website",
    images: [seoImages.aiTeam],
  },
  twitter: {
    card: "summary_large_image",
    title: "CorsaiManager | Automatisation IA pour PME en France",
    description:
      "Automatisation IA, CRM intelligent, assistant téléphonique IA et applications métier sur mesure pour PME françaises.",
    images: [seoImages.aiTeam.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head />
      <body className="min-h-full bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <SiteShell>{children}</SiteShell>
        <ConsentManager />
      </body>
    </html>
  );
}
