"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMailerTransport } from "@/lib/mailer";
import { requireBillingPermission } from "@/lib/billing/access";
import { archiveBillingPdf } from "@/lib/billing/blob-storage";
import { finalizeAndArchiveBillingInvoice, sendBillingInvoiceEmail } from "@/lib/billing/invoice-delivery";
import { buildPublicQuoteUrl } from "@/lib/billing/quote-token";
import { renderCreditNotePdfBuffer } from "@/lib/billing/invoice-pdf";
import { renderQuotePdfBuffer } from "@/lib/billing/quote-pdf";
import { getStripeClient } from "@/lib/billing/stripe-client";
import { getCheckoutCancelUrl, getCheckoutSuccessUrl, getCustomerPortalReturnUrl } from "@/lib/billing/stripe-sync";
import {
  acceptPublicQuote,
  cancelQuote,
  createManualCustomerSubscription,
  createCreditNoteDraftFromInvoice,
  createInvoiceDraft,
  createInvoiceDraftFromQuote,
  createSubscriptionInvoice,
  createQuoteDraft,
  deleteDraftQuote,
  duplicateInvoiceAsDraft,
  duplicateQuoteAsDraft,
  finalizeCreditNote,
  getBillingProductById,
  getCreditNoteDetails,
  getCustomerSubscription,
  getOrCreateStripeCustomerForProspect,
  getSubscriptionPlan,
  getQuoteDetails,
  markQuoteSent,
  prepareQuoteForSending,
  recordManualPayment,
  recordStripeCustomerForProspect,
  recordQuoteSendFailure,
  rejectPublicQuote,
  setBillingProductArchived,
  setCreditNotePdfUrl,
  setQuotePdfUrl,
  upsertBillingProduct,
  upsertBillingSettings,
  archiveSubscriptionPlan,
  upsertSubscriptionPlan,
  updateInvoiceDraft,
  updateQuoteDraft,
  voidInvoice,
} from "@/lib/billing/repository";
import type { InvoiceDraftInput, PaymentMethod, PaymentStatus, QuoteDraftInput, QuoteLineInput } from "@/lib/billing/types";

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

export async function saveSubscriptionPlanAction(formData: FormData) {
  await requireBillingPermission("billing:manage_subscriptions");
  const productId = optionalInteger(formData, "product_id");
  const product = productId ? await getBillingProductById(productId) : null;
  const name = text(formData, "name") ?? product?.name ?? "";
  const description = text(formData, "description") ?? product?.description ?? null;
  const priceCents = text(formData, "price") ? moneyCents(formData, "price") : product?.unit_price_cents ?? 0;
  const currency = text(formData, "currency") ?? "EUR";
  const frequency = formData.get("frequency") === "yearly" ? "yearly" : "monthly";
  let stripeProductId = text(formData, "stripe_product_id");
  let stripePriceId = text(formData, "stripe_price_id");
  const paymentMode = text(formData, "payment_mode") ?? "bank_transfer";
  const useStripe = paymentMode === "stripe_checkout";
  const planPaymentMethod: PaymentMethod = useStripe ? "card" : normalizePaymentMethod(paymentMode);

  if (!name.trim()) throw new Error("Le nom du plan est obligatoire.");
  if (priceCents <= 0) throw new Error("Le prix doit être supérieur à 0.");

  if (useStripe && !stripePriceId) {
    const stripe = getStripeClient();
    if (!stripeProductId) {
      const product = await stripe.products.create({
        name: name.trim(),
        description: description ?? undefined,
        metadata: { source: "corsaimanager", billing_plan_frequency: frequency },
      });
      stripeProductId = product.id;
    }
    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: priceCents,
      currency: currency.toLowerCase(),
      recurring: { interval: frequency === "yearly" ? "year" : "month" },
      metadata: { source: "corsaimanager", billing_plan_name: name.trim() },
    });
    stripePriceId = price.id;
  }

  if (!useStripe) {
    stripeProductId = null;
    stripePriceId = null;
  }

  await upsertSubscriptionPlan({
    id: optionalInteger(formData, "id") ?? undefined,
    name,
    description,
    price_cents: priceCents,
    currency,
    frequency,
    payment_method: planPaymentMethod,
    trial_days: integer(formData, "trial_days", 0),
    setup_fee_cents: moneyCents(formData, "setup_fee"),
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePriceId,
    features: splitLines(text(formData, "features")),
    vat_rate_basis_points: text(formData, "vat_rate_percent") ? basisPoints(formData, "vat_rate_percent") : product?.vat_rate_basis_points ?? 0,
    is_active: formData.get("is_active") !== "off",
  });
  revalidatePath("/ventes/abonnements");
  redirect("/ventes/abonnements?plan=created");
}

