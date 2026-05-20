"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  idleLabel?: string;
  copiedLabel?: string;
};

export function CopyButton({
  value,
  idleLabel = "Copier la réponse suggérée",
  copiedLabel = "Copié",
}: CopyButtonProps) {
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
      {copied ? copiedLabel : idleLabel}
    </button>
  );
}
