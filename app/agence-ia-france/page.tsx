/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { breadcrumbSchema, publicPageMetadata, seoImages } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Agence IA France pour PME",
  description:
    "Agence IA France pour PME : audit IA, agents IA, CRM IA, assistant téléphonique, applications métier, automatisation et accompagnement ROI.",
  path: "/agence-ia-france",
  image: seoImages.aiTeam,
});

const navLinks = [
  ["/audit-ia", "Audit IA entreprise"],
  ["/crm-ia-pme", "CRM IA PME"],
  ["/assistant-ia-telephone", "Assistant téléphonique IA"],
  ["/applications-metier", "Applications métier"],
  ["/automatisation-entreprise", "Automatisation entreprise"],
  ["/transformation-digitale-pme", "Transformation digitale PME"],
  ["/contact", "Contact"],
];

const faq = [
  ["Qu'est-ce qu'une agence IA France pour PME ?", "Une agence IA France aide les PME à identifier, concevoir et déployer des usages concrets de l'intelligence artificielle : automatisation, CRM IA, assistants, applications métier et pilotage des gains."],
  ["Pourquoi commencer par un audit IA ?", "L'audit IA évite de choisir un outil avant d'avoir identifié les vrais irritants : relances oubliées, données dispersées, appels mal qualifiés, reporting manuel ou documents répétitifs."],
  ["CorsaiManager remplace-t-il les équipes internes ?", "Non. L'objectif est d'augmenter les équipes, pas de les remplacer. Les validations humaines, les règles métier et la qualité de service restent au centre du dispositif."],
  ["Quels projets IA sont les plus rentables pour une PME ?", "Les projets les plus rentables ciblent des tâches fréquentes et mesurables : relances, qualification de leads, résumé d'appels, génération de documents, synchronisation CRM et reporting."],
  ["Un CRM IA est-il utile pour une petite équipe commerciale ?", "Oui, car il aide à prioriser les prospects, automatiser les relances, résumer les échanges et réduire les oublis même avec peu de commerciaux."],
  ["Un assistant téléphonique IA peut-il qualifier les appels ?", "Oui. Il peut poser les bonnes questions, récupérer les informations essentielles, classer la demande et envoyer un résumé exploitable à l'équipe ou au CRM."],
  ["Quand créer une application métier sur mesure ?", "Quand les tableurs, emails ou logiciels standards imposent trop de contournements et ralentissent les équipes. Une application métier centralise les données et guide le processus."],
  ["Comment mesurer le ROI d'un projet IA ?", "On mesure le temps gagné, les erreurs évitées, les relances traitées, les conversions, la qualité du suivi et la réduction des tâches manuelles."],
  ["CorsaiManager intervient-il partout en France ?", "Oui. CorsaiManager est basé en Corse et accompagne les PME partout en France avec des ateliers à distance, du développement et un suivi opérationnel."],
  ["Combien de temps faut-il pour lancer un premier projet ?", "Un premier workflow ou prototype peut souvent être cadré rapidement, puis testé sur un périmètre limité avant déploiement plus large."],
];

