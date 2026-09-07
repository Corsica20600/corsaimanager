import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export class CrmInputError extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

export function authorizeCrm(request: Request) {
  const keys = [process.env.CORSAIMANAGER_API_KEY, process.env.OPENCLAW_AGENT_API_KEY, process.env.AI_TEAM_SECRET,
    ...(process.env.CORSAIMANAGER_API_KEYS_PREVIOUS ?? "").split(",")].filter((key): key is string => Boolean(key?.trim()));
  const bearer = (request.headers.get("authorization") ?? "").replace(/^bearer\s+/i, "");
  const candidates = [bearer, request.headers.get("x-api-key"), request.headers.get("x-openclaw-agent-key"), request.headers.get("x-ai-team-secret")];
  return candidates.some(value => value && keys.some(key => {
    const a = Buffer.from(value.trim()); const b = Buffer.from(key.trim());
    return a.length === b.length && timingSafeEqual(a,b);
  }));
}

export async function readCrmJson(request: Request): Promise<Record<string, unknown>> {
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 50_000) throw new CrmInputError("Payload trop volumineux.",413);
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new CrmInputError("JSON invalide."); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new CrmInputError("Objet JSON attendu.");
  const payload = data as Record<string,unknown>;
  if (payload.tenant !== undefined && payload.tenant !== "corsaimanager") throw new CrmInputError("Tenant interdit.",403);
  return payload;
}

export function optionalText(value: unknown, max = 10000): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || value.length > max || value.includes("\u0000")) throw new CrmInputError("Champ texte invalide.");
  return value.trim() || undefined;
}
export function optionalScore(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) throw new CrmInputError("Score invalide.");
  return value;
}
export function crmError(error: unknown) {
  return NextResponse.json({ error: error instanceof CrmInputError ? error.message : "Service CRM indisponible." }, { status: error instanceof CrmInputError ? error.status : 503 });
}
