import { SalesBackLink, SalesEmptyState } from "@/components/billing/SalesEmptyState";

export default function PaymentsPage() {
  return (
    <div className="grid gap-5">
      <SalesBackLink />
      <SalesEmptyState
        title="Paiements"
        description="Les paiements manuels partiels ou totaux et les miroirs Stripe seront branchés après validation des règles de facturation."
      />
    </div>
  );
}
