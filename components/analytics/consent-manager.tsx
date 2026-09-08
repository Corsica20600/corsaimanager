"use client";

import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";

type Consent = { analytics: boolean; advertising: boolean };
const storageKey = "corsaimanager-consent-v1";
const defaultConsent: Consent = { analytics: false, advertising: false };

declare global {
  interface Window {
    clarity?: (command: string, value: boolean) => void;
    dataLayer?: unknown[][];
  }
}

function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? { ...defaultConsent, ...JSON.parse(value) } : null;
  } catch {
    return null;
  }
}

export function ConsentManager() {
  const trackingEnabled = process.env.NODE_ENV === "production";
  const [consent, setConsent] = useState<Consent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = readConsent();
      setConsent(saved);
      setIsOpen(!saved);
    });
    const open = () => { setConsent(readConsent() ?? defaultConsent); setIsCustomizing(true); setIsOpen(true); };
    window.addEventListener("corsaimanager:open-consent", open);
    return () => window.removeEventListener("corsaimanager:open-consent", open);
  }, []);

  function save(next: Consent) {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push([
      "consent",
      "update",
      {
        analytics_storage: next.analytics ? "granted" : "denied",
        ad_storage: next.advertising ? "granted" : "denied",
        ad_user_data: next.advertising ? "granted" : "denied",
        ad_personalization: next.advertising ? "granted" : "denied",
      },
    ]);
    window.clarity?.("consent", next.analytics);
    setConsent(next);
    setIsOpen(false);
    setIsCustomizing(false);
    window.dispatchEvent(new CustomEvent("corsaimanager:consent", { detail: next }));
  }

  return (
    <>
      <Script id="google-consent-default" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
      `}</Script>
      {trackingEnabled && consent?.analytics ? <Analytics /> : null}
      {trackingEnabled && consent?.analytics ? <Script id="microsoft-clarity" strategy="afterInteractive">{`
        (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','wu2e40uzli');
      `}</Script> : null}
      {trackingEnabled && (consent?.analytics || consent?.advertising) ? <GoogleTags consent={consent} /> : null}
      {isOpen ? <ConsentDialog consent={consent ?? defaultConsent} customizing={isCustomizing} onCustomize={() => setIsCustomizing(true)} onSave={save} /> : null}
    </>
  );
}

function GoogleTags({ consent }: { consent: Consent }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const update = `gtag('consent','update',{analytics_storage:'${consent.analytics ? "granted" : "denied"}',ad_storage:'${consent.advertising ? "granted" : "denied"}',ad_user_data:'${consent.advertising ? "granted" : "denied"}',ad_personalization:'${consent.advertising ? "granted" : "denied"}');`;
  return <>
    {gtmId ? <Script id="google-tag-manager" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];${update}(function(w,d,s,l,i){var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script> : null}
    {googleAdsId ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`} strategy="afterInteractive" /><Script id="google-ads-tag" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());${update}gtag('config','${googleAdsId}');`}</Script></> : null}
  </>;
}

function ConsentDialog({ consent, customizing, onCustomize, onSave }: { consent: Consent; customizing: boolean; onCustomize: () => void; onSave: (value: Consent) => void }) {
  const [choices, setChoices] = useState(consent);
  return <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-2xl border border-cyan-300/30 bg-zinc-950 p-5 shadow-2xl sm:bottom-6" role="dialog" aria-modal="true" aria-labelledby="consent-title">
    <h2 id="consent-title" className="text-lg font-semibold text-zinc-100">Vos choix de confidentialité</h2>
    <p className="mt-2 text-sm leading-relaxed text-zinc-300">Les traceurs d’audience et publicitaires restent désactivés tant que vous ne les acceptez pas. <Link href="/politique-confidentialite" className="text-cyan-200 underline">Politique de confidentialité</Link>.</p>
    {customizing ? <div className="mt-4 space-y-3 text-sm text-zinc-200"><label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 p-3">Mesure d’audience (Vercel Analytics, Clarity, Google)<input aria-label="Accepter la mesure d’audience" type="checkbox" checked={choices.analytics} onChange={(event) => setChoices({ ...choices, analytics: event.target.checked })} /></label><label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 p-3">Publicité Google<input aria-label="Accepter la publicité Google" type="checkbox" checked={choices.advertising} onChange={(event) => setChoices({ ...choices, advertising: event.target.checked })} /></label></div> : null}
    <div className="mt-5 flex flex-wrap gap-3"><button onClick={() => onSave({ analytics: true, advertising: true })} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-950">Tout accepter</button><button onClick={() => onSave(defaultConsent)} className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-zinc-100">Tout refuser</button>{customizing ? <button onClick={() => onSave(choices)} className="rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100">Enregistrer mes choix</button> : <button onClick={onCustomize} className="rounded-full border border-white/25 px-4 py-2 text-sm text-zinc-100">Personnaliser</button>}</div>
  </div>;
}
