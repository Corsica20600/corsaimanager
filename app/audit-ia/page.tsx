import type { Metadata } from "next";
import { CalendlyInline } from "@/components/calendly/calendly-inline";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { AuditRequestForm } from "@/components/sections/audit-request-form";
import { Container } from "@/components/ui/container";
import { CALENDLY_URL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Audit IA",
  description:
    "Audit IA gratuit CorsaiManager pour analyser vos tâches répétitives, vos outils existants et vos meilleures opportunités d'automatisation.",
};

const deliverables = [
  "Cartographie des tâches répétitives à automatiser en priorité",
  "Analyse de vos outils actuels (CRM, emailing, support, vente)",
  "Plan d'action IA concret avec quick wins et feuille de route",
  "Estimation des gains en temps, qualité et productivité",
];

const target = [
  "PME commerciales qui veulent accélérer leurs relances et leur suivi",
  "Entreprises de services qui cherchent à automatiser les tâches manuelles",
  "Dirigeants qui veulent une vision claire des opportunités IA rentables",
];

const process = [
  "Échange de cadrage sur votre contexte et vos objectifs",
  "Analyse de vos flux actuels et de vos points de friction",
  "Restitution d'un plan priorisé avec recommandations concrètes",
  "Proposition d'un scénario de déploiement progressif",
];

export default function AuditPage() {
  return (
    <div className="pb-20">
      <SharedPageHero
        badge="Audit IA"
        title="Audit IA gratuit pour votre entreprise"
        description="Identifiez rapidement où l'IA peut générer le plus d'impact: réduction des tâches répétitives, optimisation de vos outils existants et automatisations actionnables pour vos équipes."
      />

      <Container>
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <Panel title="Ce que vous recevez" items={deliverables} />
          <Panel title="Pour qui ?" items={target} />
          <Panel title="Déroulé de l’audit" items={process} />
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Demander votre audit IA
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Remplissez ce formulaire. Nous revenons vers vous avec une première qualification et une proposition de créneau.
          </p>
          <div className="mt-6">
            <AuditRequestForm />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Réservez directement un échange de 30 minutes
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Choisissez le créneau qui vous convient pour cadrer vos priorités IA et vos objectifs business.
          </p>
          <div className="mt-6">
            <CalendlyInline url={CALENDLY_URL} minHeight={780} />
          </div>
        </section>
      </Container>
    </div>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-lg font-medium text-zinc-100">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-300">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-white/[0.03] px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
