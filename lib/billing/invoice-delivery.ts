import { getMailerTransport } from "@/lib/mailer";
import { archiveBillingPdf } from "./blob-storage";
import { renderInvoicePdfBuffer } from "./invoice-pdf";
import { finalizeInvoice, getInvoiceDetails, markInvoiceSent, recordInvoiceSendFailure, setInvoicePdfUrl } from "./repository";

export async function finalizeAndArchiveBillingInvoice(id: number) {
  const invoice = await finalizeInvoice(id);
  const details = await getInvoiceDetails(invoice.id);
  if (!details) throw new Error("Facture introuvable après finalisation.");
  const pdf = await renderInvoicePdfBuffer(details);
  const archived = await archiveBillingPdf({
    documentType: "invoice",
    id: invoice.id,
    number: invoice.number,
    content: pdf,
  });
  await setInvoicePdfUrl(invoice.id, archived.url);
  return invoice;
}

export async function sendBillingInvoiceEmail(id: number, subjectInput?: string | null, messageInput?: string | null) {
  try {
    const details = await getInvoiceDetails(id);
    if (!details) throw new Error("Facture introuvable.");
    if (!details.prospect.email) throw new Error("Email client manquant.");
    if (!details.invoice.number) throw new Error("Finalisez la facture avant l'envoi.");
    const subject = subjectInput ?? `Facture ${details.invoice.number} - CorsaiManager`;
    const message =
      messageInput ??
      `Bonjour,\n\nVous trouverez votre facture CorsaiManager en pièce jointe.\n\nMontant TTC : ${formatMoneyForEmail(details.invoice.total_cents, details.invoice.currency)}\nReste à payer : ${formatMoneyForEmail(details.invoice.remaining_cents, details.invoice.currency)}\n\nBien cordialement,\nCorsaiManager`;
    const pdf = await renderInvoicePdfBuffer(details);
    const archived = await archiveBillingPdf({
      documentType: "invoice",
      id: details.invoice.id,
      number: details.invoice.number,
      content: pdf,
    });
    await setInvoicePdfUrl(details.invoice.id, archived.url);
    const { transport } = getMailerTransport();
    const info = await transport.sendMail({
      from: billingEmailFrom(),
      to: details.prospect.email,
      subject,
      text: message,
      html: `<p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`,
      attachments: [{ filename: `${details.invoice.number}.pdf`, content: pdf, contentType: "application/pdf" }],
    });
    await markInvoiceSent(id, info.messageId ?? null, { to: details.prospect.email, subject });
  } catch (error) {
    await recordInvoiceSendFailure(id, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

function billingEmailFrom() {
  return process.env.BILLING_EMAIL_FROM || "CorsaiManager <contact@corsaimanager.com>";
}

function formatMoneyForEmail(amountCents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency || "EUR" }).format(amountCents / 100);
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
