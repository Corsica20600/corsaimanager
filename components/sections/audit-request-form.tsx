"use client";

import { ReactNode, useActionState, useEffect, useMemo, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitAuditRequest } from "@/app/audit-ia/actions";

type AuditFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<
    Record<"nom" | "email" | "entreprise" | "secteur" | "besoin" | "telephone", string>
  >;
};

const initialAuditFormState: AuditFormState = {
  status: "idle",
  message: "",
};

export function AuditRequestForm() {
  const [state, formAction, isPending] = useActionState(
    submitAuditRequest,
    initialAuditFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaInFlightRef = useRef(false);
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  useEffect(() => {
    if (!recaptchaSiteKey || typeof window === "undefined") return;
    if (document.querySelector('script[data-recaptcha="v3"]')) return;

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(recaptchaSiteKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "v3";
    document.head.appendChild(script);
  }, [recaptchaSiteKey]);

  const feedbackClass = useMemo(() => {
    if (state.status === "success") return "text-emerald-300 border-emerald-300/25 bg-emerald-400/10";
    if (state.status === "error") return "text-rose-200 border-rose-300/25 bg-rose-400/10";
    return "";
  }, [state.status]);

  const feedbackMessage = useMemo(() => {
    if (!state.message) return "";
    if (state.message === "Spam détecté.") {
      return "Votre envoi a été bloqué par la protection anti-spam. Merci de réessayer.";
    }
    if (state.status === "success") {
      return "Demande envoyée avec succès. Nous vous recontactons sous 24h ouvrées.";
    }
    return state.message;
  }, [state.message, state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={async (event) => {
        if (!recaptchaSiteKey || recaptchaInFlightRef.current) return;
        const form = formRef.current;
        if (!form) return;

        const grecaptcha = (window as Window & { grecaptcha?: { ready: (cb: () => void) => void; execute: (siteKey: string, opts: { action: string }) => Promise<string> } }).grecaptcha;
        if (!grecaptcha) return;

        const tokenInput = form.querySelector<HTMLInputElement>('input[name="recaptcha_token"]');
        if (!tokenInput || tokenInput.value) return;

        event.preventDefault();
        recaptchaInFlightRef.current = true;
        try {
          const token = await new Promise<string>((resolve, reject) => {
            grecaptcha.ready(() => {
              grecaptcha.execute(recaptchaSiteKey, { action: "audit_form_submit" }).then(resolve).catch(reject);
            });
          });
          tokenInput.value = token;
        } finally {
          recaptchaInFlightRef.current = false;
        }
        form.requestSubmit();
      }}
      className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur transition-all duration-300 sm:p-8"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />
      <input type="hidden" name="recaptcha_token" defaultValue="" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" required>
          <input
            name="nom"
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
            placeholder="Votre nom"
          />
          {state.fieldErrors?.nom ? (
            <p className="mt-2 text-xs text-rose-300">{state.fieldErrors.nom}</p>
          ) : null}
        </Field>
        <Field label="Email" required>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
            placeholder="vous@entreprise.com"
          />
          {state.fieldErrors?.email ? (
            <p className="mt-2 text-xs text-rose-300">{state.fieldErrors.email}</p>
          ) : null}
        </Field>
        <Field label="Téléphone (optionnel)">
          <input
            name="telephone"
            inputMode="tel"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
            placeholder="+33 ..."
          />
          {state.fieldErrors?.telephone ? (
            <p className="mt-2 text-xs text-rose-300">{state.fieldErrors.telephone}</p>
          ) : null}
        </Field>
        <Field label="Entreprise" required>
          <input
            name="entreprise"
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
            placeholder="Nom de l'entreprise"
          />
          {state.fieldErrors?.entreprise ? (
            <p className="mt-2 text-xs text-rose-300">{state.fieldErrors.entreprise}</p>
          ) : null}
        </Field>
        <Field label="Secteur d'activité" required>
          <input
            name="secteur"
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
            placeholder="Ex: restauration, services..."
          />
          {state.fieldErrors?.secteur ? (
            <p className="mt-2 text-xs text-rose-300">{state.fieldErrors.secteur}</p>
          ) : null}
        </Field>
        <Field label="Besoin principal" required>
          <input
            name="besoin"
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
            placeholder="Ex: relances, CRM, support client"
          />
          {state.fieldErrors?.besoin ? (
            <p className="mt-2 text-xs text-rose-300">{state.fieldErrors.besoin}</p>
          ) : null}
        </Field>
      </div>

      <Field label="Message libre" className="mt-4">
        <textarea
          name="message"
          rows={5}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-300/60 focus:outline-none"
          placeholder="Décrivez votre contexte et vos objectifs"
        />
      </Field>

      {feedbackMessage ? (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm backdrop-blur transition-all duration-300 ${feedbackClass}`}
        >
          {feedbackMessage}
        </p>
      ) : null}

      <SubmitButton pending={isPending} />
    </form>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  const { pending: formPending } = useFormStatus();
  const isSubmitting = pending || formPending;

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className={isSubmitting ? "animate-pulse" : ""}>
        {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande d’audit"}
      </span>
    </button>
  );
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm text-zinc-300">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
