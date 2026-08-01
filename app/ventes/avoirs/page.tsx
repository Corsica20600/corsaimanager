import { SalesBackLink, SalesEmptyState } from "@/components/billing/SalesEmptyState";

export default function CreditNotesPage() {
  return (
    <div className="grid gap-5">
      <SalesBackLink />
      <SalesEmptyState
        title="Avoirs"
        description="Les avoirs corrigeront les factures finalisées sans modification directe de l'original. Le modèle de données est prêt, l'interface arrivera en Phase 3."
      />
    </div>
  );
}
