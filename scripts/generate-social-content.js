/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = process.cwd();
const socialRoot = path.join(projectRoot, "content", "social");
const socialDirs = {
  linkedin: path.join(socialRoot, "linkedin"),
  facebook: path.join(socialRoot, "facebook"),
  instagram: path.join(socialRoot, "instagram"),
};

function generateSocialContentForArticle(articlePath) {
  const absoluteArticlePath = path.isAbsolute(articlePath)
    ? articlePath
    : path.join(projectRoot, articlePath);

  if (!fs.existsSync(absoluteArticlePath)) {
    throw new Error(`Article introuvable : ${absoluteArticlePath}`);
  }

  const raw = fs.readFileSync(absoluteArticlePath, "utf8");
  const article = parseArticle(raw);

  for (const directory of Object.values(socialDirs)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const linkedin = buildLinkedInPost(article);
  const facebook = buildFacebookPost(article);
  const instagram = buildInstagramCarousel(article);
  const linkedinPath = path.join(socialDirs.linkedin, `${article.frontmatter.slug}.md`);
  const facebookPath = path.join(socialDirs.facebook, `${article.frontmatter.slug}.md`);
  const instagramPath = path.join(socialDirs.instagram, `${article.frontmatter.slug}.json`);

  fs.writeFileSync(linkedinPath, linkedin, "utf8");
  fs.writeFileSync(facebookPath, facebook, "utf8");
  fs.writeFileSync(
    instagramPath,
    `${JSON.stringify(instagram, null, 2)}\n`,
    "utf8"
  );

  return {
    outputDir: socialRoot,
    files: [linkedinPath, facebookPath, instagramPath],
  };
}

function parseArticle(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    throw new Error("Frontmatter article manquant.");
  }

  const frontmatter = parseFrontmatter(match[1]);
  const content = match[2].trim();
  const headings = extractHeadings(content);
  const plainText = toPlainText(content);
  const insights = buildInsights(headings, plainText);

  return {
    frontmatter,
    content,
    headings,
    insights,
    plainText,
    url: `https://corsaimanager.com/blog/${frontmatter.slug}`,
  };
}

function parseFrontmatter(frontmatterRaw) {
  const entries = new Map();

  for (const line of frontmatterRaw.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    entries.set(key, trimQuotes(value));
  }

  return {
    title: requireFrontmatter(entries, "title"),
    description: requireFrontmatter(entries, "description"),
    category: requireFrontmatter(entries, "category"),
    slug: requireFrontmatter(entries, "slug"),
    tags: parseTags(entries.get("tags") || ""),
  };
}

function requireFrontmatter(entries, key) {
  const value = entries.get(key);

  if (!value) {
    throw new Error(`Champ frontmatter manquant : ${key}`);
  }

  return value;
}

function trimQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function parseTags(value) {
  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((tag) => trimQuotes(tag.trim()))
    .filter(Boolean);
}

function extractHeadings(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.match(/^#{2,3}\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean);
}

function toPlainText(content) {
  return content
    .replace(/^#.*$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[`>#*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildInsights(headings, plainText) {
  const fallbackSentences = plainText
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 50)
    .slice(0, 5);

  const headingInsights = headings
    .filter((heading) => !/^faq$/i.test(heading) && !/^cta/i.test(heading))
    .slice(0, 5);

  return [...headingInsights, ...fallbackSentences].slice(0, 5);
}

function buildLinkedInPost(article) {
  const title = cleanTitle(article.frontmatter.title);
  const insights = article.insights.slice(0, 4);
  const hashtags = buildHashtags(article.frontmatter.tags, ["IA", "PME", "Corse"]);
  const draft = [
    `Nouvel article CorsaiManager : ${title}`,
    "",
    article.frontmatter.description,
    "",
    "Ce sujet concerne beaucoup de dirigeants de PME : comment utiliser l'intelligence artificielle de manière concrète, sans perdre le contrôle humain ni complexifier l'organisation.",
    "",
    "Dans l'article, on voit notamment :",
    ...insights.map((insight) => `• ${insight}`),
    "",
    "L'objectif est simple : partir d'un cas d'usage utile, tester sur un périmètre court, mesurer les gains, puis automatiser progressivement.",
    "",
    `Lire l'article : ${article.url}`,
    "",
    hashtags,
  ].join("\n");

  return ensureLinkedInLength(draft, article);
}

function ensureLinkedInLength(draft, article) {
  if (draft.length >= 1000 && draft.length <= 1500) {
    return draft;
  }

  const additions = [
    "Pour une entreprise corse, cette approche progressive est souvent la plus réaliste : elle respecte les outils existants, les habitudes d'équipe et la relation client locale.",
    "CorsaiManager privilégie des solutions utiles au quotidien : CRM intelligent, automatisation commerciale, assistant IA, application métier ou workflow connecté.",
    "Le bon point de départ n'est pas la technologie, mais la tâche qui ralentit vraiment l'activité chaque semaine.",
  ];

  let expanded = draft;

  for (const addition of additions) {
    if (expanded.length >= 1000) {
      break;
    }

    expanded = expanded.replace(`Lire l'article : ${article.url}`, `${addition}\n\nLire l'article : ${article.url}`);
  }

  if (expanded.length <= 1500) {
    return expanded;
  }

  return `${expanded.slice(0, 1450).trim()}\n\n${article.url}`;
}

function buildFacebookPost(article) {
  const title = cleanTitle(article.frontmatter.title);
  const insights = article.insights.slice(0, 3);

  return [
    `${title}`,
    "",
    article.frontmatter.description,
    "",
    "À retenir :",
    ...insights.map((insight) => `- ${insight}`),
    "",
    "Un contenu pensé pour les PME qui veulent avancer simplement avec l'IA, l'automatisation et des outils métier utiles.",
    "",
    `Lire l'article : ${article.url}`,
  ].join("\n");
}

function buildInstagramCarousel(article) {
  const title = cleanTitle(article.frontmatter.title);
  const insights = article.insights.slice(0, 5);

  return {
    title,
    source: article.url,
    slides: [
      {
        slide: 1,
        title,
        text: "Un guide simple pour transformer un sujet IA en action concrète dans une PME.",
      },
      ...insights.map((insight, index) => ({
        slide: index + 2,
        title: `Point clé ${index + 1}`,
        text: insight,
      })),
    ].slice(0, 6),
  };
}

function cleanTitle(title) {
  return title.replace(/\s+\|\s+CorsaiManager$/, "");
}

function buildHashtags(tags, fallbackTags) {
  const uniqueTags = [...new Set([...tags, ...fallbackTags])]
    .map((tag) => tag.replace(/[^a-zA-Z0-9À-ÿ]/g, ""))
    .filter(Boolean)
    .slice(0, 6);

  return uniqueTags.map((tag) => `#${tag}`).join(" ");
}

if (require.main === module) {
  const articlePath = process.argv[2];

  if (!articlePath) {
    console.error("Usage: node scripts/generate-social-content.js content/blog/published/article.md");
    process.exit(1);
  }

  try {
    const result = generateSocialContentForArticle(articlePath);
    console.log(`Contenus sociaux générés : ${result.outputDir}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

module.exports = {
  generateSocialContentForArticle,
};
