import type { Metadata } from "next";
import { BusinessSeoPage } from "@/components/sections/business-seo-page";
import { getBusinessPageConfig } from "@/lib/business-pages";
import {
  breadcrumbSchema,
  publicPageMetadata,
  seoImages,
  softwareApplicationSchema,
} from "@/lib/seo-metadata";

const page = getBusinessPageConfig("crmIa");

export const metadata: Metadata = publicPageMetadata({
  title: page.title,
  description: page.metaDescription,
  path: "/crm-ia-pme",
  image: seoImages.crm,
});

export default function CrmIAPmeRoute() {
  const softwareSchema = softwareApplicationSchema({
    name: "CRM IA CorsaiManager",
    description: page.metaDescription,
    path: "/crm-ia-pme",
    image: seoImages.crm.url,
  });
  const breadcrumb = breadcrumbSchema([{ name: "CRM IA PME", path: "/crm-ia-pme" }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([softwareSchema, breadcrumb]) }} />
      <BusinessSeoPage config={page} />
    </>
  );
}
