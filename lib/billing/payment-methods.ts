import type { PaymentMethod } from "./types";

export const visiblePaymentMethods: PaymentMethod[] = ["bank_transfer", "direct_debit", "check", "cash", "card"];

export function formatPaymentMethod(method: PaymentMethod) {
  switch (method) {
    case "bank_transfer":
      return "Virement";
    case "direct_debit":
      return "Prélèvement";
    case "check":
      return "Chèque";
    case "cash":
      return "Espèces";
    case "card":
    case "stripe":
      return "Carte (Stripe)";
    default:
      return "Autre";
  }
}
