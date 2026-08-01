import type Stripe from "stripe";
import type { InvoiceStatus, SubscriptionStatus } from "./types";

export function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const map: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    incomplete: "INCOMPLETE",
    incomplete_expired: "EXPIRED",
    trialing: "TRIALING",
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELLED",
    unpaid: "UNPAID",
    paused: "PAUSED",
  };
  return map[status] ?? "INCOMPLETE";
}

export function mapStripeInvoiceStatus(status: Stripe.Invoice.Status | null): InvoiceStatus {
  if (status === "paid") return "PAID";
  if (status === "void") return "VOID";
  if (status === "uncollectible") return "OVERDUE";
  if (status === "open") return "SENT";
  if (status === "draft") return "DRAFT";
  return "FINALIZED";
}

export function toIsoFromStripeTimestamp(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

export function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://corsaimanager.com").replace(/\/$/, "");
}

export function getCheckoutSuccessUrl() {
  return `${getSiteUrl()}/ventes/abonnements?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
}

export function getCheckoutCancelUrl() {
  return `${getSiteUrl()}/ventes/abonnements?checkout=cancel`;
}

export function getCustomerPortalReturnUrl() {
  return (process.env.STRIPE_CUSTOMER_PORTAL_RETURN_URL || `${getSiteUrl()}/ventes/abonnements`).replace(/\/$/, "");
}
