import { describe, expect, it } from "vitest";
import { validateQuoteDraftInput } from "./quote-validation";

describe("quote draft validation", () => {
  it("normalizes money-ready line input without mutating cents", () => {
    const draft = validateQuoteDraftInput({
      prospect_id: 12,
      currency: " eur ",
      lines: [
        {
          description: "  Audit IA  ",
          quantity_milli: 1500,
          unit: " jour ",
          unit_price_cents: 99000,
          vat_rate_basis_points: 2000,
          discount_basis_points: 500,
        },
      ],
    });

    expect(draft.currency).toBe("EUR");
    expect(draft.lines[0]).toMatchObject({
      description: "Audit IA",
      quantity_milli: 1500,
      unit: "jour",
      unit_price_cents: 99000,
      vat_rate_basis_points: 2000,
      discount_basis_points: 500,
    });
  });

  it("requires at least one valid line", () => {
    expect(() => validateQuoteDraftInput({ prospect_id: 1, currency: "EUR", lines: [] })).toThrow("Ajoutez au moins une ligne");
    expect(() =>
      validateQuoteDraftInput({
        prospect_id: 1,
        currency: "EUR",
        lines: [{ description: "", quantity_milli: 1000, unit: "unité", unit_price_cents: 100, vat_rate_basis_points: 0 }],
      }),
    ).toThrow("Chaque ligne doit avoir une description");
  });
});
