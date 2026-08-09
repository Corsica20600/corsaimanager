"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteImportedPurchaseButton({ purchaseId }: { purchaseId: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm("Supprimer définitivement cet achat importé par erreur ? L'achat, ses lignes et ses relations d'import inutiles seront retirés.")) return;
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/billing/purchases/${purchaseId}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const payload = await response.json().catch(() => null) as { ok?: boolean; error?: string; blobCleanupWarnings?: number } | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Suppression impossible.");
      router.push(`/ventes/achats?deleted=1${payload.blobCleanupWarnings ? "&cleanup=1" : ""}`);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Suppression impossible. Réessayez.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={remove}
        disabled={isDeleting}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-300/40 px-5 py-2.5 text-sm font-semibold text-rose-100 hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {isDeleting ? "Suppression en cours" : "Rejeter la facture"}
      </button>
      {error ? <p role="alert" className="text-sm text-rose-100">{error}</p> : null}
    </div>
  );
}
