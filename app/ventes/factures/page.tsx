import { SalesBackLink, SalesEmptyState } from "@/components/billing/SalesEmptyState";

export default function InvoicesPage() {
  return (
    <div className="grid gap-5">
      <SalesBackLink />
      <SalesEmptyState
        title="Factures"
        description="Les factures ponctuelles, la finalisation, les paiements, les avoirs et les relances seront développés après validation des fondations."
      />
    </div>
  );
}
