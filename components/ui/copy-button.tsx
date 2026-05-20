"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:border-cyan-300/50"
    >
      {copied ? "Copié" : "Copier la réponse suggérée"}
    </button>
  );
}

