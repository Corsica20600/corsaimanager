import { saveBillingSettingsAction } from "@/app/ventes/actions";
import { SalesBackLink } from "@/components/billing/SalesEmptyState";
import { getBillingSettings } from "@/lib/billing/repository";

export default async function BillingSettingsPage() {
  const settings = await getBillingSettings();

  return (
    <div className="grid gap-5">
      <SalesBackLink />
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Paramètres</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Identité de facturation</h1>
        <p className="mt-2 text-sm text-zinc-400">Ces informations sont figées dans le snapshot du devis au premier envoi.</p>
      </section>

      <form action={saveBillingSettingsAction} className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 md:grid-cols-2">
        <Field name="trade_name" label="Nom commercial" defaultValue={settings?.trade_name ?? "CorsaiManager"} />
        <Field name="legal_name" label="Nom légal" defaultValue={settings?.legal_name ?? ""} />
        <Field name="address_line1" label="Adresse" defaultValue={settings?.address_line1 ?? "3175 Strada di a Marana"} />
        <Field name="address_line2" label="Complément" defaultValue={settings?.address_line2 ?? ""} />
        <Field name="postal_code" label="Code postal" defaultValue={settings?.postal_code ?? "20620"} />
        <Field name="city" label="Ville" defaultValue={settings?.city ?? "Biguglia"} />
        <Field name="country" label="Pays" defaultValue={settings?.country ?? "France"} />
        <Field name="siren_or_siret" label="SIRET" defaultValue={settings?.siren_or_siret ?? "en cours"} />
        <Field name="vat_number" label="Numéro TVA" defaultValue={settings?.vat_number ?? ""} />
        <Field name="email" label="Email" defaultValue={settings?.email ?? "contact@corsaimanager.com"} />
        <Field name="phone" label="Téléphone" defaultValue={settings?.phone ?? ""} />
        <Field name="website" label="Site web" defaultValue={settings?.website ?? "https://www.corsaimanager.com"} />
        <Field name="iban" label="IBAN" defaultValue={settings?.iban ?? ""} />
        <Field name="bic" label="BIC" defaultValue={settings?.bic ?? ""} />
        <Field name="default_currency" label="Devise par défaut" defaultValue={settings?.default_currency ?? "EUR"} />
        <Field name="default_vat_rate_percent" label="TVA par défaut (%)" defaultValue={String((settings?.default_vat_rate_basis_points ?? 0) / 100)} />
        <Field name="default_payment_terms_days" label="Délai paiement (jours)" defaultValue={String(settings?.default_payment_terms_days ?? 30)} />
        <Field name="quote_prefix" label="Préfixe devis" defaultValue={settings?.quote_prefix ?? "DEV"} />
        <label className="flex items-center gap-2 text-sm text-zinc-300 md:col-span-2">
          <input type="checkbox" name="vat_exemption_enabled" defaultChecked={settings?.vat_exemption_enabled ?? true} />
          TVA non applicable / franchise en base
        </label>
        <TextArea name="vat_exemption_note" label="Mention TVA" defaultValue={settings?.vat_exemption_note ?? "TVA non applicable, article 293 B du CGI"} />
        <TextArea name="default_notes" label="Notes par défaut" defaultValue={settings?.default_notes ?? ""} />
        <TextArea name="default_terms" label="Conditions par défaut" defaultValue={settings?.default_terms ?? ""} />
        <Field name="pdf_primary_color" label="Couleur PDF" defaultValue={settings?.pdf_primary_color ?? "#22d3ee"} />
        <div className="md:col-span-2">
          <button className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-zinc-950">Enregistrer les paramètres</button>
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      {label}
      <input name={name} defaultValue={defaultValue} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-zinc-100" />
    </label>
  );
}

function TextArea({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">
      {label}
      <textarea name={name} defaultValue={defaultValue} rows={4} className="rounded-xl border border-white/15 bg-zinc-950/70 px-3 py-2.5 text-zinc-100" />
    </label>
  );
}
