import { NextResponse, type NextRequest } from "next/server";
import { importOpenClawProspect } from "@/lib/crm/repository";
import type { OpenClawProspectInput } from "@/lib/crm/types";

type OpenClawPayload = {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  region?: string;
  department?: string;
  city?: string;
  sector?: string;
  source?: string;
  ai_score?: number;
  audit_summary?: string;
  audit_recommendations?: string[] | null;
  suggested_email_subject?: string;
  suggested_email_body?: string;
};

const maxPayloadBytes = 50_000;

export async function POST(request: NextRequest) {
  const expectedKey = process.env.OPENCLAW_AGENT_API_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: "OPENCLAW_AGENT_API_KEY non configurée côté serveur." }, { status: 500 });
  }

  if (!hasValidAgentKey(request, expectedKey)) {
    return NextResponse.json({ error: "Clé API OpenClaw invalide ou manquante." }, { status: 401 });
  }

  let payload: OpenClawPayload;
  try {
    const rawPayload = await request.text();
    if (rawPayload.length > maxPayloadBytes) {
      return NextResponse.json({ error: "Payload trop volumineux." }, { status: 413 });
    }
    payload = JSON.parse(rawPayload) as OpenClawPayload;
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide." }, { status: 400 });
  }

  const input = mapPayload(payload);
  if (!input.companyName.trim()) {
    return NextResponse.json({ error: "company_name est obligatoire." }, { status: 400 });
  }

  try {
    const result = await importOpenClawProspect(input);
    if (result.status === "duplicate") {
      return NextResponse.json(
        {
          duplicate: true,
          status: "existing",
          message: "Prospect déjà présent par email ou website.",
          prospect_id: result.prospect.id,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        duplicate: false,
        status: "created",
        prospect_id: result.prospect.id,
        action_id: result.action?.id ?? null,
        draft_id: result.draft?.id ?? null,
        audit_id: result.audit?.id ?? null,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import OpenClaw impossible." },
      { status: 400 },
    );
  }
}

function hasValidAgentKey(request: NextRequest, expectedKey: string) {
  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
  return constantTimeEqual(bearer, expectedKey);
}

function constantTimeEqual(value: string, expected: string) {
  if (!value || value.length !== expected.length) return false;
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result |= value.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return result === 0;
}

function mapPayload(payload: OpenClawPayload): OpenClawProspectInput {
  return {
    companyName: sanitizeText(payload.company_name),
    contactName: stringOrUndefined(payload.contact_name),
    email: stringOrUndefined(payload.email),
    phone: stringOrUndefined(payload.phone),
    website: stringOrUndefined(payload.website),
    country: stringOrUndefined(payload.country) ?? "France",
    region: stringOrUndefined(payload.region),
    department: stringOrUndefined(payload.department),
    city: stringOrUndefined(payload.city),
    sector: stringOrUndefined(payload.sector),
    source: "openclaw",
    aiScore: Number.isFinite(payload.ai_score) ? Math.max(0, Math.min(100, Math.round(payload.ai_score ?? 0))) : 0,
    auditSummary: stringOrUndefined(payload.audit_summary),
    auditRecommendations: Array.isArray(payload.audit_recommendations)
      ? payload.audit_recommendations.map(sanitizeText).filter(Boolean).slice(0, 20)
      : [],
    suggestedEmailSubject: stringOrUndefined(payload.suggested_email_subject),
    suggestedEmailBody: stringOrUndefined(payload.suggested_email_body),
  };
}

function stringOrUndefined(value: unknown) {
  const text = sanitizeText(value);
  return text || undefined;
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.replace(/\u0000/g, "").trim().slice(0, 10_000) : "";
}
