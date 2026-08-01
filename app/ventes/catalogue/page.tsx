import { archiveBillingProductAction, saveBillingProductAction } from "@/app/ventes/actions";
import { SalesBackLink } from "@/components/billing/SalesEmptyState";
import { listBillingProducts } from "@/lib/billing/repository";
import { formatBillingMoney } from "@/lib/billing/format";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CataloguePage({ searchParams }: Props) {
  const params = await searchParams;
  const products = await listBillingProducts({ query: value(params.q) ?? "", status: normalizeStatus(value(params.status)) });

  return (
    <div className="grid gap-5">
      <SalesBackLink />
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Catalogue</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Produits et prestations</h1>
        <form className="mt-5 flex flex-wrap gap-2">
          <input name="q" defaultValue={value(params.q) ?? ""} placeholder="Rechercher" className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100" />
          <select name="status" defaultValue={normalizeStatus(value(params.status))} className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-100">
            <option value="active" className="bg-zinc-900">Actifs</option>
            <option value="archived" className="bg-zinc-900">Archivés</option>
            <option value="all" className="bg-zinc-900">Tous</option>
          </select>
          <button className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">Filtrer</button>
        </form>
      </section>

      <ProductForm />

      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300">
            <tr>
              {["Nom", "Type", "Référence", "Prix HT", "TVA", "Unité", "Statut", "Action"].map((head) => (
                <th key={head} className="px-4 py-3 font-medium">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-white/5 text-zinc-200">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-100">{product.name}</div>
                  <div className="text-xs text-zinc-500">{product.description ?? "-"}</div>
                </td>
                <td className="px-4 py-3">{product.type}</td>
                <td className="px-4 py-3">{product.internal_reference ?? "-"}</td>
                <td className="px-4 py-3">{formatBillingMoney(product.unit_price_cents)}</td>
                <td className="px-4 py-3">{product.vat_rate_basis_points / 100}%</td>
                <td className="px-4 py-3">{product.unit}</td>
                <td className="px-4 py-3">{product.archived_at || !product.is_active ? "Archivé" : "Actif"}</td>
                <td className="px-4 py-3">
                  <div className="grid gap-2">
                    <form action={archiveBillingProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <input type="hidden" name="archived" value={product.archived_at || !product.is_active ? "false" : "true"} />
                      <button className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-100">
                        {product.archived_at || !product.is_active ? "Restaurer" : "Archiver"}
                      </button>
                    </form>
                    <details className="min-w-72">
                      <summary className="cursor-pointer text-xs text-cyan-100">Modifier</summary>
                      <EditProductForm product={product} />
                    </details>
                  </div>
                </td>
              </tr>
            ))}
            {!products.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">Aucune prestation dans le catalogue.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function EditProductForm({ product }: { product: Awaited<ReturnType<typeof listBillingProducts>>[number] }) {
  return (
    <form action={saveBillingProductAction} className="mt-3 grid gap-2 rounded-xl border border-white/10 bg-zinc-950/70 p-3">
      <input type="hidden" name="id" value={product.id} />
      <input name="name" defaultValue={product.name} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-zinc-100" />
      <input name="description" defaultValue={product.description ?? ""} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-zinc-100" />
      <input name="internal_reference" defaultValue={product.internal_reference ?? ""} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-zinc-100" />
      <select name="type" defaultValue={product.type} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-zinc-100">
        <option value="service" className="bg-zinc-900">Service</option>
        <option value="product" className="bg-zinc-900">Produit</option>
      </select>
      <input name="unit_price" defaultValue={String(product.unit_price_cents / 100)} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-zinc-100" />
      <input name="vat_rate_percent" defaultValue={String(product.vat_rate_basis_points / 100)} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-zinc-100" />
      <input name="unit" defaultValue={product.unit} className="rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-zinc-100" />
      <button className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-zinc-950">Enregistrer</button>
    </form>
  );
}

function ProductForm() {
  return (
    <form action={saveBillingProductAction} className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-6">
      <h2 className="text-xl font-semibold text-zinc-100 md:col-span-6">Ajouter une prestation</h2>
      <input name="name" placeholder="Nom" required className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-2" />
      <input name="description" placeholder="Description" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-2" />
      <input name="internal_reference" placeholder="Référence interne" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <select name="type" defaultValue="service" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100">
        <option value="service" className="bg-zinc-900">Service</option>
        <option value="product" className="bg-zinc-900">Produit</option>
      </select>
      <input name="unit_price" placeholder="Prix HT ex: 490" inputMode="decimal" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <input name="vat_rate_percent" placeholder="TVA % ex: 20" inputMode="decimal" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <input name="unit" defaultValue="unité" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100" />
      <button className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 md:col-span-2">Ajouter au catalogue</button>
    </form>
  );
}

function value(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}

function normalizeStatus(status?: string): "active" | "archived" | "all" {
  return status === "archived" || status === "all" ? status : "active";
}
