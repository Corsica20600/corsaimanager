import { describe, expect, it } from "vitest";
import { validateCreditNoteDraftInput, validateInvoiceDraftInput, validatePaymentInput } from "./invoice-validation";

const line = {
  description: "Prestation IA",
  quantity_milli: 1000,
  unit: "forfait",
  unit_price_cents: 120000,
  vat_rate_basis_points: 0,
  discount_basis_points: 0,
};

describe("invoice validation", () => {
  it("accepts manual and quote invoice drafts without numbers", () => {
    expect(validateInvoiceDraftInput({ prospect_id: 1, origin: "MANUAL", currency: "eur", lines: [line] })).toMatchObject({ origin: "MANUAL", currency: "EUR" });
    expect(validateInvoiceDraftInput({ prospect_id: 1, quote_id: 9, origin: "QUOTE", currency: "EUR", lines: [line] })).toMatchObject({ quote_id: 9, origin: "QUOTE" });
  });

  it("validates payments and credit notes", () => {
    expect(validatePaymentInput({ invoice_id: 1, amount_cents: 1000, method: "bank_transfer", status: "SUCCEEDED" })).toMatchObject({ amount_cents: 1000 });
    expect(() => validatePaymentInput({ invoice_id: 1, amount_cents: 0, method: "bank_transfer", status: "SUCCEEDED" })).toThrow("Montant");
    expect(validateCreditNoteDraftInput({ invoice_id: 1, reason: "Avoir partiel", lines: [line] })).toMatchObject({ reason: "Avoir partiel" });
    expect(() => validateCreditNoteDraftInput({ invoice_id: 1, reason: "", lines: [line] })).toThrow("motif");
  });
});
