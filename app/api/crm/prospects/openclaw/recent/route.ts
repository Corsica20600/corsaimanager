import { NextResponse, type NextRequest } from "next/server";
import { getRecentOpenClawProspects } from "@/lib/crm/repository";

export async function GET(request: NextRequest) {
  const expectedKey = process.env.OPENCLAW_AGENT_API_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: "OPENCLAW_AGENT_API_KEY non configurée côté serveur." }, { status: 500 });
  }

  if (!hasValidAgentKey(request, expectedKey)) {
    return NextResponse.json({ error: "Clé API OpenClaw invalide ou manquante." }, { status: 401 });
  }

  const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "25", 10);
  const prospects = await getRecentOpenClawProspects(Number.isFinite(limit) ? limit : 25);
  return NextResponse.json({ prospects });
}

function hasValidAgentKey(request: NextRequest, expectedKey: string) {
  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
  const legacyHeader = request.headers.get("x-api-key") ?? request.headers.get("x-openclaw-agent-key") ?? "";
  return constantTimeEqual(bearer, expectedKey) || constantTimeEqual(legacyHeader.trim(), expectedKey);
}

function constantTimeEqual(value: string, expected: string) {
  if (!value || value.length !== expected.length) return false;
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result |= value.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return result === 0;
}
