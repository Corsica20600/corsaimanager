import type { PurchaseCategory, PurchaseInvoiceStatus } from "@/lib/billing/types";

export const purchaseStatusLabels: Record<PurchaseInvoiceStatus, string> = {
  DETECTED: "Détectée",
  NEEDS_REVIEW: "À valider",
  VALIDATED: "Validée",
  REJECTED: "Rejetée",
  PAID: "Payée",
};

export const purchaseCategoryLabels: Record<PurchaseCategory, string> = {
  hosting: "Hébergement",
  domain_name: "Nom de domaine",
  advertising: "Publicité",
  publication_fees: "Frais de publication",
  software: "Logiciel",
  bank_fees: "Frais bancaires",
  subcontracting: "Sous-traitance",
  other: "Autre",
};

export function PurchaseStatusBadge({ status }: { status: PurchaseInvoiceStatus }) {
  const classes: Record<PurchaseInvoiceStatus, string> = {
    DETECTED: "border-blue-300/30 bg-blue-300/10 text-blue-100",
    NEEDS_REVIEW: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    VALIDATED: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    REJECTED: "border-rose-300/30 bg-rose-300/10 text-rose-100",
    PAID: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  };
  return <span className={`rounded-full border px-3 py-1 text-xs ${classes[status]}`}>{purchaseStatusLabels[status]}</span>;
}
