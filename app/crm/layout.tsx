import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { CrmNav } from "@/components/crm/CrmNav";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function CrmLayout({ children }: { children: ReactNode }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin");

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <CrmNav />
      <div className="mt-8">{children}</div>
    </main>
  );
}

