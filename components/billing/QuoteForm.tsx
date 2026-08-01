"use client";

import { useMemo, useState } from "react";
import { calculateDocumentTotals, formatCurrencyFromCents } from "@/lib/billing/calculations";
import type { BillingProductRow, QuoteDetails, QuoteProspectOption } from "@/lib/billing/types";

type LineState = {
  product_id: string;
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  vat_rate_percent: string;
  discount_percent: string;
};

export function QuoteForm({
  action,
  prospects,
  products,
  settings,
  quoteDetails,
  selectedProspectId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  prospects: QuoteProspectOption[];
  products: BillingProductRow[];
  settings: { default_currency: string; default_vat_rate_basis_points: number; default_terms: string | null; default_notes: string | null } | null;
  quoteDetails?: QuoteDetails | null;
  selectedProspectId?: number | null;
}) {
  const [lines, setLines] = useState<LineState[]>(() =>
    quoteDetails?.lines.length
      ? quoteDetails.lines.map((line) => ({
          product_id: line.product_id ? String(line.product_id) : "",
          description: line.description,
          quantity: formatDecimal(line.quantity_milli / 1000),
          unit: line.unit,
          unit_price: formatDecimal(line.unit_price_cents / 100),
          vat_rate_percent: formatDecimal(line.vat_rate_basis_points / 100),
          discount_percent: formatDecimal(line.discount_basis_points / 100),
        }))
      : [
          {
            product_id: "",
            description: "",
            quantity: "1",
            unit: "unité",
            unit_price: "0",
            vat_rate_percent: formatDecimal((settings?.default_vat_rate_basis_points ?? 0) / 100),
            discount_percent: "0",
          },
        ],
  );

  const totals = useMemo(() => {
    try {
      return calculateDocumentTotals(
        lines
          .filter((line) => line.description.trim())
          .map((line) => ({
            description: line.description,
            quantity_milli: Math.max(1, Math.round(parseFrenchFloat(line.quantity || "1") * 1000)),
            unit_price_cents: Math.max(0, Math.round(parseFrenchFloat(line.unit_price || "0") * 100)),
            vat_rate_basis_points: Math.max(0, Math.round(parseFrenchFloat(line.vat_rate_percent || "0") * 100)),
            discount_basis_points: Math.max(0, Math.round(parseFrenchFloat(line.discount_percent || "0") * 100)),
          })),
      );
    } catch {
      return null;
    }
  }, [lines]);

  function updateLine(index: number, patch: Partial<LineState>) {
    setLines((current) => current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)));
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((item) => String(item.id) === productId);
    if (!product) {
      updateLine(index, { product_id: "" });
      return;
    }
    updateLine(index, {
      product_id: productId,
      description: product.description ?? product.name,
      unit: product.unit,
      unit_price: formatDecimal(product.unit_price_cents / 100),
      vat_rate_percent: formatDecimal(product.vat_rate_basis_points / 100),
    });
  }

  return (
    <form action={action} className="grid gap-5">
      {quoteDetails ? <input type="hidden" name="id" value={quoteDetails.quote.id} /> : null}
      <input type="hidden" name="line_count" value={lines.length} />

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">
          Client CRM
          <select
            name="prospect_id"
            defaultValue={String(quoteDetails?.quote.prospect_id ?? selectedProspectId ?? prospects[0]?.id ?? "")}
            className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-zinc-100"
            required
          >
            {prospects.map((prospect) => (
              <option key={prospect.id} value={prospect.id} className="bg-zinc-900">
                {prospect.company_name} {prospect.email ? `- ${prospect.email}` : "- email manquant"}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Expiration
          <input
            type="date"
            name="expires_at"
            defaultValue={dateInputValue(quoteDetails?.quote.expires_at) ?? defaultExpiryDate()}
            className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-zinc-100"
          />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Devise
          <input
            name="currency"
            defaultValue={quoteDetails?.quote.currency ?? settings?.default_currency ?? "EUR"}
            className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-zinc-100"
            maxLength={3}
          />
        </label>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-zinc-100">Lignes du devis</h2>
          <button
            type="button"
            onClick={() =>
              setLines((current) => [
                ...current,
                {
                  product_id: "",
                  description: "",
                  quantity: "1",
                  unit: "unité",
                  unit_price: "0",
                  vat_rate_percent: formatDecimal((settings?.default_vat_rate_basis_points ?? 0) / 100),
                  discount_percent: "0",
                },
              ])
            }
            className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100"
          >
            Ajouter une ligne
          </button>
        </div>

        <div className="grid gap-3">
          {lines.map((line, index) => (
            <div key={index} className="grid gap-3 rounded-xl border border-white/10 bg-zinc-950/40 p-4 lg:grid-cols-12">
              <input type="hidden" name={`line_${index}_product_id`} value={line.product_id} />
              <label className="grid gap-1 text-xs text-zinc-400 lg:col-span-3">
                Catalogue
                <select value={line.product_id} onChange={(event) => selectProduct(index, event.target.value)} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100">
                  <option value="" className="bg-zinc-900">Ligne libre</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="bg-zinc-900">{product.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-zinc-400 lg:col-span-4">
                Description
                <input name={`line_${index}_description`} value={line.description} onChange={(event) => updateLine(index, { description: event.target.value })} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" required />
              </label>
              <label className="grid gap-1 text-xs text-zinc-400">
                Qté
                <input name={`line_${index}_quantity`} value={line.quantity} onChange={(event) => updateLine(index, { quantity: event.target.value })} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" inputMode="decimal" />
              </label>
              <label className="grid gap-1 text-xs text-zinc-400">
                Unité
                <input name={`line_${index}_unit`} value={line.unit} onChange={(event) => updateLine(index, { unit: event.target.value })} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" />
              </label>
              <label className="grid gap-1 text-xs text-zinc-400">
                Prix HT
                <input name={`line_${index}_unit_price`} value={line.unit_price} onChange={(event) => updateLine(index, { unit_price: event.target.value })} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" inputMode="decimal" />
              </label>
              <label className="grid gap-1 text-xs text-zinc-400">
                TVA %
                <input name={`line_${index}_vat_rate_percent`} value={line.vat_rate_percent} onChange={(event) => updateLine(index, { vat_rate_percent: event.target.value })} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" inputMode="decimal" />
              </label>
              <label className="grid gap-1 text-xs text-zinc-400">
                Remise %
                <input name={`line_${index}_discount_percent`} value={line.discount_percent} onChange={(event) => updateLine(index, { discount_percent: event.target.value })} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" inputMode="decimal" />
              </label>
              <div className="flex items-end">
                <button type="button" onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))} className="rounded-lg border border-rose-300/20 px-3 py-2 text-xs text-rose-100 disabled:opacity-30" disabled={lines.length === 1}>
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-zinc-300">
          Notes visibles sur le devis
          <textarea name="notes" defaultValue={quoteDetails?.quote.notes ?? settings?.default_notes ?? ""} rows={5} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-zinc-100" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Conditions
          <textarea name="terms" defaultValue={quoteDetails?.quote.terms ?? settings?.default_terms ?? ""} rows={5} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-zinc-100" />
        </label>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
        <div className="grid gap-1 text-sm text-zinc-200">
          <span>Total HT estimé : {totals ? formatCurrencyFromCents(totals.subtotal_cents) : "-"}</span>
          <span>TVA estimée : {totals ? formatCurrencyFromCents(totals.tax_cents) : "-"}</span>
          <strong className="text-lg text-zinc-100">Total TTC : {totals ? formatCurrencyFromCents(totals.total_cents) : "-"}</strong>
        </div>
        <button className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-cyan-200">
          Enregistrer le brouillon
        </button>
      </div>
    </form>
  );
}

function parseFrenchFloat(value: string) {
  return Number.parseFloat(value.replace(",", "."));
}

function formatDecimal(value: number) {
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 3, useGrouping: false });
}

function dateInputValue(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

function defaultExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}
