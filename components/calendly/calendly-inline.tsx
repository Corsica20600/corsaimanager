"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type CalendlyInlineProps = {
  url: string;
  className?: string;
  minHeight?: number;
};

declare global {
  interface Window {
    Calendly?: {
      initInlineWidgets?: () => void;
    };
  }
}

export function CalendlyInline({
  url,
  className,
  minHeight = 760,
}: CalendlyInlineProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Calendly?.initInlineWidgets) {
      window.Calendly.initInlineWidgets();
    }
  }, [loaded]);

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur sm:p-6 ${className ?? ""}`}
    >
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          setLoaded(true);
          if (window.Calendly?.initInlineWidgets) {
            window.Calendly.initInlineWidgets();
          }
        }}
      />

      <div
        className="calendly-inline-widget overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40"
        data-url={url}
        style={{ minWidth: "320px", height: `${minHeight}px` }}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(34,211,238,0.35)]"
        >
          Réserver un audit IA
        </a>
        <p className="text-xs text-zinc-400">
          Si l&apos;agenda ne s&apos;affiche pas, utilisez le bouton de réservation.
        </p>
      </div>
    </div>
  );
}
