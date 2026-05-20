import type { Metadata } from "next";
import { CrmIAPmePage } from "@/components/sections/crm-ia-pme-page";

export const metadata: Metadata = {
  title: "CRM IA pour PME | CorsaiManager",
  description:
    "CRM intelligent pour PME avec relances automatiques, pipeline commercial, scoring IA et automatisation du suivi client.",
};

export default function CrmIAPmeRoute() {
  return <CrmIAPmePage />;
}

