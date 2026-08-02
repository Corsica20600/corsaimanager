import { archiveSubscriptionPlanAction, createSubscriptionCheckoutAction, openCustomerPortalAction, saveSubscriptionPlanAction } from "@/app/ventes/actions";
import { SalesBackLink } from "@/components/billing/SalesEmptyState";
import { formatBillingDate, formatBillingMoney } from "@/lib/billing/format";
import { formatPaymentMethod } from "@/lib/billing/payment-methods";
import { getBillingProducts, getBillingSettings, getQuoteProspectOptions, listCustomerSubscriptions, listSubscriptionPlans } from "@/lib/billing/repository";

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [plans, subscriptions, prospects, products, settings] = await Promise.all([
    listSubscriptionPlans({ includeArchived: true }),
    listCustomerSubscriptions({ query: value(params.q) ?? "" }),
    getQuoteProspectOptions(),
    getBillingProducts(),
    getBillingSettings(),
  ]);
  const activePlans = plans.filter((plan) => plan.is_active && !plan.archived_at && plan.stripe_price_id);

  return (
    <div className="grid gap-5">
      <SalesBackLink />
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Stripe Billing</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Abonnements</h1>
        <p className="mt-2 text-sm text-zinc-400">Checkout crée l&apos;abonnement, les webhooks Stripe synchronisent les statuts, factures récurrentes et paiements.</p>
        {value(params.checkout) === "success" ? <p className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">Checkout terminé. Le webhook Stripe finalise la synchronisation.</p> : null}
        {value(params.checkout) === "cancel" ? <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">Checkout annulé.</p> : null}
        {value(params.plan) === "created" ? <p className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">Plan créé. Vous pouvez maintenant lancer un Checkout abonnement.</p> : null}
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <h2 className="text-xl font-semibold text-zinc-100">Lancer un Checkout abonnement</h2>
        <form action={createSubscriptionCheckoutAction} className="flex flex-wrap gap-2">
          <select name="prospect_id" className="min-w-72 rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100">
            {prospects.map((prospect) => <option key={prospect.id} value={prospect.id} className="bg-zinc-900">{prospect.company_name} - {prospect.email ?? "email manquant"}</option>)}
          </select>
          <select name="plan_id" className="min-w-64 rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100">
            {activePlans.length ? activePlans.map((plan) => <option key={plan.id} value={plan.id} className="bg-zinc-900">{plan.name} - {formatBillingMoney(plan.price_cents, plan.currency)} / {plan.frequency}</option>) : <option className="bg-zinc-900">Créez d&apos;abord un plan Stripe</option>}
          </select>
          <button disabled={!activePlans.length || !prospects.length} className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40">Ouvrir Checkout</button>
        </form>
        {!activePlans.length ? <p className="text-sm text-amber-200">Aucun plan actif avec un prix Stripe n&apos;est encore disponible. Créez un plan en choisissant le mode Stripe Checkout si vous voulez encaisser par Stripe.</p> : null}
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Créer un plan local</h2>
          <p className="mt-1 text-sm text-zinc-400">Vous pouvez repartir d&apos;une prestation du catalogue. Stripe n&apos;est utilisé que si le mode de paiement sélectionné est Stripe Checkout.</p>
        </div>
        <form action={saveSubscriptionPlanAction} className="grid gap-3 md:grid-cols-6">
          <select name="product_id" defaultValue="" className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-sm text-zinc-100 md:col-span-2">
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
      </section>

      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300"><tr>{["Plan", "Prix", "Règlement", "Stripe Price", "Statut", "Action"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr></thead>
          <tbody>
            {plans.map((plan) => <tr key={plan.id} className="border-b border-white/5 text-zinc-200"><td className="px-4 py-3"><div className="font-medium text-zinc-100">{plan.name}</div><div className="text-xs text-zinc-500">{plan.description ?? "-"}</div></td><td className="px-4 py-3">{formatBillingMoney(plan.price_cents, plan.currency)} / {plan.frequency}</td><td className="px-4 py-3"><div>{formatPaymentMethod(plan.payment_method)}</div>{plan.payment_method === "bank_transfer" ? <BankDetails settings={settings} /> : null}</td><td className="px-4 py-3">{plan.stripe_price_id ?? "-"}</td><td className="px-4 py-3">{plan.archived_at ? "Archivé" : plan.is_active ? "Actif" : "Inactif"}</td><td className="px-4 py-3"><form action={archiveSubscriptionPlanAction}><input type="hidden" name="id" value={plan.id} /><input type="hidden" name="archived" value={plan.archived_at ? "false" : "true"} /><button className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-100">{plan.archived_at ? "Restaurer" : "Archiver"}</button></form></td></tr>)}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-zinc-300"><tr>{["Client", "Plan", "Statut", "Période", "Stripe", "Portal"].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr></thead>
          <tbody>
            {subscriptions.map((sub) => <tr key={sub.id} className="border-b border-white/5 text-zinc-200"><td className="px-4 py-3"><div className="font-medium text-zinc-100">{sub.company_name}</div><div className="text-xs text-zinc-500">{sub.email ?? "-"}</div></td><td className="px-4 py-3">{sub.plan_name ?? "-"}</td><td className="px-4 py-3">{sub.status}</td><td className="px-4 py-3">{formatBillingDate(sub.current_period_starts_at)} - {formatBillingDate(sub.current_period_ends_at)}</td><td className="px-4 py-3 text-xs">{sub.stripe_subscription_id ?? sub.stripe_customer_id ?? "-"}</td><td className="px-4 py-3">{sub.stripe_customer_id ? <form action={openCustomerPortalAction}><input type="hidden" name="subscription_id" value={sub.id} /><button className="rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs text-cyan-100">Portal</button></form> : "-"}</td></tr>)}
            {!subscriptions.length ? <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400">Aucun abonnement synchronisé.</td></tr> : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function value(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}

function BankDetails({ settings }: { settings: Awaited<ReturnType<typeof getBillingSettings>> }) {
  if (!settings?.iban && !settings?.bic) {
    return <p className="mt-1 text-xs text-amber-200">RIB à renseigner dans les paramètres.</p>;
  }

  return (
    <div className="mt-1 grid gap-0.5 text-xs text-zinc-500">
      <span>IBAN : {settings.iban ?? "-"}</span>
      <span>BIC : {settings.bic ?? "-"}</span>
    </div>
  );
}
