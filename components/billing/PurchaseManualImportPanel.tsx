"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { FileUp, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { purchaseCategoryLabels } from "./PurchaseStatusBadge";
import type { PurchaseCategory, PurchaseEntity } from "@/lib/billing/types";

const maxSize = 10 * 1024 * 1024;
const acceptedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

type Draft = {
  supplierName: string; invoiceNumber: string; invoiceDate: string; currency: string; subtotalCents: number; taxCents: number; totalCents: number;
  entity: PurchaseEntity; category: PurchaseCategory; description: string; confidence: number;
  lines: Array<{ description: string; quantity_milli: number; unit_price_cents: number; vat_rate_basis_points: number; total_cents: number }>;
};
type Preview = Draft & { importId: string; filename: string; duplicateInvoiceId: number | null };

export function PurchaseManualImportPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "uploading" | "analysing" | "creating">("idle");

  async function choose(file: File | undefined) {
    if (!file) return;
    setError(null); setPreview(null);
    if (!acceptedTypes.includes(file.type) || file.size <= 0 || file.size > maxSize) {
      setError("Choisissez un PDF, PNG, JPEG ou WebP de 10 Mo maximum."); return;
    }
    try {
      setState("uploading");
      const pathname = `manual-purchase-invoices/${crypto.randomUUID()}/${safeFilename(file.name)}`;
      const blob = await upload(pathname, file, { access: "private", contentType: file.type, handleUploadUrl: "/api/admin/billing/purchases/manual-uploads" });
      setState("analysing");
      const response = await fetch("/api/admin/billing/purchases/manual-imports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: blob.url, pathname: blob.pathname, filename: file.name }) });
      const payload = await response.json().catch(() => null) as { ok?: boolean; error?: string; preview?: Preview } | null;
      if (!response.ok || !payload?.ok || !payload.preview) throw new Error(payload?.error || "Analyse du document impossible.");
      setPreview(payload.preview);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Import impossible. Réessayez.");
    } finally { setState("idle"); }
  }

  async function create() {
    if (!preview) return;
    setError(null); setState("creating");
    try {
      const response = await fetch("/api/admin/billing/purchases/manual-imports", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ importId: preview.importId, draft: preview }) });
      const payload = await response.json().catch(() => null) as { ok?: boolean; error?: string; created?: boolean; invoiceId?: number; duplicateInvoiceId?: number } | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Création de l'achat impossible.");
      if (!payload.created && payload.duplicateInvoiceId) { setError(`Doublon détecté : achat #${payload.duplicateInvoiceId}.`); return; }
      router.push(`/ventes/achats/${payload.invoiceId}`); router.refresh();
    } catch (createError) { setError(createError instanceof Error ? createError.message : "Création de l'achat impossible."); }
    finally { setState("idle"); }
  }

  const busy = state !== "idle";
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-zinc-100">Déposer une facture</p><p className="mt-1 text-sm text-zinc-400">PDF ou image téléchargé depuis un portail fournisseur, jusqu&apos;à 10 Mo.</p></div></div>
      {!preview ? <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void choose(event.dataTransfer.files[0]); }} className="mt-4 grid min-h-36 place-items-center rounded-lg border border-dashed border-cyan-300/35 bg-cyan-300/5 p-5 text-center">
        <div><FileUp className="mx-auto h-6 w-6 text-cyan-100" aria-hidden="true" /><p className="mt-2 text-sm text-zinc-200">Glissez un document ici</p><button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="mt-3 rounded-full border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100 disabled:opacity-50">Sélectionner un fichier</button><input ref={inputRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void choose(event.target.files?.[0])} /></div>
      </div> : <PreviewForm preview={preview} setPreview={setPreview} onCreate={create} busy={busy} />}
      {busy ? <p className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-100"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />{state === "uploading" ? "Dépôt sécurisé en cours" : state === "analysing" ? "Analyse de la facture" : "Création de l'achat"}</p> : null}
      {error ? <p role="alert" className="mt-3 rounded-lg border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">{error}</p> : null}
    </section>
  );
}

function PreviewForm({ preview, setPreview, onCreate, busy }: { preview: Preview; setPreview: (value: Preview) => void; onCreate: () => void; busy: boolean }) {
  const update = <K extends keyof Preview>(key: K, value: Preview[K]) => setPreview({ ...preview, [key]: value });
  return <div className="mt-4 grid gap-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-zinc-300">{preview.filename} <span className="text-zinc-500">- confiance IA {preview.confidence}/100</span></p>{preview.duplicateInvoiceId ? <p className="text-sm text-amber-100">Doublon possible : achat #{preview.duplicateInvoiceId}</p> : null}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <Field label="Fournisseur" value={preview.supplierName} onChange={(value) => update("supplierName", value)} /><Field label="Numéro" value={preview.invoiceNumber} onChange={(value) => update("invoiceNumber", value)} /><Field label="Date" type="date" value={preview.invoiceDate} onChange={(value) => update("invoiceDate", value)} /><Field label="Devise" value={preview.currency} onChange={(value) => update("currency", value.toUpperCase())} />
    <Money label="HT" cents={preview.subtotalCents} onChange={(value) => update("subtotalCents", value)} /><Money label="TVA" cents={preview.taxCents} onChange={(value) => update("taxCents", value)} /><Money label="TTC" cents={preview.totalCents} onChange={(value) => update("totalCents", value)} />
    <label className="grid gap-1 text-xs text-zinc-400">Catégorie<select value={preview.category} onChange={(event) => update("category", event.target.value as PurchaseCategory)} className="rounded-lg border border-white/15 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100">{Object.entries(purchaseCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
  </div><label className="grid gap-1 text-xs text-zinc-400">Description<textarea value={preview.description} onChange={(event) => update("description", event.target.value)} className="min-h-20 rounded-lg border border-white/15 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100" /></label><button type="button" onClick={onCreate} disabled={busy} className="w-fit rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50">Créer l&apos;achat</button></div>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="grid gap-1 text-xs text-zinc-400">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-white/15 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100" /></label>; }
function Money({ label, cents, onChange }: { label: string; cents: number; onChange: (value: number) => void }) { return <label className="grid gap-1 text-xs text-zinc-400">{label}<input type="number" min="0" step="0.01" value={(cents / 100).toFixed(2)} onChange={(event) => onChange(Math.round(Number(event.target.value) * 100) || 0)} className="rounded-lg border border-white/15 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100" /></label>; }
function safeFilename(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "facture"; }
