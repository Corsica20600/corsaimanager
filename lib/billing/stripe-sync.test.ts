import { describe, expect, it, vi } from "vitest";
import { getCheckoutCancelUrl, getCheckoutSuccessUrl, getCustomerPortalReturnUrl, mapStripeInvoiceStatus, mapStripeSubscriptionStatus, stripeId } from "./stripe-sync";

describe("stripe sync helpers", () => {
  it("maps subscription statuses to internal statuses", () => {
    expect(mapStripeSubscriptionStatus("trialing")).toBe("TRIALING");
    expect(mapStripeSubscriptionStatus("active")).toBe("ACTIVE");
    expect(mapStripeSubscriptionStatus("past_due")).toBe("PAST_DUE");
    expect(mapStripeSubscriptionStatus("canceled")).toBe("CANCELLED");
    expect(mapStripeSubscriptionStatus("unpaid")).toBe("UNPAID");
  });

  it("maps invoice statuses to billing invoice statuses", () => {
    expect(mapStripeInvoiceStatus("paid")).toBe("PAID");
    expect(mapStripeInvoiceStatus("open")).toBe("SENT");
    expect(mapStripeInvoiceStatus("void")).toBe("VOID");
    expect(mapStripeInvoiceStatus("uncollectible")).toBe("OVERDUE");
  });

  it("builds checkout and portal URLs from site env", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");
    vi.stubEnv("STRIPE_CUSTOMER_PORTAL_RETURN_URL", "https://example.com/retour/");
    expect(getCheckoutSuccessUrl()).toBe("https://example.com/ventes/abonnements?checkout=success&session_id={CHECKOUT_SESSION_ID}");
    expect(getCheckoutCancelUrl()).toBe("https://example.com/ventes/abonnements?checkout=cancel");
    expect(getCustomerPortalReturnUrl()).toBe("https://example.com/retour");
    vi.unstubAllEnvs();
  });

  it("extracts Stripe ids from expanded or string references", () => {
    expect(stripeId("cus_123")).toBe("cus_123");
    expect(stripeId({ id: "sub_123" })).toBe("sub_123");
    expect(stripeId(null)).toBeNull();
  });
});
