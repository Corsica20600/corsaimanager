"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBillingPermission } from "@/lib/billing/access";
import { rejectPurchaseInvoice, validatePurchaseInvoice } from "@/lib/billing/purchases";

export async function validatePurchaseInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:manage_purchases");
  const id = integer(formData, "id");
  await validatePurchaseInvoice(id, text(formData, "review_notes"));
  revalidatePath("/ventes/achats");
  revalidatePath(`/ventes/achats/${id}`);
  redirect(`/ventes/achats/${id}`);
}

export async function rejectPurchaseInvoiceAction(formData: FormData) {
  await requireBillingPermission("billing:manage_purchases");
  const id = integer(formData, "id");
  await rejectPurchaseInvoice(id, text(formData, "rejection_reason"));
  revalidatePath("/ventes/achats");
  revalidatePath(`/ventes/achats/${id}`);
  redirect(`/ventes/achats/${id}`);
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function integer(formData: FormData, key: string) {
  const value = text(formData, key);
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isInteger(parsed)) throw new Error(`Valeur invalide pour ${key}.`);
  return parsed;
}
