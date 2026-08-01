import { describe, expect, it } from "vitest";
import { applyBasisPoints, calculateDocumentTotals, calculateLineTotals, formatCurrencyFromCents, roundDivide } from "./calculations";

describe("billing calculations", () => {
  it("calcule une ligne HT, TVA et TTC en centimes", () => {
    expect(
      calculateLineTotals({
        description: "Audit IA",
        quantity_milli: 1000,
        unit_price_cents: 10000,
        vat_rate_basis_points: 2000,
      }),
    ).toEqual({
      gross_cents: 10000,
      discount_cents: 0,
      subtotal_cents: 10000,
      tax_cents: 2000,
      total_cents: 12000,
    });
  });

  it("gère les quantités décimales sans float stocké", () => {
    expect(
      calculateLineTotals({
        description: "Accompagnement",
        quantity_milli: 1500,
        unit_price_cents: 8000,
        vat_rate_basis_points: 0,
      }).total_cents,
    ).toBe(12000);
  });

  it("applique les remises en points de base avant TVA", () => {
    expect(
      calculateLineTotals({
        description: "CRM IA",
        quantity_milli: 1000,
        unit_price_cents: 10000,
        discount_basis_points: 1000,
        vat_rate_basis_points: 2000,
      }),
    ).toMatchObject({
      gross_cents: 10000,
      discount_cents: 1000,
      subtotal_cents: 9000,
      tax_cents: 1800,
      total_cents: 10800,
    });
  });

  it("additionne plusieurs lignes avec TVA et remises", () => {
    expect(
      calculateDocumentTotals([
        {
          description: "Audit",
          quantity_milli: 1000,
          unit_price_cents: 10000,
          vat_rate_basis_points: 0,
        },
        {
          description: "Mise en place",
          quantity_milli: 2000,
          unit_price_cents: 5000,
          discount_basis_points: 500,
          vat_rate_basis_points: 2000,
        },
      ]),
    ).toMatchObject({
      subtotal_cents: 19500,
      discount_cents: 500,
      tax_cents: 1900,
      total_cents: 21400,
    });
  });

  it("arrondit au centime le plus proche", () => {
    expect(roundDivide(1005, 10)).toBe(101);
    expect(applyBasisPoints(999, 2000)).toBe(200);
  });

  it("formate un montant en euros", () => {
    expect(formatCurrencyFromCents(123456)).toContain("1 234,56");
  });

  it("refuse les remises supérieures à 100%", () => {
    expect(() =>
      calculateLineTotals({
        description: "Erreur",
        quantity_milli: 1000,
        unit_price_cents: 1000,
        vat_rate_basis_points: 0,
        discount_basis_points: 10001,
      }),
    ).toThrow("discount_basis_points");
  });
});
