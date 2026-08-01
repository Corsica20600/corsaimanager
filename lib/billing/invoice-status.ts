import type { InvoiceStatus, PaymentStatus } from "./types";

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Brouillon",
  FINALIZED: "Finalisée",
  SENT: "Envoyée",
  PARTIALLY_PAID: "Partiellement payée",
  PAID: "Payée",
  OVERDUE: "En retard",
  VOID: "Nulle",
  REFUNDED: "Remboursée",
  CANCELLED: "Annulée",
};

const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["FINALIZED", "CANCELLED"],
  FINALIZED: ["SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"],
  SENT: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"],
  PARTIALLY_PAID: ["PAID", "OVERDUE", "REFUNDED"],
  PAID: ["REFUNDED"],
  OVERDUE: ["PARTIALLY_PAID", "PAID", "REFUNDED"],
  VOID: [],
  REFUNDED: [],
  CANCELLED: [],
};

export function canTransitionInvoiceStatus(from: InvoiceStatus, to: InvoiceStatus) {
  return from === to || (allowedTransitions[from]?.includes(to) ?? false);
}

export function assertInvoiceStatusTransition(from: InvoiceStatus, to: InvoiceStatus) {
  if (!canTransitionInvoiceStatus(from, to)) throw new Error(`Transition de facture interdite: ${from} -> ${to}.`);
}

export function isInvoiceEditable(status: InvoiceStatus) {
  return status === "DRAFT";
}

export function isInvoiceFinal(status: InvoiceStatus) {
  return status !== "DRAFT" && status !== "CANCELLED";
}

export function computeInvoiceBalance({
  total_cents,
  paid_cents,
  credited_cents = 0,
}: {
  total_cents: number;
  paid_cents: number;
  credited_cents?: number;
}) {
  assertNonNegative(total_cents, "total_cents");
  assertNonNegative(paid_cents, "paid_cents");
  assertNonNegative(credited_cents, "credited_cents");
  const remaining_cents = Math.max(0, total_cents - paid_cents - credited_cents);
  return { remaining_cents };
}

export function computeInvoiceStatus({
  currentStatus,
  total_cents,
  paid_cents,
  remaining_cents,
  due_at,
  now = new Date(),
}: {
  currentStatus: InvoiceStatus;
  total_cents: number;
  paid_cents: number;
  remaining_cents: number;
  due_at?: string | Date | null;
  now?: Date;
}): InvoiceStatus {
  if (currentStatus === "DRAFT" || currentStatus === "VOID" || currentStatus === "REFUNDED" || currentStatus === "CANCELLED") return currentStatus;
  if (paid_cents >= total_cents || remaining_cents === 0) return "PAID";
  if (isInvoiceOverdue(due_at, now)) return "OVERDUE";
  if (paid_cents > 0 && paid_cents < total_cents) return "PARTIALLY_PAID";
  return currentStatus === "SENT" ? "SENT" : "FINALIZED";
}

export function isInvoiceOverdue(dueAt?: string | Date | null, now = new Date()) {
  if (!dueAt) return false;
  const date = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
  return Number.isFinite(date.getTime()) && date.getTime() < now.getTime();
}

export function assertPaymentAllowed({
  amount_cents,
  remaining_cents,
  status,
  paymentStatus,
}: {
  amount_cents: number;
  remaining_cents: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
}) {
  if (!["FINALIZED", "SENT", "PARTIALLY_PAID", "OVERDUE"].includes(status)) throw new Error("Cette facture ne peut pas recevoir de paiement.");
  if (paymentStatus !== "SUCCEEDED") throw new Error("Seuls les paiements validés mettent à jour une facture dans cette phase.");
  if (!Number.isInteger(amount_cents) || amount_cents <= 0) throw new Error("Le montant du paiement doit être strictement positif.");
  if (amount_cents > remaining_cents) throw new Error("Le paiement dépasse le reste à payer.");
}

export function assertCreditAmountAllowed({
  credit_cents,
  invoice_total_cents,
  already_credited_cents,
}: {
  credit_cents: number;
  invoice_total_cents: number;
  already_credited_cents: number;
}) {
  if (!Number.isInteger(credit_cents) || credit_cents <= 0) throw new Error("Le montant de l'avoir doit être strictement positif.");
  if (credit_cents + already_credited_cents > invoice_total_cents) throw new Error("L'avoir dépasse le montant encore annulable.");
}

function assertNonNegative(value: number, field: string) {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${field} invalide.`);
}
