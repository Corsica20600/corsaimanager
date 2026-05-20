import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import "./globals.css";
import { SiteShell } from "@/components/layout/site-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://corsaimanager.com"),
  title: {
    default: "CorsaiManager | Automatisation IA pour PME",
    template: "%s | CorsaiManager",
  },
  description:
    "CorsaiManager accompagne les PME avec des CRM intelligents, assistants IA, applications métier et automatisations commerciales sur mesure.",
  keywords: [
    "automatisation IA PME",
    "CRM intelligent",
    "assistant IA",
    "application métier",
    "automatisation commerciale",
  ],
  openGraph: {
    title: "CorsaiManager | Automatisation IA pour PME",
    description:
      "Accélérez vos ventes et vos opérations grâce à des solutions IA premium, conçues pour les PME ambitieuses.",
    url: "https://corsaimanager.com",
    siteName: "CorsaiManager",
    locale: "fr_FR",
    type: "website",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XBQS51QG17"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XBQS51QG17');
          `}
        </Script>
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
        <SiteShell>{children}</SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
