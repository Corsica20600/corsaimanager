import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildPurchaseMailboxScanPlan,
  createPurchaseEmailScanError,
  extractPurchaseInvoiceWithAi,
  parseMailboxConfigDetailed,
  runScanStage,
  scanPurchaseInvoiceMailboxes,
  shouldSkipExistingPurchaseEmailImport,
  type PurchaseEmailScanStage,
  type PurchaseMailboxConfig,
} from "./purchase-email-scan";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
          errors: [{
            mailbox: entry.address,
            messageId: "message-1",
            stage: "openai_request" as const,
            code: "400",
            message: "OpenAI extraction failed",
            retryable: false,
          }],
        };
      }),
    });

    expect(result.status).toBe("completed_with_errors");
    expect(result.mailboxes.find((entry) => entry.address === "longin.erwan@gmail.com")?.status).toBe("connection_error");
    expect(result.createdInvoices).toBe(1);
    expect(result.processedMessages).toBe(8);
    expect(result.errorDetails).toHaveLength(2);
    expect(result.mailboxes.find((entry) => entry.address === "contact@traknio.com")?.errors[0]?.stage).toBe("openai_request");
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
      errors: [],
    }));

    const result = await scanPurchaseInvoiceMailboxes({ scanMailbox });

    expect(scanMailbox).toHaveBeenCalledOnce();
    expect(result.status).toBe("completed");
  });
});

describe("purchase email scan error diagnostics", () => {
  it("une erreur OpenAI HTTP 400 produit stage=openai_request", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Invalid value: unsupported schema", { status: 400 })));

    const error = await captureScanError(() => extractPurchaseInvoiceWithAi({
      mailbox: "longin.erwan@gmail.com",
      parsed: parsedMail(),
      attachments: [],
    }));

    expect(error.stage).toBe("openai_request");
    expect(error.code).toBe("400");
    expect(error.retryable).toBe(false);
    expect(error.message).toContain("Invalid value");
  });

  it("une erreur OpenAI 429 est retryable", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("rate limited", { status: 429 })));

    const error = await captureScanError(() => extractPurchaseInvoiceWithAi({
      mailbox: "longin.erwan@gmail.com",
      parsed: parsedMail(),
      attachments: [],
    }));

    expect(error.stage).toBe("openai_request");
    expect(error.code).toBe("429");
    expect(error.retryable).toBe(true);
  });

  it("une réponse OpenAI invalide produit stage=openai_response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ output: [] })));

    const error = await captureScanError(() => extractPurchaseInvoiceWithAi({
      mailbox: "longin.erwan@gmail.com",
      parsed: parsedMail(),
      attachments: [],
    }));

    expect(error.stage).toBe("openai_response");
    expect(error.code).toBe("invalid_response");
    expect(error.retryable).toBe(false);
  });

  it("une erreur Blob produit stage=blob_upload", async () => {
    const error = await captureStagedError("blob_upload", Object.assign(new Error("Blob timeout"), { code: "ETIMEDOUT" }));

    expect(error.stage).toBe("blob_upload");
    expect(error.code).toBe("ETIMEDOUT");
    expect(error.retryable).toBe(true);
  });

  it("une erreur DB produit stage=database", async () => {
    const error = await captureStagedError("database", Object.assign(new Error("connection timeout"), { code: "ETIMEDOUT" }));

    expect(error.stage).toBe("database");
    expect(error.code).toBe("ETIMEDOUT");
    expect(error.retryable).toBe(true);
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

function parsedMail() {
  return {
    subject: "Facture test",
    text: "facture",
    attachments: [],
    from: { text: "Supplier <supplier@example.com>" },
  } as never;
}

async function captureScanError(action: () => Promise<unknown>) {
  try {
    await action();
  } catch (error) {
    return createPurchaseEmailScanError({
      mailbox: "longin.erwan@gmail.com",
      messageId: "message-1",
      parsed: parsedMail(),
      stage: "unknown",
      error,
    });
  }
  throw new Error("Expected action to fail.");
}

async function captureStagedError(stage: PurchaseEmailScanStage, thrown: Error & { code?: string }) {
  try {
    await runScanStage(stage, async () => {
      throw thrown;
    });
  } catch (error) {
    return createPurchaseEmailScanError({
      mailbox: "longin.erwan@gmail.com",
      messageId: "message-1",
      parsed: parsedMail(),
      stage: "unknown",
      error,
    });
  }
  throw new Error("Expected stage to fail.");
}
