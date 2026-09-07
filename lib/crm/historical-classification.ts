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
