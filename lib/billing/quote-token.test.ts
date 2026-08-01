import { describe, expect, it, vi } from "vitest";
import { buildPublicQuoteUrl, generateQuotePublicToken, hashQuotePublicToken } from "./quote-token";

describe("quote public token", () => {
  it("generates opaque tokens and stores only hashes", () => {
    const token = generateQuotePublicToken();
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(hashQuotePublicToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashQuotePublicToken(token)).not.toBe(token);
  });

  it("builds public URLs from the configured site URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");
    const url = buildPublicQuoteUrl("abc_123");
    expect(url).toBe("https://example.com/devis/abc_123");
    vi.unstubAllEnvs();
  });
});
