import { calculateDocumentTotals } from "./calculations";
import type { QuoteDraftInput, QuoteLineInput } from "./types";

export function validateQuoteDraftInput(input: QuoteDraftInput) {
  if (!Number.isInteger(input.prospect_id) || input.prospect_id < 1) throw new Error("Prospect invalide.");
  if (!input.currency?.trim()) throw new Error("Devise manquante.");
  if (!input.lines.length) throw new Error("Ajoutez au moins une ligne au devis.");

  const lines = input.lines.map(normalizeQuoteLineInput);
  calculateDocumentTotals(lines);

  return {
    ...input,
    currency: input.currency.trim().toUpperCase().slice(0, 3),
    notes: normalizeNullableText(input.notes, 5000),
    terms: normalizeNullableText(input.terms, 5000),
    expires_at: normalizeNullableText(input.expires_at, 64),
    lines,
  };
}

export function normalizeQuoteLineInput(line: QuoteLineInput): QuoteLineInput {
  const description = line.description.trim();
  if (!description) throw new Error("Chaque ligne doit avoir une description.");
  if (!line.unit?.trim()) throw new Error("Chaque ligne doit avoir une unité.");

  return {
    product_id: Number.isInteger(line.product_id) && line.product_id ? line.product_id : null,
    description: description.slice(0, 2000),
    quantity_milli: normalizeInteger(line.quantity_milli, "quantité"),
    unit: line.unit.trim().slice(0, 60),
    unit_price_cents: normalizeInteger(line.unit_price_cents, "prix unitaire"),
    vat_rate_basis_points: normalizeInteger(line.vat_rate_basis_points, "TVA"),
    discount_basis_points: normalizeInteger(line.discount_basis_points ?? 0, "remise"),
    sort_order: Number.isInteger(line.sort_order) ? line.sort_order : 0,
  };
}

function normalizeInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} invalide.`);
  return value;
}

function normalizeNullableText(value: string | null | undefined, maxLength: number) {
  const text = value?.trim();
  return text ? text.slice(0, maxLength) : null;
}
