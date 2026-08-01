import { formatCurrencyFromCents } from "./calculations";

export function formatBillingMoney(amountCents: number, currency = "EUR") {
  return formatCurrencyFromCents(amountCents, currency);
}

export function formatBillingDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

export function formatBillingDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
