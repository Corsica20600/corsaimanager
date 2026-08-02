import { NextResponse } from "next/server";
import { getMailerTransport } from "@/lib/mailer";
import { finalizeAndArchiveBillingInvoice, sendBillingInvoiceEmail } from "@/lib/billing/invoice-delivery";
import {
  createSubscriptionInvoice,
  listSubscriptionsDueForInvoice,
  listSubscriptionsDueForReminder,
  markSubscriptionReminderSent,
} from "@/lib/billing/repository";
import { formatBillingDate, formatBillingMoney } from "@/lib/billing/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = validateCronRequest(request);
  if (authError) return authError;

  const result = {
    ok: true,
    invoicesCreated: 0,
    invoicesSent: 0,
    remindersSent: 0,
    errors: [] as string[],
  };

  try {
    const dueSubscriptions = await listSubscriptionsDueForInvoice();
    for (const subscription of dueSubscriptions) {
      try {
        const invoice = await createSubscriptionInvoice(subscription.id, { source: "cron" });
        if (!invoice) continue;
        const finalized = await finalizeAndArchiveBillingInvoice(invoice.id);
        result.invoicesCreated += 1;
        if (subscription.auto_send_invoices) {
          await sendBillingInvoiceEmail(finalized.id);
          result.invoicesSent += 1;
        }
      } catch (error) {
        result.ok = false;
        result.errors.push(`subscription:${subscription.id}:${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const reminders = await listSubscriptionsDueForReminder();
    for (const subscription of reminders) {
      try {
        await sendSubscriptionReminder(subscription);
        await markSubscriptionReminderSent(subscription.id);
        result.remindersSent += 1;
      } catch (error) {
        result.ok = false;
        result.errors.push(`reminder:${subscription.id}:${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 207 });
  } catch (error) {
    console.error("[cron] subscription-invoices failed", error);
    return NextResponse.json({ ok: false, error: "subscription_invoice_cron_failed" }, { status: 500 });
  }
}

async function sendSubscriptionReminder(subscription: Awaited<ReturnType<typeof listSubscriptionsDueForReminder>>[number]) {
  const { transport } = getMailerTransport();
  const amount = formatBillingMoney(subscription.price_cents, subscription.currency);
  const nextInvoiceAt = formatBillingDate(subscription.next_invoice_at);
  const subject = `Rappel abonnement ${subscription.plan_name} - CorsaiManager`;
  const message = `Bonjour,\n\nPetit rappel : la prochaine facture de votre abonnement ${subscription.plan_name} sera générée le ${nextInvoiceAt}.\n\nMontant prévu : ${amount}.\n\nBien cordialement,\nCorsaiManager`;
  await transport.sendMail({
    from: process.env.BILLING_EMAIL_FROM || "CorsaiManager <contact@corsaimanager.com>",
    to: subscription.email,
    subject,
    text: message,
    html: `<p>Bonjour,</p><p>Petit rappel : la prochaine facture de votre abonnement <strong>${escapeHtml(subscription.plan_name)}</strong> sera générée le ${escapeHtml(nextInvoiceAt)}.</p><p>Montant prévu : ${escapeHtml(amount)}.</p><p>Bien cordialement,<br />CorsaiManager</p>`,
  });
}

function validateCronRequest(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET manquant côté serveur." }, { status: 500 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
  const headerSecret = request.headers.get("x-cron-secret") ?? "";

  if (constantTimeEqual(bearer, expectedSecret) || constantTimeEqual(headerSecret.trim(), expectedSecret)) {
    return null;
  }

  return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
}

function constantTimeEqual(value: string, expected: string) {
  if (!value || value.length !== expected.length) return false;
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result |= value.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return result === 0;
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
