import { describe, expect, it } from "vitest";
import { assertQuoteStatusTransition, canTransitionQuoteStatus, isQuoteExpired } from "./quote-status";

describe("quote status transitions", () => {
  it("allows the quote phase 2 lifecycle", () => {
    expect(canTransitionQuoteStatus("DRAFT", "SENT")).toBe(true);
    expect(canTransitionQuoteStatus("SENT", "VIEWED")).toBe(true);
    expect(canTransitionQuoteStatus("VIEWED", "ACCEPTED")).toBe(true);
    expect(canTransitionQuoteStatus("VIEWED", "REJECTED")).toBe(true);
    expect(canTransitionQuoteStatus("DRAFT", "ACCEPTED")).toBe(true);
  });

  it("rejects unsafe transitions", () => {
    expect(() => assertQuoteStatusTransition("ACCEPTED", "DRAFT")).toThrow("Transition de devis interdite");
    expect(canTransitionQuoteStatus("DRAFT", "REJECTED")).toBe(false);
  });

  it("detects expired quotes", () => {
    expect(isQuoteExpired("2026-01-01T00:00:00.000Z", new Date("2026-01-02T00:00:00.000Z"))).toBe(true);
    expect(isQuoteExpired("2026-01-03T00:00:00.000Z", new Date("2026-01-02T00:00:00.000Z"))).toBe(false);
  });
});
