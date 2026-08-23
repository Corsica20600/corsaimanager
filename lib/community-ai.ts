import "server-only";

type CommunitySummaryResponse = {
  data?: {
    brand: { name: string; slug: string };
    publishedThisMonth: number;
    scheduled: number;
    awaitingReview: number;
  };
  message?: string;
};

export type CommunitySummary =
  | { connected: true; publishedThisMonth: number; scheduled: number; awaitingReview: number; url: string }
  | { connected: false; reason: string; url: string };

export async function getCommunitySummary(): Promise<CommunitySummary> {
  const url = process.env.COMMUNITY_AI_URL?.trim().replace(/\/$/, "") ?? "https://community-ai-five.vercel.app";
  const apiKey = process.env.COMMUNITY_AI_API_KEY?.trim();
  if (!apiKey) return { connected: false, reason: "Clé Community AI absente.", url };

  try {
    const response = await fetch(`${url}/api/v1/community/summary?brand=corsaimanager`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    const payload = (await response.json().catch(() => ({}))) as CommunitySummaryResponse;
    if (!response.ok || !payload.data) return { connected: false, reason: payload.message || "Résumé indisponible.", url };
    return { connected: true, ...payload.data, url };
  } catch {
    return { connected: false, reason: "Community AI ne répond pas pour le moment.", url };
  }
}
