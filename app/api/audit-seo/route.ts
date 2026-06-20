import { NextResponse } from "next/server";
import {
  assertCorsaiManagerUrl,
  createSeoAudit,
  fetchPageHtml,
  type ImprovedSeo,
  type SeoFinding,
  type SeoRecommendation,
} from "@/lib/seo/analyzeSeo";
import { buildSeoAuditPrompt } from "@/lib/seo/prompts";

type AiSeoPayload = {
  findings?: SeoFinding[];
  recommendations?: SeoRecommendation[];
  improvedSeo?: ImprovedSeo;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string") {
      return NextResponse.json({ error: "URL manquante." }, { status: 400 });
    }

    const url = assertCorsaiManagerUrl(body.url);
    const html = await fetchPageHtml(url);
    const baseAudit = createSeoAudit(url, html);
    const aiPayload = await generateAiRecommendations(baseAudit);

    const result = {
      url: baseAudit.url,
      globalScore: baseAudit.globalScore,
      scores: baseAudit.scores,
      findings: aiPayload?.findings?.length ? aiPayload.findings : baseAudit.findings,
      recommendations: aiPayload?.recommendations?.length ? aiPayload.recommendations : baseAudit.recommendations,
      improvedSeo: aiPayload?.improvedSeo ?? baseAudit.improvedSeo,
    };

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue pendant l'audit SEO.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function generateAiRecommendations(baseAudit: ReturnType<typeof createSeoAudit>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SEO_AUDIT_MODEL ?? "gpt-4o-mini",
        temperature: 0.25,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Tu reponds uniquement en JSON valide. Tu es direct, precis et specialise en SEO interne pour corsaimanager.com, avec un positionnement France entière pour PME françaises.",
          },
          { role: "user", content: buildSeoAuditPrompt(baseAudit) },
        ],
      }),
      signal: AbortSignal.timeout(18000),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;

    return sanitizeAiPayload(JSON.parse(content) as AiSeoPayload);
  } catch {
    return null;
  }
}

function sanitizeAiPayload(payload: AiSeoPayload): AiSeoPayload {
  return {
    findings: Array.isArray(payload.findings) ? payload.findings.slice(0, 7) : undefined,
    recommendations: Array.isArray(payload.recommendations) ? payload.recommendations.slice(0, 6) : undefined,
    improvedSeo:
      payload.improvedSeo &&
      typeof payload.improvedSeo.title === "string" &&
      typeof payload.improvedSeo.metaDescription === "string" &&
      typeof payload.improvedSeo.h1 === "string" &&
      Array.isArray(payload.improvedSeo.h2Plan)
        ? {
            title: payload.improvedSeo.title,
            metaDescription: payload.improvedSeo.metaDescription,
            h1: payload.improvedSeo.h1,
            h2Plan: payload.improvedSeo.h2Plan.filter((item) => typeof item === "string").slice(0, 6),
          }
        : undefined,
  };
}
