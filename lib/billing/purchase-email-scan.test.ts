import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildPurchaseMailboxScanPlan,
  parseMailboxConfigDetailed,
  scanPurchaseInvoiceMailboxes,
  shouldSkipExistingPurchaseEmailImport,
  type PurchaseMailboxConfig,
} from "./purchase-email-scan";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("purchase email scan configuration", () => {
  it("permet de scanner avec une seule boîte configurée", () => {
    process.env.PURCHASE_EMAIL_LONGIN_GMAIL_PASSWORD = "secret";
    const plan = buildPurchaseMailboxScanPlan([
      mailbox("longin.erwan@gmail.com", "PURCHASE_EMAIL_LONGIN_GMAIL_PASSWORD"),
    ]);

    expect(plan.ready).toHaveLength(1);
    expect(plan.ready[0]?.address).toBe("longin.erwan@gmail.com");
    expect(plan.results.filter((result) => result.status === "missing_config")).toHaveLength(3);
  });

  it("isole une boîte non configurée sans bloquer les autres", () => {
    process.env.PURCHASE_EMAIL_TRAKNIO_PASSWORD = "secret";
    const plan = buildPurchaseMailboxScanPlan([
      mailbox("contact@traknio.com", "PURCHASE_EMAIL_TRAKNIO_PASSWORD"),
      { address: "contact@sentieru.fr", provider: "imap", host: "imap.hostinger.com" },
    ]);

    expect(plan.ready.map((entry) => entry.address)).toEqual(["contact@traknio.com"]);
    expect(plan.results.find((entry) => entry.address === "contact@sentieru.fr")?.status).toBe("missing_config");
  });

  it("ignore une boîte inconnue et une entrée mal formée", () => {
    process.env.PURCHASE_EMAIL_MAILBOXES_JSON = JSON.stringify([
      mailbox("contact@traknio.com", "PURCHASE_EMAIL_TRAKNIO_PASSWORD"),
      { address: "contact@example.com", passwordEnv: "IGNORED" },
      "bad-entry",
    ]);

    const parsed = parseMailboxConfigDetailed();

    expect(parsed.mailboxes.map((entry) => entry.address)).toEqual(["contact@traknio.com"]);
    expect(parsed.ignoredMailboxes).toEqual(["contact@example.com"]);
    expect(parsed.invalidEntries).toBe(2);
  });
});

describe("purchase email scan orchestration", () => {
  it("ne masque pas le scanner désactivé comme un succès", async () => {
    process.env.PURCHASE_EMAIL_SCAN_ENABLED = "false";

    const result = await scanPurchaseInvoiceMailboxes({ scanMailbox: vi.fn() });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("disabled");
    expect(result.scannedMailboxes).toBe(0);
  });

  it("n'arrête pas les autres boîtes après une erreur IMAP", async () => {
    process.env.PURCHASE_EMAIL_SCAN_ENABLED = "true";
    process.env.PURCHASE_EMAIL_MAILBOXES_JSON = JSON.stringify([
      mailbox("longin.erwan@gmail.com", "PURCHASE_EMAIL_LONGIN_GMAIL_PASSWORD"),
      mailbox("contact@traknio.com", "PURCHASE_EMAIL_TRAKNIO_PASSWORD"),
    ]);
    process.env.PURCHASE_EMAIL_LONGIN_GMAIL_PASSWORD = "secret";
    process.env.PURCHASE_EMAIL_TRAKNIO_PASSWORD = "secret";

    const result = await scanPurchaseInvoiceMailboxes({
      scanMailbox: vi.fn(async (entry) => {
        if (entry.address === "longin.erwan@gmail.com") throw Object.assign(new Error("invalid credentials"), { code: "AUTHENTICATIONFAILED" });
        return {
          address: entry.address,
          provider: entry.provider,
          status: "completed" as const,
          processedMessages: 8,
          createdInvoices: 1,
          skippedMessages: 6,
          failedMessages: 1,
          error: "OpenAI extraction failed",
        };
      }),
    });

    expect(result.status).toBe("completed_with_errors");
    expect(result.mailboxes.find((entry) => entry.address === "longin.erwan@gmail.com")?.status).toBe("connection_error");
    expect(result.createdInvoices).toBe(1);
    expect(result.processedMessages).toBe(8);
  });

  it("utilise le même moteur injectable pour le cron et le scan manuel", async () => {
    process.env.PURCHASE_EMAIL_SCAN_ENABLED = "true";
    process.env.PURCHASE_EMAIL_MAILBOXES_JSON = JSON.stringify([mailbox("contact@traknio.com", "PURCHASE_EMAIL_TRAKNIO_PASSWORD")]);
    process.env.PURCHASE_EMAIL_TRAKNIO_PASSWORD = "secret";
    const scanMailbox = vi.fn(async (entry: PurchaseMailboxConfig) => ({
      address: entry.address,
      provider: entry.provider,
      status: "completed" as const,
      processedMessages: 1,
      createdInvoices: 0,
      skippedMessages: 1,
      failedMessages: 0,
      error: null,
    }));

    const result = await scanPurchaseInvoiceMailboxes({ scanMailbox });

    expect(scanMailbox).toHaveBeenCalledOnce();
    expect(result.status).toBe("completed");
  });
});

describe("purchase email import retry policy", () => {
  it("ne recrée pas une facture déjà traitée", () => {
    expect(shouldSkipExistingPurchaseEmailImport("EXTRACTED")).toBe(true);
  });

  it("permet de retenter une erreur temporaire", () => {
    expect(shouldSkipExistingPurchaseEmailImport("FAILED")).toBe(false);
  });

  it("laisse ignoré un email réellement non pertinent", () => {
    expect(shouldSkipExistingPurchaseEmailImport("IGNORED")).toBe(true);
  });
});

function mailbox(address: PurchaseMailboxConfig["address"], passwordEnv: string): PurchaseMailboxConfig {
  return {
    address,
    provider: address.endsWith("@gmail.com") ? "gmail" : "imap",
    host: address.endsWith("@gmail.com") ? "imap.gmail.com" : "imap.hostinger.com",
    port: 993,
    secure: true,
    username: address,
    passwordEnv,
  };
}
