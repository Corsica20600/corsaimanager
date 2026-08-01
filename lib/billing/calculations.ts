import type { BillingDocumentTotals, BillingLineInput, BillingLineTotals } from "./types";

const quantityScale = 1000;
const basisPointScale = 10000;

export function calculateLineTotals(line: BillingLineInput): BillingLineTotals {
  assertNonNegativeInteger(line.quantity_milli, "quantity_milli");
  assertNonNegativeInteger(line.unit_price_cents, "unit_price_cents");
  assertNonNegativeInteger(line.vat_rate_basis_points, "vat_rate_basis_points");
  assertNonNegativeInteger(line.discount_basis_points ?? 0, "discount_basis_points");

  if (line.quantity_milli === 0) throw new Error("quantity_milli doit être supérieur à 0.");
  if ((line.discount_basis_points ?? 0) > basisPointScale) {
    throw new Error("discount_basis_points ne peut pas dépasser 10000.");
  }

  const gross_cents = roundDivide(line.unit_price_cents * line.quantity_milli, quantityScale);
  const discount_cents = applyBasisPoints(gross_cents, line.discount_basis_points ?? 0);
  const subtotal_cents = gross_cents - discount_cents;
  const tax_cents = applyBasisPoints(subtotal_cents, line.vat_rate_basis_points);
  const total_cents = subtotal_cents + tax_cents;

  return {
    gross_cents,
    discount_cents,
    subtotal_cents,
    tax_cents,
    total_cents,
  };
}

export function calculateDocumentTotals(lines: BillingLineInput[]): BillingDocumentTotals {
  if (!lines.length) {
    return {
      subtotal_cents: 0,
      discount_cents: 0,
      tax_cents: 0,
      total_cents: 0,
      lines: [],
    };
  }

  const lineTotals = lines.map(calculateLineTotals);

  return {
    subtotal_cents: sum(lineTotals.map((line) => line.subtotal_cents)),
    discount_cents: sum(lineTotals.map((line) => line.discount_cents)),
    tax_cents: sum(lineTotals.map((line) => line.tax_cents)),
    total_cents: sum(lineTotals.map((line) => line.total_cents)),
    lines: lineTotals,
  };
}

export function formatCurrencyFromCents(amount_cents: number, currency = "EUR", locale = "fr-FR") {
  assertInteger(amount_cents, "amount_cents");
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount_cents / 100);
}

export function roundDivide(numerator: number, denominator: number) {
  assertInteger(numerator, "numerator");
  assertNonNegativeInteger(denominator, "denominator");
  if (denominator === 0) throw new Error("denominator ne peut pas valoir 0.");
  return Math.floor((numerator + denominator / 2) / denominator);
}

export function applyBasisPoints(amount_cents: number, basis_points: number) {
  assertNonNegativeInteger(amount_cents, "amount_cents");
  assertNonNegativeInteger(basis_points, "basis_points");
  return roundDivide(amount_cents * basis_points, basisPointScale);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function assertInteger(value: number, field: string) {
  if (!Number.isInteger(value)) throw new Error(`${field} doit être un entier.`);
}

function assertNonNegativeInteger(value: number, field: string) {
  assertInteger(value, field);
  if (value < 0) throw new Error(`${field} doit être positif ou nul.`);
}
