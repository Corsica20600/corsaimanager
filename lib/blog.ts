import fs from "node:fs";
import path from "node:path";

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  slug: string;
};

export type BlogHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type BlogFaq = {
  q: string;
  a: string;
};

export type BlogPost = BlogFrontmatter & {
  content: string;
  contentWithoutFaq: string;
  excerpt: string;
  faqs: BlogFaq[];
  readingTime: string;
  tableOfContents: BlogHeading[];
};

const blogRoot = path.join(process.cwd(), "content", "blog");
const publishedDir = path.join(blogRoot, "published");

export function getPublishedPosts(): BlogPost[] {
  return getMarkdownFiles(publishedDir)
    .map((filePath) => readBlogPost(filePath))
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
}

export function getPublishedPostBySlug(slug: string): BlogPost | undefined {
  return getPublishedPosts().find((post) => post.slug === slug);
}

export function getPublishedBlogSlugs() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

function getMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => path.join(directory, fileName));
}

function readBlogPost(filePath: string): BlogPost {
  const raw = fs.readFileSync(filePath, "utf8");
  const { frontmatter, content } = parseFrontmatter(raw);
  const contentWithoutFaq = stripFaqSection(content);
  const faqs = extractFaqs(content);

  return {
    ...frontmatter,
    content,
    contentWithoutFaq,
    excerpt: frontmatter.description,
    faqs,
    readingTime: calculateReadingTime(content),
    tableOfContents: extractTableOfContents(contentWithoutFaq),
  };
}

function parseFrontmatter(raw: string): { frontmatter: BlogFrontmatter; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    throw new Error("Blog article frontmatter is missing.");
  }

  const frontmatterRaw = match[1];
  const content = match[2].trim();
  const entries = new Map<string, string>();

  for (const line of frontmatterRaw.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    entries.set(key, trimQuotes(value));
  }

  const frontmatter: BlogFrontmatter = {
    title: requireField(entries, "title"),
    description: requireField(entries, "description"),
    date: requireField(entries, "date"),
    author: requireField(entries, "author"),
    category: requireField(entries, "category"),
    tags: parseTags(requireField(entries, "tags")),
    slug: requireField(entries, "slug"),
  };

  return { frontmatter, content };
}

function requireField(entries: Map<string, string>, key: keyof BlogFrontmatter) {
  const value = entries.get(key);

  if (!value) {
    throw new Error(`Blog article frontmatter is missing "${key}".`);
  }

  return value;
}

function trimQuotes(value: string) {
  return value.replace(/^["']|["']$/g, "");
}

function parseTags(value: string) {
  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((tag) => trimQuotes(tag.trim()))
    .filter(Boolean);
}

function calculateReadingTime(content: string) {
  const words = content.match(/[\p{L}\p{N}']+/gu)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min de lecture`;
}

function extractTableOfContents(content: string): BlogHeading[] {
  return content
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);

      if (!match) {
        return null;
      }

      const text = match[2].trim();

      return {
        id: slugify(text),
        text,
        level: match[1].length as 2 | 3,
      };
    })
    .filter((heading): heading is BlogHeading => Boolean(heading));
}

function extractFaqs(content: string): BlogFaq[] {
  const faqIndex = content.search(/^## FAQ\s*$/m);

  if (faqIndex === -1) {
    return [];
  }

  const faqContent = content.slice(faqIndex);
  const sections = faqContent.split(/^###\s+/m).slice(1);

  return sections
    .map((section) => {
      const [question = "", ...answerLines] = section.trim().split(/\r?\n/);
      return {
        q: question.trim(),
        a: answerLines.join(" ").trim(),
      };
    })
    .filter((faq) => faq.q && faq.a);
}

function stripFaqSection(content: string) {
  return content.replace(/\r?\n?## FAQ[\s\S]*$/m, "").trim();
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
