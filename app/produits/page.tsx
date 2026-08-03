import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarDays, CreditCard, Dumbbell, HeartPulse, ReceiptText, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";
import { breadcrumbSchema, publicPageMetadata, softwareApplicationSchema } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Nos produits IA et applications",
  description:
    "Découvrez les produits portés par CorsaiManager : Traknio, coach de musculation intelligent, et Sentieru, portail pour médecines douces avec espace praticien complet.",
  path: "/produits",
  image: {
    url: "/products/traknio-phone-hero.png",
    width: 1200,
    height: 900,
    alt: "Traknio, application mobile sport",
  },
});

const products = [
  {
    name: "Traknio",
    label: "Coach de musculation intelligent",
    href: "https://traknio.com",
    image: "/products/traknio-phone-hero.png",
    logo: "/products/traknio-wordmark.png",
    icon: Dumbbell,
    status: "Application sport",
    description:
      "Traknio accompagne les entraînements de musculation avec des programmes personnalisés, un suivi des performances et une logique de progression claire.",
    features: [
      "Programmes personnalisés selon le niveau et les objectifs",
      "Suivi des performances, séries, charges et progression",
      "Expérience mobile et montre connectée pour suivre l'entraînement au quotidien",
    ],
    audience: "Sportifs réguliers, coachs et salles qui veulent un suivi plus intelligent.",
    accent: "from-cyan-300/25 via-blue-400/10 to-emerald-300/15",
    visual: "watch",
  },
  {
    name: "Sentieru",
    label: "Portail pour médecines douces et espace praticien",
    href: "https://sentieru.fr",
    image: "/products/sentieru-practitioner-dashboard.png",
    secondaryImage: "/products/sentieru-home.png",
    logo: "/products/sentieru-icon.png",
    icon: HeartPulse,
    status: "Portail bien-être",
    description:
      "Sentieru référence les praticiens de médecines douces et leur donne une interface de gestion complète : profil public, agenda, patients, factures, paiements et statistiques.",
    features: [
      "Annuaire local de praticiens vérifiés et prise de rendez-vous",
      "Espace praticien avec profil, agenda, patients et historique",
      "Factures PDF, paiements en ligne, abonnement et statistiques",
    ],
    audience: "Praticiens bien-être, médecines douces, patients et structures locales en Corse.",
    accent: "from-emerald-300/20 via-amber-200/10 to-cyan-300/10",
    visual: "sentieru",
  },
];

const productSchemas = products.map((product) =>
  softwareApplicationSchema({
    name: product.name,
    description: product.description,
    path: "/produits",
    image: product.image,
  }),
);

