import Link from "next/link";
import { ProspectForm } from "@/components/crm/ProspectForm";

export default function NewProspectPage() {
  return (
    <div className="grid gap-5">
      <div>
        <Link href="/crm" className="text-sm text-cyan-200 hover:text-cyan-100">Retour aux prospects</Link>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-100">Ajouter un prospect</h2>
        <p className="mt-2 text-sm text-zinc-400">Créez une fiche commerciale manuellement. Les relances seront préparées selon le statut.</p>
      </div>
      <ProspectForm />
    </div>
  );
}

