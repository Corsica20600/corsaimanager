import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/billing/stripe-client";
import {
  markStripeEventFailed,
  markStripeEventProcessed,
  recordStripeEventReceived,
  syncCheckoutSessionCompleted,
  syncStripeInvoice,
  syncStripeSubscription,
} from "@/lib/billing/repository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature Stripe manquante." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Signature Stripe invalide." }, { status: 400 });
  }

  const received = await recordStripeEventReceived(event);
  if (!received.inserted) return NextResponse.json({ received: true, duplicate: true });

  try {
    await processStripeEvent(event);
    await markStripeEventProcessed(event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    await markStripeEventFailed(event.id, error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Erreur de synchronisation Stripe." }, { status: 500 });
  }
}

async function processStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await syncCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncStripeSubscription(event.data.object as Stripe.Subscription);
      break;
    case "invoice.created":
    case "invoice.finalized":
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
    case "invoice.paid":
    case "invoice.voided":
    case "invoice.marked_uncollectible":
      await syncStripeInvoice(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }
}
