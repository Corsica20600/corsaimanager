import type { Metadata } from "next";
import { AutomatisationEntreprisePage } from "@/components/sections/automatisation-entreprise-page";

export const metadata: Metadata = {
  title: "Automatisation IA pour entreprise | CorsaiManager",
  description:
    "Automatisez les tâches répétitives de votre PME avec l’IA : emails, relances, devis, documents, reporting et workflows métier.",
};

export default function AutomatisationEntrepriseRoute() {
  return <AutomatisationEntreprisePage />;
}

