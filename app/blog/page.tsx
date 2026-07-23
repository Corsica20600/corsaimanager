import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { getPublishedPosts } from "@/lib/blog";
import { breadcrumbSchema, publicPageMetadata, seoImages } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Blog IA pour PME",
  description:
    "Conseils pratiques sur l'intelligence artificielle, l'automatisation, les agents IA, les CRM IA et les applications métier pour PME.",
  path: "/blog",
  image: seoImages.aiTeam,
});

const editorialPillars = [
  {
    title: "Répondre aux questions clients",
    text:
      "Chaque article part d'une objection ou d'une question terrain : automatisation, CRM IA, assistant téléphonique, prospection ou application métier.",
  },
  {
    title: "Relier contenu et conversion",
    text:
      "Le blog ne sert pas seulement à publier. Il doit orienter le lecteur vers un diagnostic, une page service ou une prise de contact utile.",
  },
  {
    title: "Mesurer avec Search Console",
    text:
      "Les sujets sont suivis avec les impressions, le CTR, la position moyenne et les demandes entrantes pour améliorer les prochains contenus.",
  },
];

export default function BlogPage() {
  const posts = getPublishedPosts();
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog IA CorsaiManager",
    url: "https://corsaimanager.com/blog",
    description:
      "Conseils pratiques sur l'intelligence artificielle, l'automatisation, les agents IA, les CRM IA et les applications métier pour PME.",
    publisher: { "@type": "Organization", name: "CorsaiManager", url: "https://corsaimanager.com" },
  };
  const breadcrumb = breadcrumbSchema([{ name: "Blog", path: "/blog" }]);

  return (
    <div className="relative overflow-hidden pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([blogSchema, breadcrumb]) }} />
      <Container>
        <section className="pt-16 sm:pt-20">
          <Pill>Blog CorsaiManager</Pill>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            Articles IA, automatisation et applications métier pour PME
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Des contenus éditoriaux pensés pour aider les dirigeants de PME à comprendre
            l&apos;automatisation IA, structurer leur CRM, améliorer leur prospection et choisir
            les bons cas d&apos;usage avant de lancer un projet.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {editorialPillars.map((pillar) => (
            <article key={pillar.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-lg font-semibold text-zinc-100">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{pillar.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-12">
          {posts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {formatDate(post.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen size={14} />
                      {post.readingTime}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-100">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">{post.excerpt}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
                    Lire l&apos;article
                    <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur">
              <h2 className="text-2xl font-semibold text-zinc-100">Aucun article publié pour le moment</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
                Les articles générés restent en brouillon dans `content/blog/drafts` jusqu&apos;à validation
                humaine. Pour publier un article, déplacez son fichier Markdown dans
                `content/blog/published`.
              </p>
            </div>
          )}
        </section>

        <section className="mt-14 rounded-3xl border border-cyan-300/25 bg-cyan-300/10 p-7">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Quels sujets IA lire en priorité ?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300">
            Si vous découvrez l&apos;IA en PME, commencez par les articles sur le CRM IA,
            l&apos;automatisation commerciale et les agents IA. Ils expliquent comment passer
            d&apos;une idée générale à une action mesurable, sans perdre le contrôle humain.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { href: "/agents-ia", label: "Agents IA" },
              { href: "/services", label: "Services IA" },
              { href: "/crm-ia-pme", label: "CRM IA PME" },
              { href: "/audit-ia", label: "Audit IA" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-200/60">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
