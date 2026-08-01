import { describe, expect, it } from "vitest";
import { createInMemoryBillingNumberAllocator, formatBillingDocumentNumber } from "./numbering";

describe("billing numbering", () => {
  it("formate les numéros de documents", () => {
    expect(formatBillingDocumentNumber("DEV", 2026, 1)).toBe("DEV-2026-0001");
    expect(formatBillingDocumentNumber("FAC", 2026, 42)).toBe("FAC-2026-0042");
  });

  it("sépare les séquences par type de document", async () => {
    const allocate = createInMemoryBillingNumberAllocator();
    const issuedAt = new Date("2026-08-01T10:00:00.000Z");

    await expect(allocate({ documentType: "quote", issuedAt })).resolves.toMatchObject({ number: "DEV-2026-0001" });
    await expect(allocate({ documentType: "invoice", issuedAt })).resolves.toMatchObject({ number: "FAC-2026-0001" });
    await expect(allocate({ documentType: "quote", issuedAt })).resolves.toMatchObject({ number: "DEV-2026-0002" });
  });

  it("résiste aux allocations concurrentes sans doublons", async () => {
    const allocate = createInMemoryBillingNumberAllocator();
    const issuedAt = new Date("2026-08-01T10:00:00.000Z");
    const allocations = await Promise.all(
      Array.from({ length: 50 }, () => allocate({ documentType: "credit_note", issuedAt })),
    );

    const numbers = allocations.map((allocation) => allocation.number);
    expect(new Set(numbers).size).toBe(50);
    expect(numbers).toContain("AV-2026-0001");
    expect(numbers).toContain("AV-2026-0050");
  });

  it("repart à 1 sur une nouvelle année", async () => {
    const allocate = createInMemoryBillingNumberAllocator();

    await expect(allocate({ documentType: "quote", issuedAt: new Date("2026-12-31T12:00:00.000Z") })).resolves.toMatchObject({
      number: "DEV-2026-0001",
    });
    await expect(allocate({ documentType: "quote", issuedAt: new Date("2027-01-01T12:00:00.000Z") })).resolves.toMatchObject({
      number: "DEV-2027-0001",
    });
  });
});
