import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../admin-auth";
import type { BillingPermission } from "./types";

export async function requireBillingAccess() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin");
}

export async function requireBillingPermission(permission: BillingPermission) {
  void permission;
  await requireBillingAccess();
}
