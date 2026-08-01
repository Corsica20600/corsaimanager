import { invoiceStatusLabels } from "@/lib/billing/invoice-status";
import type { InvoiceStatus } from "@/lib/billing/types";

const classes: Record<InvoiceStatus, string> = {
  DRAFT: "border-zinc-300/20 bg-zinc-300/10 text-zinc-200",
  FINALIZED: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  SENT: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  PARTIALLY_PAID: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  PAID: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  OVERDUE: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  VOID: "border-zinc-500/25 bg-zinc-500/10 text-zinc-300",
  REFUNDED: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  CANCELLED: "border-zinc-500/25 bg-zinc-500/10 text-zinc-300",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classes[status]}`}>{invoiceStatusLabels[status]}</span>;
}
