import { describe, expect, it } from "vitest";
import { renderQuotePdfBuffer } from "./quote-pdf";
import type { QuoteDetails } from "./types";

describe("quote PDF", () => {
  it("renders a valid PDF buffer", async () => {
    const buffer = await renderQuotePdfBuffer(makeQuoteDetails());
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(1000);
  });
});

function makeQuoteDetails(): QuoteDetails {
  return {
    quote: {
      id: 1,
      prospect_id: 7,
      number: "DEV-2026-0001",
      public_token_hash: null,
      public_token_revoked_at: null,
      created_at: "2026-07-22T09:00:00.000Z",
      issued_at: "2026-07-22T09:05:00.000Z",
      expires_at: "2026-08-21T21:59:00.000Z",
      status: "SENT",
      currency: "EUR",
      subtotal_cents: 100000,
      tax_cents: 0,
      total_cents: 100000,
      discount_cents: 0,
      deposit_cents: 0,
      notes: "Merci pour votre confiance.",
      terms: "Validité 30 jours.",
      pdf_url: null,
      sent_at: "2026-07-22T09:06:00.000Z",
      accepted_at: null,
      rejected_at: null,
      accepted_by_name: null,
      acceptance_ip: null,
      acceptance_user_agent: null,
      acceptance_comment: null,
      converted_invoice_id: null,
      client_snapshot: {
        company_name: "Client Test",
        contact_name: "Véronique Martin",
        email: "client@example.com",
        phone: null,
        address_line1: null,
        postal_code: null,
        city: "Biguglia",
        country: "France",
        region: "Corse",
        department: "Haute-Corse",
        vat_number: null,
        siren_or_siret: null,
      },
      billing_snapshot: {
        legal_name: null,
        trade_name: "CorsaiManager",
        address_line1: "3175 Strada di a Marana",
        address_line2: null,
        postal_code: "20620",
        city: "Biguglia",
        country: "France",
        siren_or_siret: "en cours",
        vat_number: null,
        email: "contact@corsaimanager.com",
        phone: null,
        website: "https://www.corsaimanager.com",
        iban: null,
        bic: null,
        logo_url: null,
        vat_exemption_enabled: true,
        vat_exemption_note: "TVA non applicable, article 293 B du CGI",
        pdf_primary_color: "#22d3ee",
      },
      metadata: null,
      updated_at: "2026-07-22T09:06:00.000Z",
    },
    lines: [
      {
        id: 10,
        quote_id: 1,
        product_id: null,
        description: "Audit IA et automatisation",
        quantity_milli: 1000,
        unit: "forfait",
        unit_price_cents: 100000,
        vat_rate_basis_points: 0,
        discount_basis_points: 0,
        total_cents: 100000,
        sort_order: 0,
        created_at: "2026-07-22T09:00:00.000Z",
      },
    ],
    prospect: {
      id: 7,
      company_name: "Client Test",
      contact_name: "Véronique Martin",
      email: "client@example.com",
      phone: null,
      address_line1: "1 rue du Test",
      address_line2: null,
      postal_code: "20620",
      siren_or_siret: "12345678900010",
      vat_number: "FR00123456789",
      country: "France",
      region: "Corse",
      department: "Haute-Corse",
      city: "Biguglia",
      status: "prospect",
      website: null,
    },
  };
}
