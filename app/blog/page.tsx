import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { getPublishedPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog IA pour PME",
  description:
    "Conseils pratiques sur l'intelligence artificielle, l'automatisation, les CRM IA et les applications métier pour PME partout en France.",
  alternates: {
    canonical: "https://corsaimanager.com/blog",
  },
};

export default function BlogPage() {
  const posts = getPublishedPosts();

  return (
    <div className="relative overflow-hidden pb-24">
      <Container>
        <section className="pt-16 sm:pt-20">
          <Pill>Blog CorsaiManager</Pill>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            Articles IA, automatisation et applications métier pour PME
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Des contenus éditoriaux validés humainement avant publication. Les brouillons restent
            invisibles tant qu&apos;ils ne sont pas déplacés dans le dossier de publication.
          </p>
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
