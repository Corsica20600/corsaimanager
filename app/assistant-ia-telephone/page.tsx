import type { Metadata } from "next";
import { AssistantIATelephonePage } from "@/components/sections/assistant-ia-telephone-page";

export const metadata: Metadata = {
  title: "Assistant IA Téléphonique | CorsaiManager",
  description:
    "Assistant téléphonique IA pour PME : réponse automatique, qualification des appels, résumés intelligents et synchronisation CRM.",
};

export default function AssistantIATelephoneRoute() {
  return <AssistantIATelephonePage />;
}
