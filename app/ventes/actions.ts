"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMailerTransport } from "@/lib/mailer";
import { requireBillingPermission } from "@/lib/billing/access";
import { buildPublicQuoteUrl } from "@/lib/billing/quote-token";
import { renderQuotePdfBuffer } from "@/lib/billing/quote-pdf";
import {
  acceptPublicQuote,
  cancelQuote,
  createQuoteDraft,
  deleteDraftQuote,
  duplicateQuoteAsDraft,
  getQuoteDetails,
  markQuoteSent,
  prepareQuoteForSending,
  recordQuoteSendFailure,
  rejectPublicQuote,
  setBillingProductArchived,
  upsertBillingProduct,
  upsertBillingSettings,
  updateQuoteDraft,
} from "@/lib/billing/repository";
import type { QuoteDraftInput, QuoteLineInput } from "@/lib/billing/types";

export async function saveBillingSettingsAction(formData: FormData) {
  await requireBillingPermission("billing:manage_settings");
  await upsertBillingSettings({
    legal_name: text(formData, "legal_name"),
    trade_name: text(formData, "trade_name") ?? "CorsaiManager",
    address_line1: text(formData, "address_line1"),
    address_line2: text(formData, "address_line2"),
    postal_code: text(formData, "postal_code"),
    city: text(formData, "city"),
    country: text(formData, "country") ?? "France",
    siren_or_siret: text(formData, "siren_or_siret"),
    vat_number: text(formData, "vat_number"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    website: text(formData, "website"),
    iban: text(formData, "iban"),
    bic: text(formData, "bic"),
    default_currency: text(formData, "default_currency") ?? "EUR",
    default_vat_rate_basis_points: basisPoints(formData, "default_vat_rate_percent"),
    default_payment_terms_days: integer(formData, "default_payment_terms_days", 30),
    quote_prefix: text(formData, "quote_prefix") ?? "DEV",
    vat_exemption_enabled: formData.get("vat_exemption_enabled") === "on",
    vat_exemption_note: text(formData, "vat_exemption_note") ?? "TVA non applicable, article 293 B du CGI",
    default_terms: text(formData, "default_terms"),
    default_notes: text(formData, "default_notes"),
    pdf_primary_color: text(formData, "pdf_primary_color") ?? "#22d3ee",
  });
  revalidatePath("/ventes/parametres");
}

export async function saveBillingProductAction(formData: FormData) {
  await requireBillingPermission("billing:manage_settings");
  await upsertBillingProduct({
    id: optionalInteger(formData, "id") ?? undefined,
    name: text(formData, "name") ?? "",
    description: text(formData, "description"),
    internal_reference: text(formData, "internal_reference"),
    type: formData.get("type") === "product" ? "product" : "service",
    unit: text(formData, "unit") ?? "unité",
    unit_price_cents: moneyCents(formData, "unit_price"),
    vat_rate_basis_points: basisPoints(formData, "vat_rate_percent"),
    is_active: formData.get("is_active") !== "off",
  });
  revalidatePath("/ventes/catalogue");
}

export async function archiveBillingProductAction(formData: FormData) {
  await requireBillingPermission("billing:manage_settings");
  await setBillingProductArchived(integer(formData, "id"), formData.get("archived") === "true");
  revalidatePath("/ventes/catalogue");
}

export async function createQuoteAction(formData: FormData) {
  await requireBillingPermission("billing:create_draft");
  const quote = await createQuoteDraft(parseQuoteForm(formData));
  revalidatePath("/ventes/devis");
  redirect(`/ventes/devis/${quote.id}`);
}

export async function updateQuoteAction(formData: FormData) {
  await requireBillingPermission("billing:update_draft");
  const id = integer(formData, "id");
  await updateQuoteDraft(id, parseQuoteForm(formData));
  revalidatePath(`/ventes/devis/${id}`);
  redirect(`/ventes/devis/${id}`);
}

export async function deleteQuoteDraftAction(formData: FormData) {
  await requireBillingPermission("billing:update_draft");
  await deleteDraftQuote(integer(formData, "id"));
  revalidatePath("/ventes/devis");
  redirect("/ventes/devis");
}

export async function duplicateQuoteAction(formData: FormData) {
  await requireBillingPermission("billing:create_draft");
  const quote = await duplicateQuoteAsDraft(integer(formData, "id"));
  revalidatePath("/ventes/devis");
  redirect(`/ventes/devis/${quote.id}/modifier`);
}

export async function cancelQuoteAction(formData: FormData) {
  await requireBillingPermission("billing:update_draft");
  await cancelQuote(integer(formData, "id"));
  revalidatePath("/ventes/devis");
  redirect("/ventes/devis");
}

export async function sendQuoteAction(formData: FormData) {
  await requireBillingPermission("billing:send_document");
  const id = integer(formData, "id");
  const subject = text(formData, "subject") ?? "Votre devis CorsaiManager";
  const message = text(formData, "message") ?? "Bonjour, vous trouverez votre devis en pièce jointe.";
  let publicUrl = "";

  try {
    const prepared = await prepareQuoteForSending(id);
    publicUrl = buildPublicQuoteUrl(prepared.token);
    const details = await getQuoteDetails(id);
    if (!details) throw new Error("Devis introuvable après préparation.");
    if (!details.prospect.email) throw new Error("Email prospect manquant.");

    const pdf = await renderQuotePdfBuffer(details);
    const { transport } = getMailerTransport();
    const info = await transport.sendMail({
      from: "CorsaiManager <contact@corsaimanager.com>",
      to: details.prospect.email,
      subject,
      text: `${message}\n\nLien sécurisé du devis : ${publicUrl}`,
      html: `<p>${escapeHtml(message).replace(/\n/g, "<br />")}</p><p><a href="${publicUrl}">Consulter et valider le devis</a></p>`,
      attachments: [
        {
          filename: `${details.quote.number ?? `devis-${details.quote.id}`}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });
    await markQuoteSent(id, info.messageId ?? null, { to: details.prospect.email, subject });
  } catch (error) {
    await recordQuoteSendFailure(id, error instanceof Error ? error.message : String(error));
    throw error;
  }

  revalidatePath(`/ventes/devis/${id}`);
  redirect(`/ventes/devis/${id}`);
}

export async function acceptQuoteAction(formData: FormData) {
  const token = text(formData, "token");
  if (!token) throw new Error("Jeton manquant.");
  const details = await getQuoteDetailsFromToken(token);
  await acceptPublicQuote(details.quote.id, {
    name: text(formData, "name") ?? "",
    comment: text(formData, "comment"),
    ...(await requestAuditInfo()),
  });
  revalidatePath(`/devis/${token}`);
  redirect(`/devis/${token}?merci=1`);
}

export async function rejectQuoteAction(formData: FormData) {
  const token = text(formData, "token");
  if (!token) throw new Error("Jeton manquant.");
  const details = await getQuoteDetailsFromToken(token);
  await rejectPublicQuote(details.quote.id, {
    name: text(formData, "name") ?? "",
    comment: text(formData, "comment"),
    ...(await requestAuditInfo()),
  });
  revalidatePath(`/devis/${token}`);
  redirect(`/devis/${token}?refuse=1`);
}

function parseQuoteForm(formData: FormData): QuoteDraftInput {
  const lineCount = integer(formData, "line_count", 1);
  const lines: QuoteLineInput[] = [];

  for (let index = 0; index < lineCount; index += 1) {
    const description = text(formData, `line_${index}_description`);
    if (!description) continue;
    lines.push({
      product_id: optionalInteger(formData, `line_${index}_product_id`),
      description,
      quantity_milli: quantityMilli(formData, `line_${index}_quantity`),
      unit: text(formData, `line_${index}_unit`) ?? "unité",
      unit_price_cents: moneyCents(formData, `line_${index}_unit_price`),
      vat_rate_basis_points: basisPoints(formData, `line_${index}_vat_rate_percent`),
      discount_basis_points: basisPoints(formData, `line_${index}_discount_percent`),
      sort_order: index,
    });
  }

  return {
    prospect_id: integer(formData, "prospect_id"),
    currency: text(formData, "currency") ?? "EUR",
    expires_at: text(formData, "expires_at"),
    notes: text(formData, "notes"),
    terms: text(formData, "terms"),
    lines,
  };
}

async function getQuoteDetailsFromToken(token: string) {
  const { getQuoteByPublicToken } = await import("@/lib/billing/repository");
  const details = await getQuoteByPublicToken(token);
  if (!details) throw new Error("Devis introuvable.");
  return details;
}

async function requestAuditInfo() {
  const requestHeaders = await headers();
  return {
    ip: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: requestHeaders.get("user-agent"),
  };
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function integer(formData: FormData, key: string, fallback?: number) {
  const value = text(formData, key);
  if (!value && fallback !== undefined) return fallback;
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isInteger(parsed)) throw new Error(`Valeur invalide pour ${key}.`);
  return parsed;
}

function optionalInteger(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function moneyCents(formData: FormData, key: string) {
  const value = text(formData, key) ?? "0";
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const [euros, cents = ""] = normalized.split(".");
  const parsedEuros = Number.parseInt(euros || "0", 10);
  const normalizedCents = (cents + "00").slice(0, 2);
  const parsedCents = Number.parseInt(normalizedCents, 10);
  if (!Number.isInteger(parsedEuros) || !Number.isInteger(parsedCents)) throw new Error(`Montant invalide pour ${key}.`);
  return parsedEuros * 100 + parsedCents;
}

function quantityMilli(formData: FormData, key: string) {
  const value = text(formData, key) ?? "1";
  const parsed = Number.parseFloat(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`Quantité invalide pour ${key}.`);
  return Math.round(parsed * 1000);
}

function basisPoints(formData: FormData, key: string) {
  const value = text(formData, key) ?? "0";
  const parsed = Number.parseFloat(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) throw new Error(`Pourcentage invalide pour ${key}.`);
  return Math.round(parsed * 100);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char] ?? char;
  });
}