export default function ProductsPage() {
  const breadcrumb = breadcrumbSchema([{ name: "Nos produits", path: "/produits" }]);

  return (
    <div className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, ...productSchemas]) }} />
      <SharedPageHero
        badge="Produits CorsaiManager"
        title="Nos produits : des applications utiles, conçues avec une vraie logique métier"
        description="CorsaiManager ne se limite pas à accompagner les PME : nous construisons aussi nos propres applications, avec la même exigence d'automatisation, de clarté et d'expérience terrain."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["2", "applications portées"],
            ["IA", "au service d'usages concrets"],
            ["Métier", "pensé pour gérer le quotidien"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-3xl font-semibold text-cyan-100">{value}</p>
              <p className="mt-2 text-sm text-zinc-300">{label}</p>
            </div>
          ))}
        </div>
      </SharedPageHero>

      <Container>
        <section className="mt-12 grid gap-6">
          {products.map((product, index) => (
            <article
              key={product.name}
              className={`grid gap-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${product.accent} p-6 lg:grid-cols-[0.92fr_1.08fr] lg:p-8`}
            >
              <ProductVisual product={product} reversed={index % 2 === 1} />

              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-100">
                    <product.icon size={14} />
                    {product.status}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300">
                    Produit CorsaiManager
                  </span>
                </div>

                {product.name === "Traknio" ? (
                  <Image
                    src={product.logo}
                    alt="Logo Traknio"
                    width={360}
                    height={120}
                    className="mt-7 h-auto w-56 object-contain"
                  />
                ) : (
                  <div className="mt-7 flex items-center gap-4">
                    <Image src={product.logo} alt="Icône Sentieru" width={56} height={56} className="h-14 w-14 rounded-full bg-white object-contain p-2" />
                    <h2 className="text-4xl font-semibold tracking-tight text-zinc-100">{product.name}</h2>
                  </div>
                )}

                <p className="mt-3 text-xl font-medium text-zinc-100">{product.label}</p>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300">{product.description}</p>

                <div className="mt-6 grid gap-3">
                  {product.features.map((feature) => (
                    <p key={feature} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-950/45 px-4 py-3 text-sm text-zinc-300">
                      <ShieldCheck className="mt-0.5 shrink-0 text-cyan-300" size={16} />
                      {feature}
                    </p>
                  ))}
                </div>

                <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-zinc-300">
                  <span className="font-semibold text-zinc-100">Pour qui ?</span> {product.audience}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={product.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
                  >
                    Découvrir {product.name}
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
                  >
                    Échanger sur le produit
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-14 rounded-3xl border border-white/10 bg-zinc-900/60 p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">Pourquoi cette page ?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">
              Des produits qui servent aussi de laboratoire métier
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">
              Traknio et Sentieru permettent de tester concrètement des sujets que CorsaiManager déploie ensuite pour ses clients : expérience mobile, données métier, automatisation, tableaux de bord, validation humaine et intégrations.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Usage réel", "Chaque produit répond à un usage clair : progresser en sport ou gérer une activité de praticien."],
              ["Architecture moderne", "Applications web et mobiles pensées pour évoluer avec des données et des automatisations."],
              ["IA utile", "L'IA intervient là où elle aide vraiment : personnalisation, recommandations, synthèse et suivi."],
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Sparkles className="text-cyan-300" size={20} />
                <h3 className="mt-4 text-lg font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">Vous voulez transformer une idée en produit métier ?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            On peut partir d&apos;un usage simple, cadrer le MVP, brancher les données utiles et construire une application évolutive.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/applications-metier" className="inline-flex justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950">
              Voir les applications métier
            </Link>
            <Link href="/contact" className="inline-flex justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100">
              Parler d&apos;un produit
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}

function ProductVisual({ product, reversed }: { product: (typeof products)[number]; reversed: boolean }) {
  if (product.visual === "sentieru") {
    return (
      <div className={`relative flex min-h-80 items-center justify-center rounded-3xl border border-white/10 bg-zinc-950/60 p-3 ${reversed ? "lg:order-2" : ""}`}>
        <div className="grid w-full gap-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
            <Image
              src={product.secondaryImage ?? product.image}
              alt="Accueil Sentieru, annuaire de médecines douces en Corse"
              width={1200}
              height={760}
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white">
            <Image
              src={product.image}
              alt="Espace praticien Sentieru avec profil, agenda et facturation"
              width={1200}
              height={760}
              className="h-auto w-full object-cover"
            />
            <div className="absolute left-[15.5%] top-[12%] w-[70%] rounded-md bg-[#eee8d8] px-2 py-1 sm:px-4 sm:py-2">
              <p className="truncate text-[10px] font-medium leading-tight text-[#242018] sm:text-sm md:text-lg">
                Bonjour Claire Martin · Cabinet Harmonie
              </p>
              <p className="mt-0.5 truncate text-[7px] leading-tight text-[#3b3328] sm:text-[10px] md:text-xs">
                Sophrologie, Massage bien-être · Bastia
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 text-[11px] text-zinc-300">
            {[
              [CalendarDays, "Agenda"],
              [Users, "Patients"],
              [ReceiptText, "Factures"],
              [CreditCard, "Paiements"],
              [BarChart3, "Stats"],
            ].map(([Icon, label]) => (
              <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <Icon className="mx-auto text-emerald-200" size={18} />
                <p className="mt-2">{label as string}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex min-h-80 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/45 p-6 ${reversed ? "lg:order-2" : ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.18),transparent_38%),radial-gradient(circle_at_52%_72%,rgba(129,140,248,0.18),transparent_34%)]" />
      <Image
        src={product.image}
        alt="Traknio sur téléphone mobile avec interface sport"
        width={900}
        height={900}
        className="relative max-h-[520px] w-auto object-contain drop-shadow-[0_0_40px_rgba(34,211,238,0.2)]"
        priority
      />
    </div>
  );
}
