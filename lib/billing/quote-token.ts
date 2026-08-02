import { createHash, randomBytes } from "crypto";

export function generateQuotePublicToken() {
  return randomBytes(32).toString("base64url");
}

export function hashQuotePublicToken(token: string) {
  const normalized = token.trim();
  if (normalized.length < 32) throw new Error("Jeton public de devis invalide.");
  return createHash("sha256").update(normalized).digest("hex");
}

export function buildPublicQuoteUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.corsaimanager.com";
  return `${baseUrl.replace(/\/$/, "")}/devis/${encodeURIComponent(token)}`;
}
