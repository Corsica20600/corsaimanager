import type { Metadata } from "next";
import { BusinessSeoPage } from "@/components/sections/business-seo-page";
import { getBusinessPageConfig } from "@/lib/business-pages";
import { breadcrumbSchema, publicPageMetadata, seoImages } from "@/lib/seo-metadata";

const page = getBusinessPageConfig("assistant");

export const metadata: Metadata = publicPageMetadata({
  title: page.title,
  description: page.metaDescription,
  path: "/assistant-ia-telephone",
  image: seoImages.phone,
});

export default function AssistantIATelephoneRoute() {
  const breadcrumb = breadcrumbSchema([{ name: "Assistant téléphonique IA", path: "/assistant-ia-telephone" }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <BusinessSeoPage config={page} />
    </>
  );
}
