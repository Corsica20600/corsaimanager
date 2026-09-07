import { createHash } from "node:crypto";
import { executeAtomic, type AtomicExecutor } from "./atomic-import";
import { CrmInputError, optionalText } from "./internal-api";
import { parseContactEvent } from "./contact-event-contract";

export async function recordContactEvent(data: Record<string,unknown>, execute: AtomicExecutor = executeAtomic) {
  // Keep the deployed v0 request readable; all new writes use the strict v1 contract.
  let metadata: Record<string, unknown> = {};
  if (data.version !== undefined) {
    try {
      const event = parseContactEvent(data);
      metadata = event.metadata;
      data = { sourceSystem: event.sourceSystem, tenant: event.tenant, eventId: event.sourceEventId, prospectId: event.crmProspectId, sourceEntityId: event.sourceEntityId, kind: event.kind, occurredAt: event.occurredAt, reason: event.metadata.reason };
    } catch { throw new CrmInputError("Contrat événement invalide."); }
  }
  const eventId=optionalText(data.eventId,200);
  const sourceEntityId=optionalText(data.sourceEntityId,200);
  const rawId=data.prospectId;
  const prospectId=rawId===undefined ? null : String(rawId);
  if (prospectId && !/^[1-9]\d*$/.test(prospectId)) throw new CrmInputError("Identifiant prospect invalide.");
  if (data.sourceSystem!=="ai-team" || (data.tenant!==undefined && data.tenant!=="corsaimanager")) throw new CrmInputError("Source interdite.",403);
  if (!eventId || (!sourceEntityId&&!prospectId)) throw new CrmInputError("Identité événement/prospect requise.");
  const kind=optionalText(data.kind,30);
  if (!kind || !["REPLIED","BOUNCED","REJECTED","DO_NOT_CONTACT","EMAIL_SENT","EMAIL_REPLIED","EMAIL_BOUNCED","EMAIL_REJECTED","FOLLOW_UP_SENT","FOLLOW_UP_SKIPPED","PROSPECT_DORMANT"].includes(kind)) throw new CrmInputError("Type événement invalide.");
  const occurredAt=optionalText(data.occurredAt,40);
  if (!occurredAt || !Number.isFinite(Date.parse(occurredAt)) || Date.parse(occurredAt)>Date.now()+300_000) throw new CrmInputError("Date événement invalide.");
  const reason=optionalText(data.reason,500) ?? null;
  const date=new Date(occurredAt).toISOString();
  const hash=createHash("sha256").update(JSON.stringify({prospectId,sourceEntityId,kind,date,reason,...(Object.keys(metadata).length ? {metadata:{sequence:metadata.sequence,nextActionAt:metadata.nextActionAt,reason:metadata.reason}} : {})})).digest("hex");
  const results=await execute([
    {text:"SELECT pg_advisory_xact_lock(hashtext('corsaimanager:contact-events'))",values:[]},
    {text:`WITH target AS MATERIALIZED (
       SELECT id FROM crm_prospects WHERE ($1::bigint IS NULL OR id=$1)
       AND ($2::text IS NULL OR (source_system='ai-team' AND source_entity_id=$2) OR ($1::bigint IS NOT NULL AND source_entity_id IS NULL))
     ), prior AS MATERIALIZED (SELECT * FROM crm_contact_events WHERE source_system='ai-team' AND event_id=$3),
     event AS (
       INSERT INTO crm_contact_events(prospect_id,source_system,event_id,kind,occurred_at,reason,payload_hash,metadata)
       SELECT id,'ai-team',$3,$4,$5::timestamptz,$6,$7,$8::jsonb FROM target WHERE NOT EXISTS(SELECT 1 FROM prior) RETURNING *
     ), updated AS (
       UPDATE crm_prospects p SET
         do_not_contact=p.do_not_contact OR e.kind IN ('BOUNCED','REJECTED','EMAIL_BOUNCED','EMAIL_REJECTED','DO_NOT_CONTACT'),
         do_not_contact_at=CASE WHEN NOT p.do_not_contact AND e.kind IN ('BOUNCED','REJECTED','EMAIL_BOUNCED','EMAIL_REJECTED','DO_NOT_CONTACT') THEN e.occurred_at ELSE p.do_not_contact_at END,
         do_not_contact_reason=CASE WHEN NOT p.do_not_contact AND e.kind IN ('BOUNCED','REJECTED','EMAIL_BOUNCED','EMAIL_REJECTED','DO_NOT_CONTACT') THEN coalesce(e.reason,e.kind) ELSE p.do_not_contact_reason END,
         do_not_contact_source=CASE WHEN NOT p.do_not_contact AND e.kind IN ('BOUNCED','REJECTED','EMAIL_BOUNCED','EMAIL_REJECTED','DO_NOT_CONTACT') THEN 'ai-team' ELSE p.do_not_contact_source END,
         last_contacted_at=CASE WHEN e.kind IN ('EMAIL_SENT','FOLLOW_UP_SENT','REPLIED','EMAIL_REPLIED') THEN greatest(p.last_contacted_at,e.occurred_at) ELSE p.last_contacted_at END,
         replied_at=CASE WHEN e.kind IN ('REPLIED','EMAIL_REPLIED') THEN greatest(p.replied_at,e.occurred_at) ELSE p.replied_at END,
         bounced_at=CASE WHEN e.kind IN ('BOUNCED','EMAIL_BOUNCED') THEN greatest(p.bounced_at,e.occurred_at) ELSE p.bounced_at END,
         dormant_at=CASE WHEN e.kind='PROSPECT_DORMANT' THEN coalesce(p.dormant_at,e.occurred_at) ELSE p.dormant_at END,
         follow_up_count=CASE WHEN e.kind='FOLLOW_UP_SENT' THEN greatest(p.follow_up_count,coalesce((e.metadata->>'sequence')::int,1)) ELSE p.follow_up_count END,
         opportunity_suggested=p.opportunity_suggested OR (e.kind='EMAIL_REPLIED' AND coalesce(e.reason,'')='POSITIVE_REPLY_EXPLICIT'),
         commercial_state=CASE
           WHEN p.do_not_contact OR e.kind IN ('DO_NOT_CONTACT','REJECTED','EMAIL_REJECTED') THEN 'DO_NOT_CONTACT'
           WHEN p.bounced_at IS NOT NULL OR e.kind IN ('BOUNCED','EMAIL_BOUNCED') THEN 'BOUNCED'
           WHEN p.replied_at IS NOT NULL OR e.kind IN ('REPLIED','EMAIL_REPLIED') THEN 'REPLIED'
           WHEN p.dormant_at IS NOT NULL OR e.kind='PROSPECT_DORMANT' THEN 'DORMANT'
           WHEN e.kind IN ('EMAIL_SENT','FOLLOW_UP_SENT') THEN 'CONTACTED_WAITING' ELSE p.commercial_state END,
         next_action_at=CASE
           WHEN p.do_not_contact OR p.replied_at IS NOT NULL OR p.bounced_at IS NOT NULL OR p.dormant_at IS NOT NULL
             OR e.kind IN ('REPLIED','EMAIL_REPLIED','BOUNCED','EMAIL_BOUNCED','REJECTED','EMAIL_REJECTED','DO_NOT_CONTACT','PROSPECT_DORMANT','FOLLOW_UP_SKIPPED') THEN NULL
           WHEN e.kind IN ('EMAIL_SENT','FOLLOW_UP_SENT') AND (p.last_contacted_at IS NULL OR e.occurred_at>=p.last_contacted_at) THEN (e.metadata->>'nextActionAt')::timestamptz
           ELSE p.next_action_at END,
         updated_at=NOW()
       FROM event e WHERE p.id=e.prospect_id RETURNING p.id
     ) SELECT (SELECT id FROM target) AS prospect_id, EXISTS(SELECT 1 FROM prior) AS replay,
       EXISTS(SELECT 1 FROM prior WHERE payload_hash<>$7) AS conflict`,values:[prospectId,sourceEntityId??null,eventId,kind,date,reason,hash,JSON.stringify(metadata)]}
  ]);
  const result=results[1][0];
  if (result.conflict) throw new CrmInputError("Clé événement déjà utilisée avec un autre contenu.",409);
  if (!result.prospect_id) throw new CrmInputError("Prospect introuvable.",404);
  return {ok:true,prospectId:result.prospect_id,replay:result.replay};
}
