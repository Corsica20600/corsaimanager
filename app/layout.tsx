import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import "./globals.css";
import { SiteShell } from "@/components/layout/site-shell";
import {
  GoogleTagManagerHead,
  GoogleTagManagerNoScript,
} from "@/components/analytics/google-tag-manager";
import { localBusinessSchema, organizationSchema, seoImages } from "@/lib/seo-metadata";

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
  metadataBase: new URL("https://corsaimanager.com"),
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
    url: "https://corsaimanager.com",
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
      <head>
        <GoogleTagManagerHead />
        {process.env.NODE_ENV === "production" ? (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "wu2e40uzli");
            `}
          </Script>
        ) : null}
      </head>
      <body className="min-h-full bg-background text-foreground">
        <GoogleTagManagerNoScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema(), localBusinessSchema()]) }}
        />
        <SiteShell>{children}</SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
