import type { Metadata } from "next";
import { AssistantIATelephonePage } from "@/components/sections/assistant-ia-telephone-page";

export const metadata: Metadata = {
  title: "Assistant IA Téléphonique pour PME",
  description:
    "Découvrez l'assistant téléphonique IA CorsaiManager: qualification d'appels, réponses 24/7, synchronisation CRM et gains opérationnels concrets pour PME.",
};

export default function AssistantIATelephoneRoute() {
  return <AssistantIATelephonePage />;
}

