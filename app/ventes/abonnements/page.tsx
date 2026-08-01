import { SalesBackLink, SalesEmptyState } from "@/components/billing/SalesEmptyState";

export default function SubscriptionsPage() {
  return (
    <div className="grid gap-5">
      <SalesBackLink />
      <SalesEmptyState
        title="Abonnements"
        description="Stripe Billing sera la source de vérité des abonnements en Phase 4. La Phase 1 prépare les modèles et installe la dépendance Stripe sans créer d'intégration active."
      />
    </div>
  );
}
