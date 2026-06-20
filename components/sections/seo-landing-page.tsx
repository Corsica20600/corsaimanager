"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowRight, CircleCheck, Sparkles } from "lucide-react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { getSeoPageEnhancement } from "@/lib/seo-page-enhancements";
import type { SeoPageData } from "@/lib/seo-pages";

export function SeoLandingPage({ page }: { page: SeoPageData }) {
  const enhancement = getSeoPageEnhancement(page.slug);

  return (
    <div className="relative overflow-hidden pb-24">
      <BackgroundFx />
      <Container>
        <section className="pt-16 sm:pt-20">
          <AnimatedReveal>
            <Pill>{page.type === "local" ? "SEO Local + National" : "SEO National PME"}</Pill>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              {page.subtitle}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit-ia"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
              >
                Réserver un audit IA
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
              >
                Voir les solutions
                <ArrowRight size={14} />
              </Link>
            </div>
          </AnimatedReveal>
        </section>

        <section className="mt-16 grid gap-4 lg:grid-cols-2">
          <InfoCard title={page.problemTitle} content={page.problemText} />
          <InfoCard title={page.solutionTitle} content={page.solutionText} delay={0.08} />
        </section>

        <section className="mt-16">
          <SectionTitle title="Audit SEO et contenu unique" />
          <AnimatedReveal delay={0.05}>
            <article className="mt-7 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur">
              <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                {enhancement.auditFocus}
              </p>
            </article>
          </AnimatedReveal>
        </section>

        {enhancement.deepDive.length > 0 ? (
          <section className="mt-16">
            <SectionTitle title="Analyse détaillée" />
            <div className="mt-7 space-y-4">
              {enhancement.deepDive.map((paragraph, index) => (
                <AnimatedReveal key={paragraph} delay={index * 0.03}>
                  <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">{paragraph}</p>
                  </article>
                </AnimatedReveal>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-16">
          <SectionTitle title="Contexte, méthode et différenciation" />
          <div className="mt-7 space-y-4">
            {buildDepthParagraphs(page).map((paragraph, index) => (
              <AnimatedReveal key={paragraph} delay={index * 0.03}>
                <article className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
                  <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">{paragraph}</p>
                </article>
              </AnimatedReveal>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionTitle title="Cas d’usage" />
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {page.useCases.map((item, index) => (
              <BulletCard key={item} text={item} delay={index * 0.05} />
            ))}
          </div>
        </section>

        {enhancement.corsicaExamples.length > 0 ? (
          <section className="mt-16">
            <SectionTitle title="Exemples concrets pour PME" />
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {enhancement.corsicaExamples.map((item, index) => (
                <BulletCard key={item} text={item} delay={index * 0.05} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-16">
          <SectionTitle title="Bénéfices business" />
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {page.benefits.map((item, index) => (
              <BulletCard key={item} text={item} delay={index * 0.05} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionTitle title="Méthode de mise en place" />
          <div className="mt-7 grid gap-3 md:grid-cols-4">
            {page.methodSteps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200"
              >
                {step}
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionTitle title="Pourquoi CorsaiManager" />
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {page.why.map((item, index) => (
              <BulletCard key={item} text={item} delay={index * 0.05} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionTitle title="FAQ" />
          <div className="mt-7 space-y-3">
            {[...page.faqs, ...enhancement.specificFaqs].map((faq, index) => (
              <AnimatedReveal key={faq.q} delay={index * 0.03}>
                <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-lg font-medium text-zinc-100">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{faq.a}</p>
                </article>
              </AnimatedReveal>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionTitle title="Pages complémentaires" />
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {enhancement.internalLinks.map((item, index) => (
              <AnimatedReveal key={item.href} delay={index * 0.04}>
                <Link
                  href={item.href}
                  className="block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]"
                >
                  <h3 className="text-lg font-medium text-zinc-100">{item.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.text}</p>
                </Link>
              </AnimatedReveal>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <AnimatedReveal>
            <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center sm:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Passez de l&apos;idée à une automatisation utile
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
                Échangeons sur vos priorités métier et identifions les actions IA les plus rentables.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/audit-ia"
                  className="inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
                >
                  Réserver un audit IA
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </AnimatedReveal>
        </section>
      </Container>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <AnimatedReveal>
      <div className="flex items-center gap-2 text-cyan-200">
        <Activity size={16} />
        <span className="text-xs uppercase tracking-[0.16em]">Automatisation IA concrète</span>
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{title}</h2>
    </AnimatedReveal>
  );
}

function buildDepthParagraphs(page: SeoPageData) {
  const useCases = page.useCases.join(", ");
  const benefits = page.benefits.join(", ");
  const method = page.methodSteps.join(", ");
  const why = page.why.join(", ");

  return [
    `Pour renforcer l'utilité de cette page, le contenu part d'une intention précise : ${page.h1}. Le sujet n'est pas traité comme une simple présentation de service, mais comme une réponse à une situation métier identifiable. ${page.problemText} Cette formulation permet d'éviter les généralités et d'aider le visiteur à reconnaître rapidement son propre contexte avant de comparer les solutions possibles.`,
    `Les cas d'usage prioritaires abordés ici sont volontairement ciblés : ${useCases}. Ils servent à montrer comment la promesse peut se traduire dans une organisation réelle, avec des équipes, des contraintes, des outils et des délais. Cette granularité différencie la page des autres contenus du site, car chaque URL met en avant un angle de recherche, une problématique et un vocabulaire métier distincts.`,
    `La proposition de valeur repose sur des bénéfices concrets : ${benefits}. Ces bénéfices ne sont pas présentés comme des slogans, mais comme des effets attendus après cadrage, mise en place et mesure. ${page.solutionText} Le contenu relie ainsi la recherche SEO à une décision opérationnelle : comprendre ce qui peut changer, comment le déployer, puis comment vérifier que le projet produit bien un résultat.`,
    `La méthode de mise en place suit une progression claire : ${method}. Cette séquence aide les dirigeants à se projeter sans imaginer un chantier trop lourd. Elle montre que le projet peut commencer par un périmètre réduit, puis évoluer selon les retours terrain, les indicateurs et les priorités de l'entreprise. C'est un point important pour limiter la friction et favoriser l'adoption par les équipes.`,
    `Le choix de CorsaiManager est expliqué avec des arguments propres à cette page : ${why}. L'objectif est de donner au lecteur une raison claire de passer à l'étape suivante, tout en conservant un contenu unique par rapport aux autres pages SEO. Le maillage interne complète cette logique en orientant vers des pages proches mais différentes, afin que chaque besoin dispose de son propre chemin de lecture.`,
  ];
}

function InfoCard({ title, content, delay = 0 }: { title: string; content: string; delay?: number }) {
  return (
    <AnimatedReveal delay={delay}>
      <article className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur">
        <h2 className="text-2xl font-semibold text-zinc-100">{title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-zinc-300">{content}</p>
      </article>
    </AnimatedReveal>
  );
}

function BulletCard({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <AnimatedReveal delay={delay}>
      <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]">
        <div className="flex items-start gap-2">
          <CircleCheck className="mt-0.5 text-cyan-300" size={16} />
          <p className="text-sm leading-relaxed text-zinc-200">{text}</p>
        </div>
      </article>
    </AnimatedReveal>
  );
}

function BackgroundFx() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[7%] top-20 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute right-[8%] top-40 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute bottom-16 left-[35%] h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-[0.12]" />
      <Sparkles className="absolute left-[12%] top-[34%] text-cyan-300/14" size={72} />
    </div>
  );
}
