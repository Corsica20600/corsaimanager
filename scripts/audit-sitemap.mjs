import fs from "node:fs";

const requiredPaths = [
  "/",
  "/agence-ia-france",
  "/transformation-digitale-pme",
  "/audit-ia",
  "/crm-ia-pme",
  "/assistant-ia-telephone",
  "/applications-metier",
  "/automatisation-entreprise",
  "/contact",
  "/realisations",
];

const excludedPaths = [
  "/admin",
  "/api",
  "/audit-ia/success",
  "/audit-seo-ia",
];

const sitemapSource = fs.readFileSync("app/sitemap.ts", "utf8");
const seoPagesSource = fs.readFileSync("lib/seo-pages.ts", "utf8");

const staticEntries = [...sitemapSource.matchAll(/\{\s*path:\s*"([^"]+)",\s*changeFrequency:\s*"([^"]+)",\s*priority:\s*([0-9.]+)/g)]
  .map((match) => ({
    path: match[1],
    changeFrequency: match[2],
    priority: Number(match[3]),
    lastModified: true,
  }));

const seoEntries = [...seoPagesSource.matchAll(/slug:\s*"([^"]+)"/g)]
  .map((match) => ({
    path: `/${match[1]}`,
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: true,
  }));

const entriesByPath = new Map();
for (const entry of [...staticEntries, ...seoEntries]) {
  if (excludedPaths.some((excludedPath) => entry.path === excludedPath || entry.path.startsWith(`${excludedPath}/`))) continue;
  const existing = entriesByPath.get(entry.path);
  if (!existing || entry.priority > existing.priority) entriesByPath.set(entry.path, entry);
}

const entries = Array.from(entriesByPath.values());
const paths = entries.map((entry) => entry.path);
const missing = requiredPaths.filter((path) => !paths.includes(path));

console.log("Pages presentes dans le sitemap:");
for (const entry of entries) {
  console.log(`${entry.path} | priority=${entry.priority} | changeFrequency=${entry.changeFrequency} | lastModified=${entry.lastModified ? "yes" : "no"}`);
}

console.log("\nPages obligatoires absentes:");
console.log(missing.length ? missing.join("\n") : "Aucune");

console.log("\nPages exclues volontairement:");
console.log(excludedPaths.join("\n"));
