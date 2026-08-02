import { describe, expect, it } from "vitest";
import { renderCreditNotePdfBuffer, renderInvoicePdfBuffer } from "./invoice-pdf";
import type { CreditNoteDetails, InvoiceDetails } from "./types";

describe("invoice and credit note PDFs", () => {
  it("renders a valid invoice PDF", async () => {
    const buffer = await renderInvoicePdfBuffer(makeInvoiceDetails());
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("renders a valid credit note PDF", async () => {
    const buffer = await renderCreditNotePdfBuffer(makeCreditNoteDetails());
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(1000);
  });
});

function makeInvoiceDetails(): InvoiceDetails {
  return {
    invoice: {
      id: 1,
      prospect_id: 2,
      number: "FAC-2026-0001",
      origin: "MANUAL",
      quote_id: null,
      customer_subscription_id: null,
      stripe_invoice_id: null,
      stripe_invoice_number: null,
      created_at: "2026-07-22T09:00:00Z",
      issued_at: "2026-07-22T09:00:00Z",
      due_at: "2026-08-21T09:00:00Z",
      finalized_at: "2026-07-22T09:00:00Z",
      status: "SENT",
      currency: "EUR",
      subtotal_cents: 100000,
      tax_cents: 0,
      total_cents: 100000,
      paid_cents: 25000,
      remaining_cents: 75000,
      notes: null,
      terms: "Paiement à réception.",
      pdf_url: null,
      stripe_hosted_invoice_url: null,
      stripe_invoice_pdf_url: null,
      sent_at: "2026-07-22T09:05:00Z",
      paid_at: null,
      voided_at: null,
      cancelled_at: null,
      reminder_disabled_at: null,
      client_snapshot: clientSnapshot(),
      billing_snapshot: billingSnapshot(),
      metadata: null,
      updated_at: "2026-07-22T09:05:00Z",
    },
    lines: [invoiceLine()],
    payments: [],
    creditNotes: [],
    prospect: prospect(),
    quote: null,
  };
}

function makeCreditNoteDetails(): CreditNoteDetails {
  const invoice = makeInvoiceDetails().invoice;
  return {
    creditNote: {
      id: 3,
      number: "AV-2026-0001",
      invoice_id: invoice.id,
      prospect_id: invoice.prospect_id,
      reason: "Avoir partiel",
      status: "FINALIZED",
      issued_at: "2026-07-23T09:00:00Z",
      subtotal_cents: 20000,
      tax_cents: 0,
      total_cents: 20000,
      pdf_url: null,
      client_snapshot: clientSnapshot(),
      billing_snapshot: billingSnapshot(),
      metadata: null,
      created_at: "2026-07-23T09:00:00Z",
      updated_at: "2026-07-23T09:00:00Z",
    },
    lines: [{ ...invoiceLine(), id: 4, credit_note_id: 3 }],
    invoice,
    prospect: prospect(),
  };
}

function invoiceLine() {
  return {
    id: 1,
    invoice_id: 1,
    product_id: null,
    description: "Automatisation CRM",
    quantity_milli: 1000,
    unit: "forfait",
    unit_price_cents: 100000,
    vat_rate_basis_points: 0,
    discount_basis_points: 0,
    total_cents: 100000,
    sort_order: 0,
    created_at: "2026-07-22T09:00:00Z",
  };
}

function clientSnapshot() {
  return { company_name: "Client Test", contact_name: "Marie", email: "client@example.com", phone: null, address_line1: null, postal_code: "20620", city: "Biguglia", country: "France", region: "Corse", department: "Haute-Corse", vat_number: null, siren_or_siret: null };
}

function billingSnapshot() {
  return { legal_name: null, trade_name: "CorsaiManager", address_line1: "3175 Strada di a Marana", address_line2: null, postal_code: "20620", city: "Biguglia", country: "France", siren_or_siret: "en cours", vat_number: null, email: "contact@corsaimanager.com", phone: null, website: "https://corsaimanager.com", iban: null, bic: null, logo_url: null, vat_exemption_enabled: true, vat_exemption_note: "TVA non applicable, article 293 B du CGI", pdf_primary_color: "#22d3ee" };
}

function prospect() {
  return { id: 2, company_name: "Client Test", contact_name: "Marie", email: "client@example.com", phone: null, address_line1: "1 rue du Test", address_line2: null, postal_code: "20620", siren_or_siret: "12345678900010", vat_number: "FR00123456789", country: "France", region: "Corse", department: "Haute-Corse", city: "Biguglia", status: "client", website: null };
}
