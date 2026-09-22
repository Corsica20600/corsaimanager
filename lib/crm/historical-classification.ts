export type HistoricalFacts = {
  status: string; email: string | null; createdAt: string; lastContactAt?: string | null;
  reliability?: string; replied?: boolean; bounced?: boolean; doNotContact?: boolean;
  dormant?: boolean; duplicate?: boolean; explicitTest?: boolean; identityConflict?: boolean;
};
/** Read-only decision: never infers delivery, consent, or a test record from a company name. */
export function classifyHistoricalProspect(f: HistoricalFacts, now: Date, maxAgeDays = 90) {
  const result = (category: string, reason: string, action: string) => ({ category, reason, action });
  if (f.doNotContact || f.bounced) return result('D','SUPPRESSED','KEEP_SUPPRESSION');
  if (f.status === 'client') return result('B','CLIENT','EXIT_PROSPECTING');
  if (f.replied) return result('C','REPLIED','STOP_FOLLOW_UPS');
  if (f.explicitTest) return result('I','PROVEN_TEST','PROPOSE_LOGICAL_ARCHIVE');
  if (f.identityConflict) return result('J','IDENTITY_CONFLICT','REVIEW_IDENTITY');
  if (f.duplicate) return result('G','PROBABLE_DUPLICATE','NO_AUTOMATIC_MERGE');
  if (f.dormant || f.status === 'perdu') return result('H','DORMANT_OR_CLOSED','KEEP_HISTORY');
  const date = Date.parse(f.lastContactAt ?? f.createdAt);
  if (!Number.isFinite(date) || date > +now) return result('J','UNCERTAIN_DATE','REVIEW_HISTORY');
  if (+now - date > maxAgeDays * 86400000) return result('H','STALE','PROPOSE_DORMANCY');
  if (!f.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || f.reliability === 'INVALID') return result('E','NO_VALID_EMAIL','ENRICH_ONCE_OR_DORMANT');
  if (!['VERIFIED','RELIABLE'].includes(f.reliability ?? '')) return result('F','NO_RELIABLE_EMAIL','REUSE_EVIDENCE_OR_DORMANT');
  return result('A','ACTIVE','KEEP_ACTIVE');
}

/** Display projection only: legacy dates never imply that a follow-up is executable. */
export function presentProspectStatus(input: {
  status: string;
  email?: string | null;
  nextFollowUpAt?: string | null;
  nextActionAt?: string | null;
  followUpCount?: number | null;
  commercialState?: string | null;
  rehabilitationClassification?: string | null;
  doNotContact?: boolean;
  bounced?: boolean;
  replied?: boolean;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const next = input.nextActionAt ? new Date(input.nextActionAt) : input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : null;
  const hasValidNextAction = Boolean(next && Number.isFinite(+next) && +next > +now && !input.doNotContact && !input.bounced && !input.replied && input.status !== "client");
  if (input.status === "client") return { label: "Client", nextActionAt: null };
  if (input.doNotContact || input.bounced) return { label: "Bloqué", nextActionAt: null };
  if (input.replied) return { label: "Répondu", nextActionAt: null };
  if (input.rehabilitationClassification === "ARCHIVE") return { label: "Archivé", nextActionAt: null };
  if (input.rehabilitationClassification === "BLOCKED") return { label: "Bloqué", nextActionAt: null };
  if (input.rehabilitationClassification === "DORMANT") return { label: "Dormant", nextActionAt: null };
  if (input.rehabilitationClassification === "REQUALIFY") return { label: "À requalifier", nextActionAt: null };
  if (input.status === "relance prévue" && !hasValidNextAction) return { label: "À requalifier", nextActionAt: null };
  if (!input.email) return { label: "À enrichir", nextActionAt: null };
  if (input.status === "a_enrichir") return { label: "À enrichir", nextActionAt: null };
  if (hasValidNextAction) {
    if ((input.followUpCount ?? 0) >= 2) return { label: "Dormant", nextActionAt: null };
    if ((input.followUpCount ?? 0) === 1) return { label: "Relance 2 prévue", nextActionAt: next };
    if (input.status === "contacté" || input.commercialState === "EMAIL_SENT") return { label: "Relance 1 prévue", nextActionAt: next };
    return { label: "Email prévu", nextActionAt: next };
  }
  if (input.status === "contacté") return { label: "Contacté", nextActionAt: null };
  if (input.status === "rendez-vous") return { label: "Qualifié", nextActionAt: null };
  return { label: "À qualifier", nextActionAt: null };
}

export function presentEmailReliability(input: { email?: string | null; bounced?: boolean; reliability?: string | null }) {
  if (input.bounced) return "BOUNCED" as const;
  if (!input.email?.trim()) return "MISSING" as const;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return "INVALID" as const;
  if (input.reliability === "VERIFIED" || input.reliability === "RELIABLE") return input.reliability;
  return "UNKNOWN" as const;
}

export type AddressEvidence = { sourceUrl: string; observedAt: string; official: boolean; values: Partial<Record<'address_line1'|'postal_code'|'city'|'region'|'country', string>> };
/** Proposes only absent fields. Conflicting evidence is never chosen arbitrarily. No crawl or write. */
export function proposeAddress(existing: Record<string, unknown>, evidence: AddressEvidence[]) {
  const patch: Record<string,string> = {}; const conflicts: string[] = [];
  const valid = evidence.filter(e => e.official && /^https:\/\//.test(e.sourceUrl) && Number.isFinite(Date.parse(e.observedAt)));
  for (const key of ['address_line1','postal_code','city','region','country'] as const) {
    if (existing[key]) continue;
    const values = [...new Set(valid.map(e=>e.values[key]?.trim()).filter((v):v is string=>Boolean(v)))];
    if (values.length === 1) patch[key] = values[0];
    if (values.length > 1) conflicts.push(key);
  }
  return { patch, conflicts, evidence: valid };
}
