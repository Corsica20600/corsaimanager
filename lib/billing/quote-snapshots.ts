import type { BillingSettingsRow, BillingSnapshot, ClientSnapshot, QuoteDetails } from "./types";

type ProspectSnapshotSource = QuoteDetails["prospect"];

export function buildClientSnapshot(prospect: ProspectSnapshotSource): ClientSnapshot {
  return {
    company_name: prospect.company_name,
    contact_name: prospect.contact_name,
    email: prospect.email,
    phone: prospect.phone,
    address_line1: prospect.address_line1,
    postal_code: prospect.postal_code,
    city: prospect.city,
    country: prospect.country ?? "France",
    region: prospect.region,
    department: prospect.department,
    vat_number: prospect.vat_number,
    siren_or_siret: prospect.siren_or_siret,
  };
}

export function buildBillingSnapshot(settings: BillingSettingsRow | null): BillingSnapshot {
  return {
    legal_name: settings?.legal_name ?? null,
    trade_name: settings?.trade_name ?? "CorsaiManager",
    address_line1: settings?.address_line1 ?? "3175 Strada di a Marana",
    address_line2: settings?.address_line2 ?? null,
    postal_code: settings?.postal_code ?? "20620",
    city: settings?.city ?? "Biguglia",
    country: settings?.country ?? "France",
    siren_or_siret: settings?.siren_or_siret ?? "SIRET en cours d'attribution",
    vat_number: settings?.vat_number ?? null,
    email: settings?.email ?? "contact@corsaimanager.com",
    phone: settings?.phone ?? "+33 6 65 01 87 30",
    website: settings?.website ?? "https://corsaimanager.com",
    iban: settings?.iban ?? null,
    bic: settings?.bic ?? null,
    logo_url: settings?.logo_url ?? "/images/logo.png",
    vat_exemption_enabled: settings?.vat_exemption_enabled ?? true,
    vat_exemption_note: settings?.vat_exemption_note ?? "TVA non applicable, article 293 B du CGI",
    pdf_primary_color: settings?.pdf_primary_color ?? "#22d3ee",
  };
}

export function getQuoteClientSnapshot(details: QuoteDetails): ClientSnapshot {
  return details.quote.client_snapshot ?? buildClientSnapshot(details.prospect);
}

export function validateProspectForQuote(prospect: ProspectSnapshotSource) {
  const missing: string[] = [];
  if (!prospect.company_name?.trim()) missing.push("raison sociale");
  if (!prospect.email?.trim()) missing.push("email");
  if (!prospect.city?.trim()) missing.push("ville");
  if (!prospect.country?.trim()) missing.push("pays");
  return missing;
}
