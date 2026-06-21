import { createProspectAction, updateProspectAction } from "@/app/crm/actions";
import type { ProspectRow } from "@/lib/crm/types";
import { prospectStatuses } from "@/lib/crm/types";

type Props = {
  prospect?: ProspectRow;
};

export function ProspectForm({ prospect }: Props) {
  const action = prospect ? updateProspectAction : createProspectAction;

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur">
      {prospect ? <input type="hidden" name="id" value={prospect.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Entreprise *" name="company_name" defaultValue={prospect?.company_name} required />
        <Field label="Contact" name="contact_name" defaultValue={prospect?.contact_name} />
        <Field label="Email" name="email" type="email" defaultValue={prospect?.email} />
        <Field label="Téléphone" name="phone" defaultValue={prospect?.phone} />
        <Field label="Site web" name="website" defaultValue={prospect?.website} />
        <Field label="Ville" name="city" defaultValue={prospect?.city} />
        <Field label="Secteur" name="sector" defaultValue={prospect?.sector} />
        <Field label="Source" name="source" defaultValue={prospect?.source ?? "manuel"} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-zinc-300">
          <span>Statut</span>
          <select
            name="status"
            defaultValue={prospect?.status ?? "nouveau"}
            className="w-full rounded-xl border border-white/15 bg-zinc-950/60 px-3 py-2.5 text-zinc-100 focus:border-cyan-300/60 focus:outline-none"
          >
            {prospectStatuses.map((status) => (
              <option key={status} value={status} className="bg-zinc-900">
                {status}
              </option>
            ))}
          </select>
        </label>
        <Field label="Score" name="score" type="number" min={0} max={100} defaultValue={String(prospect?.score ?? 0)} />
        <Field
          label="Dernier contact"
          name="last_contacted_at"
          type="datetime-local"
          defaultValue={toDateTimeLocal(prospect?.last_contacted_at)}
        />
        <Field
          label="Prochaine relance"
          name="next_follow_up_at"
          type="datetime-local"
          defaultValue={toDateTimeLocal(prospect?.next_follow_up_at)}
        />
      </div>

      <label className="space-y-2 text-sm text-zinc-300">
        <span>Notes</span>
        <textarea
          name="notes"
          defaultValue={prospect?.notes ?? ""}
          rows={5}
          className="w-full rounded-xl border border-white/15 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
          placeholder="Contexte, objections, prochaine action..."
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-2.5 text-sm font-semibold text-zinc-950">
          {prospect ? "Enregistrer les modifications" : "Ajouter le prospect"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <label className="space-y-2 text-sm text-zinc-300">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-xl border border-white/15 bg-zinc-950/60 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
      />
    </label>
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

