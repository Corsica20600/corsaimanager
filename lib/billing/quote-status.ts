import type { QuoteStatus } from "./types";

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  VIEWED: "Consulté",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
  CONVERTED: "Converti",
  CANCELLED: "Annulé",
};

const allowedTransitions: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ["SENT", "ACCEPTED", "CANCELLED"],
  SENT: ["VIEWED", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"],
  VIEWED: ["ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
  CONVERTED: [],
  CANCELLED: [],
};

export function canTransitionQuoteStatus(from: QuoteStatus, to: QuoteStatus) {
  return allowedTransitions[from]?.includes(to) ?? false;
}

export function assertQuoteStatusTransition(from: QuoteStatus, to: QuoteStatus) {
  if (!canTransitionQuoteStatus(from, to)) {
    throw new Error(`Transition de devis interdite: ${from} → ${to}.`);
  }
}

export function isQuoteEditable(status: QuoteStatus) {
  return status === "DRAFT";
}

export function isQuotePubliclyActionable(status: QuoteStatus) {
  return status === "SENT" || status === "VIEWED";
}

export function isQuoteExpired(expiresAt?: string | Date | null, now = new Date()) {
  if (!expiresAt) return false;
  const date = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return Number.isFinite(date.getTime()) && date.getTime() < now.getTime();
}
