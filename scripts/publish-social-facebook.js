/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const GRAPH_API_VERSION = "v21.0";

async function publishFacebookPost(slug) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    console.log(
      "FACEBOOK_PAGE_ID ou FACEBOOK_PAGE_ACCESS_TOKEN absent : publication Facebook ignorée."
    );
    return { skipped: true };
  }

  const filePath = path.join(process.cwd(), "content", "social", "facebook", `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    console.error(`Contenu Facebook introuvable pour la publication : ${filePath}`);
    return { skipped: true };
  }

  const message = fs.readFileSync(filePath, "utf8").trim();

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: accessToken }),
    }
  );

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      `Publication Facebook échouée : ${response.status} ${JSON.stringify(body)}`
    );
  }

  console.log(`Publié sur Facebook, post id : ${body?.id ?? "inconnu"}`);
  return { skipped: false, postId: body?.id };
}

module.exports = { publishFacebookPost };
