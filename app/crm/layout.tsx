import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CrmNav } from "@/components/crm/CrmNav";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "CRM CorsaiManager",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function CrmLayout({ children }: { children: ReactNode }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin");

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
      <CrmNav />
      <div className="mt-8">{children}</div>
    </main>
  );
}
