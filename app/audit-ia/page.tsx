import type { Metadata } from "next";
import { BusinessSeoPage } from "@/components/sections/business-seo-page";
import { AuditRequestForm } from "@/components/sections/audit-request-form";
import { getBusinessPageConfig } from "@/lib/business-pages";
import { breadcrumbSchema, publicPageMetadata, seoImages } from "@/lib/seo-metadata";

const page = getBusinessPageConfig("auditIa");

export const metadata: Metadata = publicPageMetadata({
  title: "Audit IA PME : feuille de route et ROI",
  description: page.metaDescription,
  path: "/audit-ia",
  image: seoImages.aiTeam,
});

export default function AuditPage() {
  const breadcrumb = breadcrumbSchema([{ name: "Audit IA", path: "/audit-ia" }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <BusinessSeoPage config={page}>
        <AuditRequestForm />
      </BusinessSeoPage>
    </>
  );
}
