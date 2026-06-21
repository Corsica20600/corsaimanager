import type { Metadata } from "next";
import { BusinessSeoPage } from "@/components/sections/business-seo-page";
import { getBusinessPageConfig } from "@/lib/business-pages";

const page = getBusinessPageConfig("assistant");

export const metadata: Metadata = {
  title: page.title,
  description: page.metaDescription,
  alternates: {
    canonical: "https://corsaimanager.com/assistant-ia-telephone",
  },
  openGraph: {
    title: page.title,
    description: page.metaDescription,
    url: "https://corsaimanager.com/assistant-ia-telephone",
    type: "website",
  },
};

export default function AssistantIATelephoneRoute() {
  return <BusinessSeoPage config={page} />;
}
