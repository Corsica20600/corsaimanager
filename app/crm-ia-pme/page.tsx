import type { Metadata } from "next";
import { BusinessSeoPage } from "@/components/sections/business-seo-page";
import { getBusinessPageConfig } from "@/lib/business-pages";

const page = getBusinessPageConfig("crmIa");

export const metadata: Metadata = {
  title: page.title,
  description: page.metaDescription,
  alternates: {
    canonical: "https://corsaimanager.com/crm-ia-pme",
  },
  openGraph: {
    title: page.title,
    description: page.metaDescription,
    url: "https://corsaimanager.com/crm-ia-pme",
    type: "website",
  },
};

export default function CrmIAPmeRoute() {
  return <BusinessSeoPage config={page} />;
}