export async function archiveSubscriptionPlanAction(formData: FormData) {
  await requireBillingPermission("billing:manage_subscriptions");
  await archiveSubscriptionPlan(integer(formData, "id"), formData.get("archived") === "true");
  revalidatePath("/ventes/abonnements");
}

export async function createManualSubscriptionAction(formData: FormData) {
  await requireBillingPermission("billing:manage_subscriptions");
  await createManualCustomerSubscription({
    prospectId: integer(formData, "prospect_id"),
    planId: integer(formData, "plan_id"),
    invoiceDay: integer(formData, "invoice_day", 5),
    reminderDaysBefore: integer(formData, "reminder_days_before", 2),
    autoSendInvoices: formData.get("auto_send_invoices") === "on",
  });
  revalidatePath("/ventes/abonnements");
  redirect("/ventes/abonnements?subscription=created");
}

export async function generateSubscriptionInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:manage_subscriptions");
  const invoice = await createSubscriptionInvoice(integer(formData, "subscription_id"), { force: true, source: "user" });
  if (!invoice) throw new Error("Aucune facture à générer pour cet abonnement.");
  await finalizeAndArchiveBillingInvoice(invoice.id);
  revalidatePath("/ventes/abonnements");
  redirect(`/ventes/factures/${invoice.id}`);
}

export async function generateAndSendSubscriptionInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:manage_subscriptions");
  const invoice = await createSubscriptionInvoice(integer(formData, "subscription_id"), { force: true, source: "user" });
  if (!invoice) throw new Error("Aucune facture à générer pour cet abonnement.");
  const finalized = await finalizeAndArchiveBillingInvoice(invoice.id);
  await sendBillingInvoiceEmail(finalized.id);
  revalidatePath("/ventes/abonnements");
  redirect(`/ventes/factures/${finalized.id}`);
}

export async function createSubscriptionCheckoutAction(formData: FormData) {
  await requireBillingPermission("billing:manage_subscriptions");
  const prospectId = integer(formData, "prospect_id");
  const plan = await getSubscriptionPlan(integer(formData, "plan_id"));
  if (!plan || !plan.is_active || plan.archived_at) throw new Error("Plan d'abonnement indisponible.");
  if (!plan.stripe_price_id) throw new Error("Le plan doit avoir un stripe_price_id.");

  const stripe = getStripeClient();
  const { prospect, stripeCustomerId } = await getOrCreateStripeCustomerForProspect(prospectId);
  let customerId = stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: prospect.email ?? undefined,
      name: prospect.company_name,
      metadata: { prospect_id: String(prospect.id) },
    });
    customerId = customer.id;
    await recordStripeCustomerForProspect(prospect.id, customer.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: getCheckoutSuccessUrl(),
    cancel_url: getCheckoutCancelUrl(),
    metadata: {
      prospect_id: String(prospect.id),
      plan_id: String(plan.id),
      stripe_price_id: plan.stripe_price_id,
    },
    subscription_data: {
      metadata: {
        prospect_id: String(prospect.id),
        plan_id: String(plan.id),
        stripe_price_id: plan.stripe_price_id,
      },
      trial_period_days: plan.trial_days > 0 ? plan.trial_days : undefined,
    },
  });
  if (!session.url) throw new Error("Stripe Checkout n'a pas retourné d'URL.");
  redirect(session.url);
}

export async function openCustomerPortalAction(formData: FormData) {
  await requireBillingPermission("billing:manage_subscriptions");
  const subscription = await getCustomerSubscription(integer(formData, "subscription_id"));
  if (!subscription?.stripe_customer_id) throw new Error("Abonnement sans client Stripe.");
  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: getCustomerPortalReturnUrl(),
  });
  redirect(session.url);
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
    const archived = await archiveBillingPdf({
      documentType: "quote",
      id: details.quote.id,
      number: details.quote.number,
      content: pdf,
    });
    await setQuotePdfUrl(details.quote.id, archived.url);
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

export async function createInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:create_draft");
  const invoice = await createInvoiceDraft(parseInvoiceForm(formData));
  revalidatePath("/ventes/factures");
  redirect(`/ventes/factures/${invoice.id}`);
}

