import { describe, expect, it, vi } from "vitest";
import { detectManualPurchaseDuplicate } from "./purchases";
import { mapManualPurchaseExtraction, validateManualPurchaseFile } from "./purchase-manual-import";

describe("validation des documents déposés manuellement", () => {
  it("accepte un PDF dont le MIME et la signature concordent", () => {
    const content = Buffer.from("%PDF-1.7\ncontenu de facture");
    expect(validateManualPurchaseFile({ filename: "facture.pdf", contentType: "application/pdf", size: content.length, content })).toEqual({ contentType: "application/pdf", filename: "facture.pdf" });
  });

  it("refuse un type MIME qui ne correspond pas à la signature", () => {
    const content = Buffer.from("%PDF-1.7\ncontenu de facture");
    expect(() => validateManualPurchaseFile({ filename: "facture.png", contentType: "image/png", size: content.length, content })).toThrow("type réel du fichier");
  });
});

describe("mapping de l'analyse IA manuelle", () => {
  it("prépare un aperçu éditable avec les valeurs sûres par défaut", () => {
    const draft = mapManualPurchaseExtraction({
      is_invoice: true,
      supplier_name: "OVH",
      supplier_email: null,
      supplier_website: null,
      supplier_vat_number: null,
      supplier_siren_or_siret: null,
      entity: null,
      category: null,
      invoice_number: "OVH-42",
      invoice_date: "2026-08-09",
      due_at: null,
      currency: "eur",
      subtotal_cents: 1000,
      tax_cents: 200,
      total_cents: 1200,
      confidence: 87,
      summary: "Hébergement mensuel",
      lines: [],
    });

    expect(draft).toMatchObject({ supplierName: "OVH", invoiceNumber: "OVH-42", currency: "EUR", entity: "CORSAIMANAGER", category: "other", description: "Hébergement mensuel", totalCents: 1200 });
  });
});

describe("doublons d'import manuel", () => {
  const base = { supplierName: "OVH", invoiceNumber: "OVH-42", invoiceDate: "2026-08-09", totalCents: 1200 };

  it("privilégie le numéro de facture", async () => {
    const byNumber = vi.fn(async () => 12);
    const byFallback = vi.fn(async () => 24);
    await expect(detectManualPurchaseDuplicate(base, { findByInvoiceNumber: byNumber, findBySupplierDateTotal: byFallback })).resolves.toBe(12);
    expect(byFallback).not.toHaveBeenCalled();
  });

  it("utilise fournisseur, date et TTC lorsque le numéro est absent", async () => {
    const byFallback = vi.fn(async () => 24);
    await expect(detectManualPurchaseDuplicate({ ...base, invoiceNumber: "" }, { findByInvoiceNumber: vi.fn(), findBySupplierDateTotal: byFallback })).resolves.toBe(24);
    expect(byFallback).toHaveBeenCalledWith("ovh", "2026-08-09", 1200);
  });
});
