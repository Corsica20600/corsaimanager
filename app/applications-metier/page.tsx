import type { Metadata } from "next";
import { ApplicationsMetierPage } from "@/components/sections/applications-metier-page";

export const metadata: Metadata = {
  title: "Applications métier sur mesure | CorsaiManager",
  description:
    "Développement d’applications métier modernes pour PME : CRM, automatisation, dashboards, gestion formation, réservation et outils professionnels sur mesure.",
};

export default function ApplicationsMetierRoute() {
  return <ApplicationsMetierPage />;
}

