import { describe, expect, it, vi } from "vitest";
import { deleteImportedPurchaseInvoice } from "./purchases";

const importedInvoice = {
  id: 42,
  source_mailbox: "contact@corsaimanager.com",
  source_message_id: "message-42",
  supplier_id: 7,
  total_cents: 1299,
};

describe("deleteImportedPurchaseInvoice", () => {
  it("supprime les relations, le Blob devenu orphelin et conserve un audit", async () => {
    const deleteRelations = vi.fn(async () => [{ blob_path: "purchase-invoices/mail/42/facture.pdf", blob_url: "https://blob.test/facture.pdf" }]);
    const countBlobReferences = vi.fn(async () => 0);
    const deleteBlob = vi.fn(async () => undefined);
    const recordAudit = vi.fn(async () => undefined);

    const result = await deleteImportedPurchaseInvoice(42, "Import erroné", {
      findInvoice: vi.fn(async () => importedInvoice),
      deleteRelations,
      countBlobReferences,
      deleteBlob,
      recordAudit,
    });

    expect(result).toEqual({ id: 42, blobCleanupWarnings: 0 });
    expect(deleteRelations).toHaveBeenCalledWith(42);
    expect(countBlobReferences).toHaveBeenCalledWith("purchase-invoices/mail/42/facture.pdf");
    expect(deleteBlob).toHaveBeenCalledWith("purchase-invoices/mail/42/facture.pdf");
    expect(recordAudit).toHaveBeenCalledWith(importedInvoice, "Import erroné");
  });

  it("ne supprime pas un Blob encore référencé par un autre achat", async () => {
    const deleteBlob = vi.fn(async () => undefined);
    const countBlobReferences = vi.fn(async () => 1);

    await deleteImportedPurchaseInvoice(42, null, {
      findInvoice: vi.fn(async () => importedInvoice),
      deleteRelations: vi.fn(async () => [{ blob_path: "purchase-invoices/shared.pdf", blob_url: "https://blob.test/shared.pdf" }]),
      countBlobReferences,
      deleteBlob,
      recordAudit: vi.fn(async () => undefined),
    });

    expect(countBlobReferences).toHaveBeenCalledWith("purchase-invoices/shared.pdf");
    expect(deleteBlob).not.toHaveBeenCalled();
  });

  it("nettoie chaque Blob orphelin une seule fois même si plusieurs pièces jointes pointent dessus", async () => {
    const deleteBlob = vi.fn(async () => undefined);
    const countBlobReferences = vi.fn(async () => 0);

    await deleteImportedPurchaseInvoice(42, null, {
      findInvoice: vi.fn(async () => importedInvoice),
      deleteRelations: vi.fn(async () => [
        { blob_path: "purchase-invoices/duplicate.pdf", blob_url: "https://blob.test/duplicate.pdf" },
        { blob_path: "purchase-invoices/duplicate.pdf", blob_url: "https://blob.test/duplicate.pdf" },
      ]),
      countBlobReferences,
      deleteBlob,
      recordAudit: vi.fn(async () => undefined),
    });

    expect(countBlobReferences).toHaveBeenCalledOnce();
    expect(deleteBlob).toHaveBeenCalledOnce();
    expect(deleteBlob).toHaveBeenCalledWith("purchase-invoices/duplicate.pdf");
  });

  it("refuse de supprimer un achat non issu d'un import e-mail", async () => {
    const deleteRelations = vi.fn();

    await expect(deleteImportedPurchaseInvoice(42, null, {
      findInvoice: vi.fn(async () => ({ ...importedInvoice, source_mailbox: null, source_message_id: null })),
      deleteRelations,
    })).rejects.toThrow("Seuls les achats importés automatiquement");

    expect(deleteRelations).not.toHaveBeenCalled();
  });

  it("conserve la suppression lorsque le nettoyage Blob échoue", async () => {
    const recordAudit = vi.fn(async () => undefined);

    const result = await deleteImportedPurchaseInvoice(42, null, {
      findInvoice: vi.fn(async () => importedInvoice),
      deleteRelations: vi.fn(async () => [{ blob_path: "purchase-invoices/mail/42/facture.pdf", blob_url: "https://blob.test/facture.pdf" }]),
      countBlobReferences: vi.fn(async () => 0),
      deleteBlob: vi.fn(async () => { throw new Error("Blob indisponible"); }),
      recordAudit,
    });

    expect(result.blobCleanupWarnings).toBe(1);
    expect(recordAudit).toHaveBeenCalledOnce();
  });
});
