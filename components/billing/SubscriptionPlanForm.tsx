"use client";

import { useMemo } from "react";
import { formatBillingMoney } from "@/lib/billing/format";
import type { BillingProductRow } from "@/lib/billing/types";

type ProductOption = Pick<
  BillingProductRow,
  "id" | "name" | "description" | "unit_price_cents" | "vat_rate_basis_points"
>;

export function SubscriptionPlanForm({
  action,
  products,
}: {
  action: (formData: FormData) => void | Promise<void>;
  products: ProductOption[];
}) {
  const productsById = useMemo(() => new Map(products.map((product) => [String(product.id), product])), [products]);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-6">
      <select
        name="product_id"
        defaultValue=""
        onChange={(event) => {
          const product = productsById.get(event.currentTarget.value);
          const form = event.currentTarget.form;
          if (!product || !form) return;
          setFieldValue(form, "name", product.name);
          setFieldValue(form, "price", String(product.unit_price_cents / 100));
          setFieldValue(form, "vat_rate_percent", String(product.vat_rate_basis_points / 100));
          setFieldValue(form, "description", product.description ?? "");
        }}
        className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-2"
      >
        <option value="" className="bg-zinc-900">Produit du catalogue optionnel</option>
        {products.map((product) => (
          <option key={product.id} value={product.id} className="bg-zinc-900">
            {product.name} - {formatBillingMoney(product.unit_price_cents)} HT
          </option>
        ))}
      </select>
      <select name="payment_mode" defaultValue="bank_transfer" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-2">
        <option value="bank_transfer" className="bg-zinc-900">Virement</option>
        <option value="direct_debit" className="bg-zinc-900">Prélèvement</option>
        <option value="check" className="bg-zinc-900">Chèque</option>
        <option value="cash" className="bg-zinc-900">Espèces</option>
        <option value="stripe_checkout" className="bg-zinc-900">Carte (Stripe Checkout)</option>
      </select>
      <div className="rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-400 md:col-span-2">
        En manuel, aucun identifiant Stripe n&apos;est créé. En Stripe, renseignez `price_...` ou laissez vide pour le créer.
      </div>
      <input name="name" placeholder="Nom, ou vide si produit sélectionné" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-2" />
      <input name="price" placeholder="Prix ex: 150, ou vide si produit sélectionné" inputMode="decimal" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <select name="frequency" defaultValue="monthly" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100"><option value="monthly">Mensuel</option><option value="yearly">Annuel</option></select>
      <input name="stripe_price_id" placeholder="price_... (optionnel)" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-2" />
      <input name="stripe_product_id" placeholder="prod_... (optionnel)" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-2" />
      <input name="currency" defaultValue="EUR" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <input name="trial_days" placeholder="Essai jours" defaultValue="0" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <input name="setup_fee" placeholder="Frais setup" defaultValue="0" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <input name="vat_rate_percent" placeholder="TVA %" defaultValue="0" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <textarea name="description" placeholder="Description" rows={3} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-3" />
      <textarea name="features" placeholder="Fonctionnalités, une par ligne" rows={3} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-3" />
      <button className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 md:col-span-2">Enregistrer le plan</button>
    </form>
  );
}

function setFieldValue(form: HTMLFormElement, name: string, value: string) {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = value;
  }
}
