import type { Metadata } from "next";
import { BusinessSeoPage } from "@/components/sections/business-seo-page";
import { AuditRequestForm } from "@/components/sections/audit-request-form";
import { getBusinessPageConfig } from "@/lib/business-pages";

const page = getBusinessPageConfig("auditIa");

export const metadata: Metadata = {
  title: page.title,
  description: page.metaDescription,
  alternates: {
    canonical: "https://corsaimanager.com/audit-ia",
  },
  openGraph: {
    title: page.title,
    description: page.metaDescription,
    url: "https://corsaimanager.com/audit-ia",
    type: "website",
  },
};

export default function AuditPage() {
  return (
    <BusinessSeoPage config={page}>
      <AuditRequestForm />
    </BusinessSeoPage>
  );
}
