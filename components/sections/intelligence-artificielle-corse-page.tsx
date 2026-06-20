"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  Building2,
  CircleCheck,
  ClipboardList,
  MapPin,
  MessagesSquare,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";

const whatsappUrl =
  "https://wa.me/33665018730?text=Bonjour%2C%20je%20souhaite%20%C3%A9changer%20au%20sujet%20d%E2%80%99un%20projet%20IA%20pour%20PME.";

const highlights = [
  "Audit IA pour entreprise française",
  "Automatisation IA PME",
  "Assistant IA connecté au métier",
  "CRM intelligent et automatisation commerciale",
];

const approach = [
  "Diagnostic des processus, des outils et des irritants quotidiens.",
  "Priorisation des cas d’usage IA à retour rapide pour votre PME française.",
  "Déploiement progressif, mesurable et compréhensible par vos équipes.",
  "Optimisation continue après la mise en production.",
];

export function IntelligenceArtificielleCorsePage() {
  return (
    <div className="relative overflow-hidden pb-24">
      <BackgroundFx />
      <Container>
        <Hero />

        <section className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item, index) => (
            <Card key={item} delay={index * 0.05}>
              <CircleCheck className="text-cyan-300" size={18} />
              <p className="mt-3 text-sm leading-relaxed text-zinc-200">{item}</p>
            </Card>
          ))}
        </section>

        <SeoSection
          icon={Sparkles}
          title="Consultant IA pour PME en France"
          eyebrow="Stratégie IA France"
        >
          <p>
            L&apos;intelligence artificielle pour PME doit rester concrète, utile et adaptée au terrain.
            Une entreprise française n&apos;a pas toujours besoin d&apos;un grand programme théorique :
            elle a souvent besoin d&apos;un consultant IA capable de comprendre ses contraintes,
            ses outils, ses clients et son rythme d&apos;exécution. CorsaiManager accompagne les
            dirigeants, indépendants et PME françaises pour transformer l&apos;IA en gains visibles :
            moins de tâches répétitives, une meilleure réactivité commerciale, des données mieux
            structurées et des équipes plus disponibles pour les actions à forte valeur.
          </p>
          <p>
            Notre rôle consiste à identifier les cas d&apos;usage réalistes avant de parler technologie.
            Nous analysons vos échanges clients, vos suivis commerciaux, vos formulaires, vos
            documents, vos tableaux de bord et vos logiciels existants. À partir de là, nous
            construisons une feuille de route IA simple : ce qui peut être automatisé rapidement,
            ce qui doit rester humain, et ce qui mérite une application métier dédiée. Cette approche
            évite les effets de mode et permet à chaque entreprise française de déployer l&apos;IA avec
            méthode, sécurité et lisibilité.
          </p>
        </SeoSection>

        <SeoSection
          icon={Workflow}
          title="Automatisation IA pour PME partout en France"
          eyebrow="Processus et productivité"
        >
          <p>
            L&apos;automatisation IA pour PME répond à un besoin très concret : gagner du temps sans perdre
            en qualité de service. Pour une PME française, quelques heures récupérées chaque semaine
            peuvent changer l&apos;organisation commerciale, la relation client et la capacité à suivre
            les opportunités. CorsaiManager met en place des workflows pour traiter les demandes
            entrantes, rédiger des réponses, envoyer des relances, qualifier les prospects, générer
            des comptes rendus ou synchroniser les informations dans un CRM intelligent.
          </p>
          <p>
            L&apos;automatisation commerciale est souvent le premier levier. Beaucoup d&apos;équipes savent
            vendre mais manquent de régularité dans le suivi : emails oubliés, devis non relancés,
            prospects dispersés entre téléphone, WhatsApp, formulaire et tableur. L&apos;IA permet de
            remettre de l&apos;ordre dans ce cycle. Elle peut préparer une relance personnalisée,
            classer une demande, suggérer la prochaine action ou alerter l&apos;équipe lorsqu&apos;un contact
            devient prioritaire. L&apos;objectif n&apos;est pas de remplacer le commercial, mais de lui donner
            un système fiable qui travaille en arrière-plan.
          </p>
        </SeoSection>

        <SeoSection
          icon={MessagesSquare}
          title="Applications métier et assistants IA"
          eyebrow="Outils sur mesure"
        >
          <p>
            Les applications métier sont particulièrement utiles quand les outils standards ne
            suivent plus votre réalité. Une entreprise française peut avoir besoin d&apos;un tableau de bord
            commercial, d&apos;un espace de suivi client, d&apos;un outil de réservation, d&apos;une plateforme de
            gestion documentaire ou d&apos;un assistant IA capable de répondre aux demandes fréquentes.
            CorsaiManager conçoit ces solutions avec une logique pragmatique : interface claire,
            données centralisées, automatisations ciblées et intégrations avec les services déjà
            utilisés par vos équipes.
          </p>
          <p>
            Un assistant IA peut, par exemple, aider à qualifier une demande, résumer un appel,
            préparer une réponse client, orienter un prospect vers la bonne offre ou accompagner un
            collaborateur dans une procédure interne. Dans chaque contexte métier, cette personnalisation
            compte beaucoup. Les contraintes d&apos;une PME de services, d&apos;un prestataire B2B ou
            d&apos;une équipe terrain ne sont pas toujours les mêmes. La solution doit
            parler le langage du métier, respecter vos règles et rester simple à utiliser au
            quotidien.
          </p>
        </SeoSection>

        <section className="mt-16 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <AnimatedReveal>
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur sm:p-8">
              <div className="flex items-center gap-2 text-cyan-200">
                <MapPin size={16} />
                <span className="text-xs uppercase tracking-[0.16em]">Ancrage local</span>
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Basé en Corse, intervention IA dans toute la France
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-zinc-300 sm:text-base">
                CorsaiManager est basé en Corse et accompagne les entreprises partout en France
                avec une organisation flexible : échanges à distance, ateliers
                de cadrage, démonstrations, puis déploiement progressif. Cette proximité permet de
                rester concentré sur les priorités réelles : répondre plus vite aux clients, fluidifier
                les opérations, fiabiliser le suivi commercial et faire monter les équipes en
                compétence sans complexifier leur quotidien.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
                L&apos;IA devient pertinente lorsqu&apos;elle respecte le terrain. Nous privilégions des
                solutions sobres, maintenables et mesurables : un premier workflow, un assistant IA,
                une automatisation commerciale ou une application métier peuvent suffire à créer un
                impact rapide. Ensuite, chaque brique est améliorée selon vos retours, vos indicateurs
                et l&apos;évolution de votre activité.
              </p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={0.08}>
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur sm:p-8">
              <h3 className="text-lg font-medium text-zinc-100">Méthode de déploiement</h3>
              <div className="mt-5 space-y-3">
                {approach.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-zinc-200"
                  >
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedReveal>
        </section>

        <SeoSection
          icon={Building2}
          title="Pourquoi choisir CorsaiManager ?"
          eyebrow="Expertise et exécution"
        >
          <p>
            Choisir CorsaiManager, c&apos;est choisir un partenaire qui relie vision business,
            automatisation IA et développement d&apos;applications concrètes. Nous ne vendons pas une
            couche d&apos;IA générique : nous concevons des systèmes utiles pour vos équipes, vos clients
            et vos objectifs. Chaque projet démarre par une compréhension du métier, puis se traduit
            par des outils opérationnels : assistant IA, CRM intelligent, automatisation commerciale,
            dashboard, application métier ou workflow connecté.
          </p>
          <p>
            Cette approche convient aux PME partout en France qui veulent avancer sérieusement sans subir une
            transformation lourde. Vous gardez la maîtrise des décisions, nous apportons la méthode,
            la conception, la mise en place et l&apos;optimisation. Le résultat attendu est simple :
            des processus plus fluides, des collaborateurs mieux équipés, une relation client plus
            réactive et une intelligence artificielle réellement au service de votre entreprise.
          </p>
        </SeoSection>

        <section className="mt-16 sm:mt-20">
          <AnimatedReveal>
            <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center shadow-[0_0_50px_rgba(34,211,238,0.16)] sm:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Identifiez vos meilleurs cas d&apos;usage IA pour PME en France
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
                Réservez un audit IA gratuit pour prioriser les automatisations et applications les
                plus utiles à votre entreprise.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/audit-ia"
                  className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
                >
                  Réserver un audit IA
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
                >
                  Contact WhatsApp
                </a>
              </div>
            </div>
          </AnimatedReveal>
        </section>
      </Container>
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-16 sm:pt-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <AnimatedReveal>
          <Pill>IA pour PME françaises</Pill>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            Intelligence artificielle pour PME en France
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            CorsaiManager aide les dirigeants de PME françaises à intégrer l&apos;IA dans leurs processus :
            automatisation, assistants IA, applications métier, CRM intelligent et optimisation
            commerciale.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/audit-ia"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
            >
              Demander un audit IA
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Voir les solutions
              <ArrowRight size={15} />
            </Link>
          </div>
        </AnimatedReveal>

        <AnimatedReveal delay={0.08}>
          <motion.div
            className="relative rounded-3xl border border-white/10 bg-zinc-900/70 p-5 shadow-[0_0_60px_rgba(34,211,238,0.14)] backdrop-blur sm:p-6"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-200">Plan IA France</span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[11px] text-emerald-200">
                Public
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <HeroStat label="Zone" value="France entière" />
              <HeroStat label="Objectif" value="Process + ventes" />
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] text-zinc-400">Priorités fréquentes</p>
              <p className="mt-1 text-sm text-zinc-200">
                Relances, qualification, assistant IA, CRM, reporting et outils métier.
              </p>
            </div>
          </motion.div>
        </AnimatedReveal>
      </div>
    </section>
  );
}

function SeoSection({
  children,
  eyebrow,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  icon: typeof Sparkles;
  title: string;
}) {
  return (
    <section className="mt-16 sm:mt-20">
      <AnimatedReveal>
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur sm:p-8">
          <div className="flex items-center gap-2 text-cyan-200">
            <Icon size={16} />
            <span className="text-xs uppercase tracking-[0.16em]">{eyebrow}</span>
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            {title}
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
            {children}
          </div>
        </div>
      </AnimatedReveal>
    </section>
  );
}

function Card({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <AnimatedReveal delay={delay}>
      <article className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]">
        {children}
      </article>
    </AnimatedReveal>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function BackgroundFx() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[7%] top-20 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute right-[8%] top-40 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute bottom-16 left-[35%] h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.12]" />
      <Bot className="absolute left-[12%] top-[34%] text-cyan-300/14" size={76} />
      <Rocket className="absolute right-[16%] top-[30%] text-cyan-300/14" size={70} />
      <ClipboardList className="absolute right-[30%] bottom-[18%] text-cyan-300/14" size={66} />
    </div>
  );
}