export default function AgenceIaFrancePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Agence IA France pour PME",
    provider: { "@type": "Organization", name: "CorsaiManager", url: "https://www.corsaimanager.com" },
    areaServed: "France",
    serviceType: "Audit IA, automatisation IA, CRM IA, assistant IA et applications métier",
    url: "https://www.corsaimanager.com/agence-ia-france",
  };
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CorsaiManager",
    url: "https://www.corsaimanager.com",
    areaServed: "France",
    address: { "@type": "PostalAddress", addressRegion: "Corse", addressCountry: "FR" },
  };
  const breadcrumb = breadcrumbSchema([{ name: "Agence IA France", path: "/agence-ia-france" }]);

  return (
    <main className="pb-24 pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, serviceSchema, organizationSchema, breadcrumb]) }} />
      <Container>
        <section className="grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Pill>Agence IA France</Pill>
            <h1 className="mt-6 max-w-5xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Agence IA France : audit, automatisation et solutions IA pour PME
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-300">
              CorsaiManager accompagne les PME françaises qui veulent passer de l'envie d'utiliser l'intelligence artificielle à des projets concrets, mesurables et utiles. Une agence IA ne doit pas vendre de la complexité : elle doit aider l'entreprise à choisir les bons cas d'usage, connecter les bons outils, sécuriser les données et mesurer les résultats.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Basé en Corse, CorsaiManager accompagne les PME partout en France avec audit IA, CRM intelligent, assistant téléphonique IA, applications métier sur mesure, automatisation commerciale et workflows connectés.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/audit-ia" className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950">
                Demander un audit IA
              </Link>
              <Link href="/contact" className="inline-flex justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100">
                Parler à CorsaiManager
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Parcours SEO national</p>
            <div className="mt-5 grid gap-3">
              {navLinks.slice(0, 6).map(([href, label]) => (
                <Link key={href} href={href} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 transition hover:border-cyan-300/40">
                  {label}
                  <ArrowRight size={15} className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <SeoSection title="Pourquoi les PME françaises investissent dans l'IA">
          <p>Les PME françaises investissent dans l'IA parce que leurs équipes doivent répondre plus vite, suivre plus de prospects, produire plus de documents, gérer plus de canaux et piloter plus de données sans forcément augmenter les effectifs. L'intelligence artificielle devient utile lorsqu'elle retire de la friction : moins de saisie manuelle, moins d'oubli, moins de temps perdu à chercher une information.</p>
          <p>Le sujet n'est pas seulement technologique. Une PME a besoin de systèmes simples : un formulaire qui crée une fiche prospect, un appel qui génère un résumé, un devis qui déclenche une relance, un email qui alimente le CRM, un tableau de bord qui montre les priorités. L'IA devient alors un outil de gestion quotidienne, pas un concept abstrait.</p>
        </SeoSection>

        <GridSection
          items={[
            ["Audit IA entreprise", "L'audit IA analyse vos tâches répétitives, vos outils et vos données pour construire une feuille de route priorisée. Il distingue les quick wins des chantiers structurants et évite de commencer par un outil mal adapté.", "/audit-ia"],
            ["CRM IA", "Un CRM IA aide à mieux suivre les prospects, prioriser les opportunités, préparer les relances, résumer les échanges et donner une vision claire du pipeline commercial.", "/crm-ia-pme"],
            ["Assistant téléphonique IA", "Un assistant téléphonique IA répond, qualifie les appels, récupère les informations importantes et transmet un résumé exploitable à l'équipe ou au CRM.", "/assistant-ia-telephone"],
            ["Applications métier sur mesure", "Une application métier sur mesure remplace les tableurs dispersés et les processus fragiles par un outil adapté à votre fonctionnement réel.", "/applications-metier"],
            ["Automatisation des processus", "Les workflows automatisent les relances, emails, documents, notifications, reportings et synchronisations entre outils existants.", "/automatisation-entreprise"],
            ["Transformation digitale PME", "La transformation digitale PME consiste à structurer les processus, les données et les outils pour rendre l'entreprise plus fiable, plus rapide et plus pilotable.", "/transformation-digitale-pme"],
          ]}
        />

        <SeoSection title="Cas clients, méthode et ROI">
          <p>Les cas clients les plus fréquents commencent par un problème simple : des prospects non relancés, des appels mal suivis, un reporting manuel, des demandes clients dispersées ou une application métier absente. CorsaiManager transforme ces irritants en projets mesurables. Le premier résultat attendu est souvent du temps gagné. Le second est une meilleure régularité commerciale. Le troisième est une visibilité plus claire pour la direction.</p>
          <p>La méthodologie CorsaiManager suit une progression : cadrage, audit, priorisation ROI, prototype, déploiement et optimisation. Chaque étape évite de surdimensionner le projet. Une PME peut commencer par un workflow, puis ajouter un CRM IA, un assistant téléphonique ou une application métier selon les gains observés.</p>
          <p>Le ROI se mesure avec des indicateurs simples : heures économisées, délais de réponse, nombre de relances effectuées, opportunités mieux suivies, erreurs évitées, taux de conversion et satisfaction des équipes. Une agence IA France utile doit rendre ces gains visibles, pas seulement livrer une interface.</p>
        </SeoSection>

        <SeoSection title="Comment choisir les bons cas d'usage IA">
          <p>Le meilleur cas d'usage IA n'est pas toujours le plus impressionnant. Pour une PME, il est souvent préférable de commencer par une action simple, fréquente et mesurable. Une relance de devis oubliée chaque semaine, un appel non qualifié, un document recopié à la main ou un reporting préparé manuellement peuvent coûter plus cher qu'un grand projet visible mais difficile à adopter.</p>
          <p>CorsaiManager classe les cas d'usage selon plusieurs critères : fréquence de la tâche, temps humain consommé, qualité des données disponibles, risque opérationnel, impact commercial et facilité de déploiement. Cette grille permet d'éviter les projets IA trop théoriques. Elle aide aussi les dirigeants à choisir un premier périmètre rassurant pour les équipes.</p>
          <p>Une agence intelligence artificielle doit savoir dire non à un mauvais périmètre. Si la donnée est absente, si le processus n'est pas clair ou si l'équipe n'a pas encore validé le besoin, il vaut mieux cadrer avant d'automatiser. L'IA fonctionne mieux lorsqu'elle s'insère dans une organisation compréhensible. C'est pourquoi l'audit IA reste la première étape la plus saine.</p>
        </SeoSection>

        <SeoSection title="Accompagnement IA entreprise : de la stratégie à l'exécution">
          <p>L'accompagnement IA entreprise ne se limite pas à recommander des outils. Il faut comprendre le métier, le cycle de vente, les contraintes de production, les habitudes des équipes et les indicateurs suivis par la direction. Une PME française n'a pas toujours besoin d'un système complexe : elle a besoin d'un dispositif qui fonctionne chaque semaine et qui peut être amélioré progressivement.</p>
          <p>CorsaiManager intervient sur la chaîne complète : audit, conception, développement, intégration, documentation et optimisation. Cette continuité est importante. Un workflow livré sans suivi peut vite devenir fragile. Une application métier sans adoption peut rester inutilisée. Un CRM IA sans méthode commerciale peut stocker de la donnée sans générer de résultat. L'accompagnement relie donc la technique à l'usage réel.</p>
          <p>Le déploiement peut commencer avec un prototype. Par exemple, un formulaire peut créer une fiche prospect, générer une réponse, planifier une relance et notifier l'équipe. Si le gain est validé, le périmètre peut s'élargir vers le CRM IA, le traitement des appels, le reporting ou une application métier complète. Cette progression limite le risque et rend la transformation plus acceptable pour les équipes.</p>
        </SeoSection>

        <SeoSection title="Automatisation IA entreprise et transformation digitale PME">
          <p>L'automatisation IA entreprise est souvent le moteur le plus rapide de la transformation digitale PME. Elle permet de relier des outils existants sans tout remplacer. Un email peut alimenter un CRM, un appel peut créer une tâche, un devis peut déclencher une relance, un document peut être généré à partir de données déjà connues et un tableau de bord peut se mettre à jour sans export manuel.</p>
          <p>Cette logique transforme le quotidien. Les équipes ne passent plus leur temps à recopier, vérifier ou chercher des informations. Elles interviennent là où l'humain reste essentiel : relation client, arbitrage, décision commerciale, qualité de service et amélioration des offres. L'IA agit comme une couche d'assistance et de régularité.</p>
          <p>Pour une PME, l'enjeu est de garder la maîtrise. Les workflows doivent être lisibles. Les validations humaines doivent être prévues pour les actions sensibles. Les données doivent rester structurées. Les résultats doivent être mesurés. C'est cette combinaison entre automatisation, contrôle et ROI qui distingue une vraie agence IA France d'une simple intégration d'outils.</p>
        </SeoSection>

        <SeoSection title="Ce qui différencie une agence IA orientée PME">
          <p>Une PME n'a pas les mêmes contraintes qu'un grand groupe. Les équipes sont plus polyvalentes, les budgets doivent être justifiés rapidement et les outils doivent produire un résultat visible sans immobiliser l'organisation pendant des mois. Une agence IA orientée PME doit donc parler le langage du terrain : prospects, devis, appels, relances, documents, production, planning, trésorerie et relation client.</p>
          <p>Cette différence change la manière de concevoir les solutions. Un CRM IA doit être simple à utiliser. Un assistant téléphonique IA doit transmettre une information claire. Une application métier doit résoudre un processus précis. Une automatisation doit fonctionner avec les outils réellement utilisés par l'entreprise, même si ces outils ne sont pas parfaits. L'objectif n'est pas de créer une architecture idéale sur le papier, mais un système robuste dans le quotidien.</p>
          <p>CorsaiManager privilégie des livrables actionnables : cartographie des irritants, priorités IA, prototypes, workflows, pages de suivi, tableaux de bord, documentation et indicateurs. Chaque livrable doit aider le dirigeant à décider et l'équipe à agir. Cette approche limite les projets trop larges et favorise des améliorations continues.</p>
        </SeoSection>

        <SeoSection title="De l'agence IA au partenaire opérationnel">
          <p>Le rôle de CorsaiManager ne s'arrête pas à la recommandation. Une PME a souvent besoin d'un partenaire capable de passer de la stratégie à l'exécution : comprendre le besoin, concevoir le workflow, développer l'application, connecter les outils, tester avec les équipes et améliorer après les premiers retours. Cette continuité réduit le risque de perte entre le conseil et la mise en production.</p>
          <p>Un accompagnement IA entreprise réussi doit aussi former les équipes. Les collaborateurs doivent comprendre ce que l'IA fait, ce qu'elle ne fait pas, quand valider une action et comment signaler un problème. Cette pédagogie est essentielle pour éviter la méfiance ou l'abandon. L'IA devient utile lorsque les utilisateurs savent comment l'intégrer dans leur routine.</p>
          <p>Enfin, le partenaire opérationnel doit suivre les résultats. Si une relance automatique ne génère pas de réponse, il faut ajuster le message ou le timing. Si un assistant téléphonique qualifie mal les demandes, il faut corriger le script. Si une application métier ralentit les utilisateurs, il faut simplifier l'interface. C'est cette boucle d'amélioration qui permet à une PME de transformer un premier projet IA en avantage durable.</p>
        </SeoSection>

        <section className="py-10">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">FAQ SEO</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faq.map(([question, answer]) => (
              <article key={question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-zinc-100">{question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Construisez votre feuille de route IA</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">Demandez un audit IA pour identifier les cas d'usage les plus rentables et prioriser les actions à lancer.</p>
          <Link href="/contact" className="mt-8 inline-flex rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950">
            Contacter CorsaiManager
          </Link>
        </section>
      </Container>
    </main>
  );
}

function SeoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-10">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">{title}</h2>
      <div className="mt-5 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-base leading-relaxed text-zinc-300">
        {children}
      </div>
    </section>
  );
}

function GridSection({ items }: { items: string[][] }) {
  return (
    <section className="py-10">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Solutions IA CorsaiManager</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(([title, text, href]) => (
          <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 transition hover:border-cyan-300/45">
            <CheckCircle2 className="text-cyan-300" size={20} />
            <h3 className="mt-4 text-xl font-semibold text-zinc-100">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
