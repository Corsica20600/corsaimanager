export const CONTACT_EVENT_KINDS = ["EMAIL_SENT", "EMAIL_REPLIED", "EMAIL_BOUNCED", "EMAIL_REJECTED", "DO_NOT_CONTACT", "FOLLOW_UP_SENT", "FOLLOW_UP_SKIPPED", "PROSPECT_DORMANT"] as const;
export type ContactEventKind = typeof CONTACT_EVENT_KINDS[number];
export type ContactEvent = {
  version: 1; sourceSystem: "ai-team"; tenant: "corsaimanager";
  sourceEventId: string; idempotencyKey: string; crmProspectId?: string;
  sourceEntityId: string; occurredAt: string; kind: ContactEventKind;
  metadata: { sequence?: number; nextActionAt?: string; reason?: string };
};
export function parseContactEvent(value: unknown): ContactEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("CONTACT_EVENT_INVALID");
  const v = value as Record<string, unknown>;
  const keys = ["version", "sourceSystem", "tenant", "sourceEventId", "idempotencyKey", "crmProspectId", "sourceEntityId", "occurredAt", "kind", "metadata"];
  if (Object.keys(v).some(k => !keys.includes(k)) || v.version !== 1 || v.sourceSystem !== "ai-team" || v.tenant !== "corsaimanager") throw new Error("CONTACT_EVENT_SCOPE_INVALID");
  for (const key of ["sourceEventId", "idempotencyKey", "sourceEntityId", "occurredAt"]) if (typeof v[key] !== "string" || !(v[key] as string).trim() || (v[key] as string).length > 200) throw new Error("CONTACT_EVENT_ID_INVALID");
  if (v.idempotencyKey !== `ai-team:${v.sourceEventId}` || !CONTACT_EVENT_KINDS.includes(v.kind as ContactEventKind) || !Number.isFinite(Date.parse(v.occurredAt as string))) throw new Error("CONTACT_EVENT_INVALID");
  if (v.crmProspectId !== undefined && (typeof v.crmProspectId !== "string" || !/^[1-9]\d*$/.test(v.crmProspectId))) throw new Error("CONTACT_EVENT_REMOTE_ID_INVALID");
  const m = v.metadata as Record<string, unknown>;
  if (!m || typeof m !== "object" || Array.isArray(m) || Object.keys(m).some(k => !["sequence", "nextActionAt", "reason"].includes(k))) throw new Error("CONTACT_EVENT_METADATA_INVALID");
  if (m.sequence !== undefined && (!Number.isInteger(m.sequence) || Number(m.sequence) < 1 || Number(m.sequence) > 2)) throw new Error("CONTACT_EVENT_SEQUENCE_INVALID");
  if (v.kind === "FOLLOW_UP_SENT" && m.sequence === undefined) throw new Error("CONTACT_EVENT_SEQUENCE_REQUIRED");
  if (m.reason !== undefined && (typeof m.reason !== "string" || m.reason.length > 200)) throw new Error("CONTACT_EVENT_REASON_INVALID");
  if (m.nextActionAt !== undefined && (typeof m.nextActionAt !== "string" || !Number.isFinite(Date.parse(m.nextActionAt)))) throw new Error("CONTACT_EVENT_DATE_INVALID");
  return v as ContactEvent;
}
