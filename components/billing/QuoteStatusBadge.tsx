import { quoteStatusLabels } from "@/lib/billing/quote-status";
import type { QuoteStatus } from "@/lib/billing/types";

const classes: Record<QuoteStatus, string> = {
  DRAFT: "border-zinc-300/20 bg-zinc-300/10 text-zinc-200",
  SENT: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  VIEWED: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  ACCEPTED: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  REJECTED: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  EXPIRED: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  CONVERTED: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  CANCELLED: "border-zinc-500/25 bg-zinc-500/10 text-zinc-300",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classes[status]}`}>
      {quoteStatusLabels[status]}
    </span>
  );
}
