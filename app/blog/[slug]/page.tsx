import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, CalendarDays, Tag } from "lucide-react";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { Container } from "@/components/ui/container";
import { getPublishedBlogSlugs, getPublishedPostBySlug } from "@/lib/blog";
import { breadcrumbSchema, publicPageMetadata, seoImages } from "@/lib/seo-metadata";

const serviceLinks = [
  { href: "/consultant-ia-pme", label: "Consultant IA pour PME" },
  { href: "/agents-ia", label: "Agents IA pour PME" },
  { href: "/audit-ia", label: "Audit IA" },
  { href: "/automatisation-entreprise", label: "Automatisation entreprise" },
  { href: "/crm-ia-pme", label: "CRM IA pour PME" },
  { href: "/applications-metier", label: "Applications métier" },
];

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedBlogSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    ...publicPageMetadata({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      image: seoImages.aiTeam,
      type: "article",
    }),
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.corsaimanager.com/blog/${post.slug}`,
      siteName: "CorsaiManager",
      type: "article",
      locale: "fr_FR",
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [seoImages.aiTeam],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    image: "https://www.corsaimanager.com/screens/ai-team-dashboard.png",
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "CorsaiManager",
      url: "https://www.corsaimanager.com",
    },
    mainEntityOfPage: `https://www.corsaimanager.com/blog/${post.slug}`,
  };
  const breadcrumb = breadcrumbSchema([
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  const faqJsonLd =
    post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <article className="relative overflow-hidden pb-24">
        <Container>
          <header className="pt-16 sm:pt-20">
            <Link href="/blog" className="text-sm font-medium text-cyan-200 hover:text-cyan-100">
              Blog CorsaiManager
            </Link>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              {post.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={15} />
                {formatDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={15} />
                {post.readingTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag size={15} />
                {post.category}
              </span>
            </div>
          </header>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/55 p-6 backdrop-blur sm:p-8">
              <MarkdownContent content={post.contentWithoutFaq} />

              {post.faqs.length > 0 ? (
                <section className="mt-12 border-t border-white/10 pt-10">
                  <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">FAQ</h2>
                  <div className="mt-6 space-y-3">
                    {post.faqs.map((faq) => (
                      <div key={faq.q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <h3 className="text-lg font-medium text-zinc-100">{faq.q}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="mt-12 rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-300/10 via-blue-400/10 to-cyan-200/10 p-7 text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
                  Besoin d&apos;appliquer ce sujet à votre entreprise ?
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
                  CorsaiManager peut vous aider à cadrer un cas d&apos;usage IA, automatiser un processus
                  ou créer une application métier adaptée.
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
                >
                  Contacter CorsaiManager
                  <ArrowRight size={15} />
                </Link>
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-32">
              {post.tableOfContents.length > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-200">
                    Sommaire
                  </h2>
                  <nav className="mt-4 space-y-2">
                    {post.tableOfContents.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm leading-relaxed text-zinc-400 transition hover:text-cyan-200 ${
                          heading.level === 3 ? "pl-4" : ""
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-200">
                  Pages services
                </h2>
                <div className="mt-4 space-y-2">
                  {serviceLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-300 transition hover:border-cyan-300/40 hover:text-cyan-200"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </article>
    </>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
