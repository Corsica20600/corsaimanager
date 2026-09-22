"use client";

import { useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export const DASHBOARD_REFRESH_INTERVAL_MS = 60_000;

export function DashboardFreshness({ updatedAt }: { updatedAt: string }) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const refresh = useCallback(() => startTransition(() => router.refresh()), [router, startTransition]);

  useEffect(() => {
    const interval = window.setInterval(refresh, DASHBOARD_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const label = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(updatedAt));

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
      <span>Mis à jour à {label} · actualisation automatique chaque minute.</span>
      <button type="button" onClick={refresh} disabled={refreshing} className="text-cyan-200 transition hover:text-cyan-100 disabled:cursor-wait disabled:opacity-60">
        {refreshing ? "Actualisation…" : "Actualiser"}
      </button>
    </div>
  );
}
