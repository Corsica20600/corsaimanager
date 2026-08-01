import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SalesNav } from "@/components/billing/SalesNav";
import { requireBillingAccess } from "@/lib/billing/access";

export const metadata: Metadata = {
  title: "Ventes CorsaiManager",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function SalesLayout({ children }: { children: ReactNode }) {
  await requireBillingAccess();

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <SalesNav />
      <div className="mt-8">{children}</div>
    </main>
  );
}