export async function createInvoiceFromQuoteAction(formData: FormData) {
  await requireBillingPermission("billing:create_draft");
  const invoice = await createInvoiceDraftFromQuote(integer(formData, "quote_id"));
  revalidatePath("/ventes/factures");
  redirect(`/ventes/factures/${invoice.id}`);
}

export async function updateInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:update_draft");
  const id = integer(formData, "id");
  await updateInvoiceDraft(id, parseInvoiceForm(formData));
  revalidatePath(`/ventes/factures/${id}`);
  redirect(`/ventes/factures/${id}`);
}

export async function finalizeInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:finalize_invoice");
  const invoice = await finalizeAndArchiveBillingInvoice(integer(formData, "id"));
  revalidatePath(`/ventes/factures/${invoice.id}`);
  redirect(`/ventes/factures/${invoice.id}`);
}

export async function duplicateInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:create_draft");
  const invoice = await duplicateInvoiceAsDraft(integer(formData, "id"));
  revalidatePath("/ventes/factures");
  redirect(`/ventes/factures/${invoice.id}/modifier`);
}

export async function voidInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:update_draft");
  const invoice = await voidInvoice(integer(formData, "id"));
  revalidatePath(`/ventes/factures/${invoice.id}`);
  redirect(`/ventes/factures/${invoice.id}`);
}

export async function sendInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:send_document");
  const id = integer(formData, "id");
  const subject = text(formData, "subject") ?? "Votre facture CorsaiManager";
  const message = text(formData, "message") ?? "Bonjour, vous trouverez votre facture en pièce jointe.";

  await sendBillingInvoiceEmail(id, subject, message);
  revalidatePath(`/ventes/factures/${id}`);
  redirect(`/ventes/factures/${id}`);
}

export async function recordPaymentAction(formData: FormData) {
  await requireBillingPermission("billing:record_payment");
  const invoiceId = integer(formData, "invoice_id");
  await recordManualPayment({
    invoice_id: invoiceId,
    amount_cents: moneyCents(formData, "amount"),
    paid_at: text(formData, "paid_at"),
    method: normalizePaymentMethod(text(formData, "method")),
    reference: text(formData, "reference"),
    comment: text(formData, "comment"),
    status: normalizePaymentStatus(text(formData, "status")),
  });
  revalidatePath(`/ventes/factures/${invoiceId}`);
  redirect(`/ventes/factures/${invoiceId}`);
}

export async function createCreditNoteFromInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:create_credit_note");
  const note = await createCreditNoteDraftFromInvoice(integer(formData, "invoice_id"), text(formData, "reason") ?? "Correction de facture");
  revalidatePath("/ventes/avoirs");
  redirect(`/ventes/avoirs/${note.id}`);
}

export async function finalizeCreditNoteAction(formData: FormData) {
  await requireBillingPermission("billing:create_credit_note");
  const note = await finalizeCreditNote(integer(formData, "id"));
  const details = await getCreditNoteDetails(note.id);
  if (!details) throw new Error("Avoir introuvable après émission.");
  const pdf = await renderCreditNotePdfBuffer(details);
  const archived = await archiveBillingPdf({
    documentType: "credit-note",
    id: note.id,
    number: note.number,
    content: pdf,
  });
  await setCreditNotePdfUrl(note.id, archived.url);
  revalidatePath(`/ventes/avoirs/${note.id}`);
  redirect(`/ventes/avoirs/${note.id}`);
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

function parseInvoiceForm(formData: FormData): InvoiceDraftInput {
  const draft = parseQuoteForm(formData);
  const origin = formData.get("origin") === "QUOTE" ? "QUOTE" : "MANUAL";
  return {
    prospect_id: draft.prospect_id,
    quote_id: optionalInteger(formData, "quote_id"),
    origin,
    due_at: text(formData, "due_at") ?? text(formData, "expires_at"),
    currency: draft.currency,
    notes: draft.notes,
    terms: draft.terms,
    lines: draft.lines,
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

function normalizePaymentMethod(value: string | null): PaymentMethod {
  const methods: PaymentMethod[] = ["card", "bank_transfer", "direct_debit", "cash", "check", "stripe", "other"];
  return methods.includes(value as PaymentMethod) ? (value as PaymentMethod) : "other";
}

function normalizePaymentStatus(value: string | null): PaymentStatus {
  const statuses: PaymentStatus[] = ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"];
  return statuses.includes(value as PaymentStatus) ? (value as PaymentStatus) : "SUCCEEDED";
}

function splitLines(value: string | null) {
  return value?.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 20) ?? [];
}
