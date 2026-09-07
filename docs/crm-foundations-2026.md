# CRM foundations — installation and contract

## Deployment order (not performed by this change)

1. Back up and compare the target schema with `sql/20260905-crm-foundations.sql`.
2. Apply that additive, transactional migration to CorsaiManager before deploying its code.
3. Deploy CorsaiManager, check authenticated lookup and import with isolated fixtures, then deploy AI-Team's contract update.
4. Existing administrator cookies with value `1` are intentionally invalid. Sign in again. No compatibility bypass.

The live schema comparison on 2026-09-05 confirmed that CRM IDs 155 (Cabinet Cetec) and 156 (HELIX) exist. No production backfill, DDL or record update was performed. The migration does not assign new IDs or rewrite these records. Their AI-Team identity may be attached on a subsequent reliable duplicate match, with the existing CRM ID preserved.

## Administrator sessions

32-byte random opaque token, SHA-256 digest only in `admin_sessions`, server expiry after 8 hours, revocation at logout and login rotation. Cookie: httpOnly, SameSite=Lax, Secure in Production. Existing `ADMIN_PASSWORD` remains the login credential; no additional signing secret is needed. Revoke all sessions operationally with `UPDATE admin_sessions SET revoked_at=NOW() WHERE revoked_at IS NULL`. Only run that deliberately. Database failure fails closed. Expired rows may be cleaned up separately.

## Internal authentication

Lookup, import and contact-events accept the existing `CORSAIMANAGER_API_KEY`, `OPENCLAW_AGENT_API_KEY`, `AI_TEAM_SECRET` values. Rotation overlap can use comma-separated `CORSAIMANAGER_API_KEYS_PREVIOUS`. Secrets are server-only. Authorization Bearer and existing key headers remain supported. The service belongs exclusively to CorsaiManager; a provided foreign tenant is refused.

## Import

`POST /api/crm/prospects/import-agent` remains compatible with legacy snake_case inputs.

AI-Team additionally supplies `source_system=ai-team`, `source_entity_id`, `idempotency_key`, `quality_score`, `commercial_score`, `emma_summary`, `provenance` and `origin_metadata`. Country, region/zone and sector remain separate. AI-Team uses the original source record or tenant-scoped schedule summary for geography. Missing AI-Team country stays unknown; the historical France default applies only to legacy callers.

Only provenance source, sourceUrl, sourceExternalId, observedAt and origin batchId/workflowId are accepted. No raw email body, credential or arbitrary internal metadata is accepted in these metadata fields.

Source identity and idempotency indexes provide durable uniqueness. A transaction-wide import advisory lock serializes the check/create snapshot; one data-modifying SQL statement commits prospect/action/audit/draft together. Retry returns the same `prospect_id`. Reuse of an identity/key for another import returns 409. Email/site matching remains a compatibility rule, not a domain uniqueness constraint. Ambiguous multi-establishment matching remains future work.

## Contact events and suppression

`POST /api/internal/crm/contact-events` accepts:

```json
{
  "tenant": "corsaimanager",
  "sourceSystem": "ai-team",
  "eventId": "stable-inbound-event-id",
  "prospectId": "155",
  "kind": "DO_NOT_CONTACT",
  "occurredAt": "2026-09-05T10:00:00Z",
  "reason": "Explicit refusal"
}
```

Alternatively address an attached `sourceEntityId`; when both IDs are supplied they must identify the same record. The caller must be a trusted server and use the persisted remoteId, not an email/subject heuristic. Event identity is `(source_system,event_id)`; replay with identical content is accepted, conflicting reuse returns 409. No full message body is required or logged.

REPLIED records a response without marking it a refusal. BOUNCED, REJECTED and DO_NOT_CONTACT suppress new prospecting durably. Ordinary edits, status changes and archiving cannot clear suppression. Old `perdu` values are not automatically converted. Lookup includes archived suppression records and exposes `doNotContact`, timestamp/reason, `hasReplied` and compatibility `refused`.

AI-Team's connector exposes `recordContactEvent`; routing already-ingested IMAP events to that method is intentionally not added to the SMTP/IMAP reader in this scoped change. There is no new poller, schedule or background retry. The caller must retain an unsuccessful event for replay with the same event ID. No historical events have been pushed by this change.

AI-Team policy and the actual EMAIL_SEND boundary both check suppression; local CRM prospecting and the existing lead-reminder route also block a suppressed contact. Transactional billing emails are not marketing opt-outs and are unchanged.

## Isolated PostgreSQL tests

Use a dedicated local PostgreSQL database `crm_foundations_test`, port 55439. Never set this suite to Production. Set `CRM_TEST_DATABASE_URL`; for local WSL additionally set `CRM_TEST_WSL_HOST` to its exact private address. The tests reject other database names/ports/hosts and truncate only this disposable database. Without the variable, integration tests are explicitly skipped.

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. `pg` is a dev-only dependency used by real concurrency/rollback tests. Runtime continues to use Neon SQL, with no Prisma migration or new ORM.
