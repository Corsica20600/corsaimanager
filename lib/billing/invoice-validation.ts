import { calculateDocumentTotals } from "./calculations";
import { paymentMethods, paymentStatuses, type CreditNoteDraftInput, type InvoiceDraftInput, type PaymentInput } from "./types";
import { normalizeQuoteLineInput } from "./quote-validation";

export function validateInvoiceDraftInput(input: InvoiceDraftInput) {
  if (!Number.isInteger(input.prospect_id) || input.prospect_id < 1) throw new Error("Prospect invalide.");
  if (input.origin !== "MANUAL" && input.origin !== "QUOTE") throw new Error("Origine de facture invalide.");
  if (!input.currency?.trim()) throw new Error("Devise manquante.");
  if (!input.lines.length) throw new Error("Ajoutez au moins une ligne à la facture.");
  const lines = input.lines.map(normalizeQuoteLineInput);
  calculateDocumentTotals(lines);
  return {
    ...input,
    quote_id: Number.isInteger(input.quote_id) && input.quote_id ? input.quote_id : null,
    currency: input.currency.trim().toUpperCase().slice(0, 3),
    due_at: nullable(input.due_at, 64),
    notes: nullable(input.notes, 5000),
    terms: nullable(input.terms, 5000),
    lines,
  };
}

export function validatePaymentInput(input: PaymentInput) {
  if (!Number.isInteger(input.invoice_id) || input.invoice_id < 1) throw new Error("Facture invalide.");
  if (!Number.isInteger(input.amount_cents) || input.amount_cents <= 0) throw new Error("Montant de paiement invalide.");
  if (!paymentMethods.includes(input.method)) throw new Error("Moyen de paiement invalide.");
  if (!paymentStatuses.includes(input.status)) throw new Error("Statut de paiement invalide.");
  return {
    ...input,
    paid_at: nullable(input.paid_at, 64) ?? new Date().toISOString(),
    reference: nullable(input.reference, 200),
    comment: nullable(input.comment, 1000),
  };
}

export function validateCreditNoteDraftInput(input: CreditNoteDraftInput) {
  if (!Number.isInteger(input.invoice_id) || input.invoice_id < 1) throw new Error("Facture invalide.");
  const reason = input.reason.trim();
  if (!reason) throw new Error("Le motif de l'avoir est obligatoire.");
  if (!input.lines.length) throw new Error("Ajoutez au moins une ligne à l'avoir.");
  const lines = input.lines.map(normalizeQuoteLineInput);
  calculateDocumentTotals(lines);
  return {
    invoice_id: input.invoice_id,
    reason: reason.slice(0, 1000),
    lines,
  };
}

function nullable(value: string | null | undefined, maxLength: number) {
  const text = value?.trim();
  return text ? text.slice(0, maxLength) : null;
}
