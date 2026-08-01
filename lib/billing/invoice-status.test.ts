import { describe, expect, it } from "vitest";
import {
  assertCreditAmountAllowed,
  assertInvoiceStatusTransition,
  assertPaymentAllowed,
  computeInvoiceBalance,
  computeInvoiceStatus,
} from "./invoice-status";

describe("invoice status and money rules", () => {
  it("keeps draft invoices unnumbered and editable until finalization", () => {
    expect(computeInvoiceStatus({ currentStatus: "DRAFT", total_cents: 10000, paid_cents: 0, remaining_cents: 10000 })).toBe("DRAFT");
    expect(() => assertInvoiceStatusTransition("DRAFT", "FINALIZED")).not.toThrow();
    expect(() => assertInvoiceStatusTransition("FINALIZED", "DRAFT")).toThrow("Transition de facture interdite");
  });

  it("moves to partial, paid and overdue according to balance", () => {
    expect(computeInvoiceStatus({ currentStatus: "SENT", total_cents: 10000, paid_cents: 4000, remaining_cents: 6000 })).toBe("PARTIALLY_PAID");
    expect(computeInvoiceStatus({ currentStatus: "SENT", total_cents: 10000, paid_cents: 10000, remaining_cents: 0 })).toBe("PAID");
    expect(computeInvoiceStatus({ currentStatus: "FINALIZED", total_cents: 10000, paid_cents: 0, remaining_cents: 10000, due_at: "2026-01-01T00:00:00Z", now: new Date("2026-01-02T00:00:00Z") })).toBe("OVERDUE");
  });

  it("rejects overpayments and accepts partial payments", () => {
    expect(() => assertPaymentAllowed({ amount_cents: 3000, remaining_cents: 5000, status: "SENT", paymentStatus: "SUCCEEDED" })).not.toThrow();
    expect(computeInvoiceBalance({ total_cents: 10000, paid_cents: 3000 })).toEqual({ remaining_cents: 7000 });
    expect(() => assertPaymentAllowed({ amount_cents: 6000, remaining_cents: 5000, status: "SENT", paymentStatus: "SUCCEEDED" })).toThrow("dépasse");
  });

  it("bounds partial and total credit notes", () => {
    expect(() => assertCreditAmountAllowed({ credit_cents: 3000, invoice_total_cents: 10000, already_credited_cents: 2000 })).not.toThrow();
    expect(() => assertCreditAmountAllowed({ credit_cents: 8000, invoice_total_cents: 10000, already_credited_cents: 3000 })).toThrow("dépasse");
    expect(() => assertCreditAmountAllowed({ credit_cents: 10000, invoice_total_cents: 10000, already_credited_cents: 0 })).not.toThrow();
  });
});
