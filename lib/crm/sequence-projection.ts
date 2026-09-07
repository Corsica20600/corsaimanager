import {createHash} from 'node:crypto';
import type {AtomicExecutor} from './atomic-import';
import type {ContactEvent} from './contact-event-contract';
import {CrmInputError} from './internal-api';

/** Atomic CRM projection/legacy neutralisation; never sends or schedules email. */
export async function projectCommercialSequence(e:ContactEvent,execute:AtomicExecutor) {
 if(!e.crmProspectId||Date.parse(e.occurredAt)>Date.now()+300000)throw new CrmInputError('SEQUENCE_EVENT_INVALID',400);
 const hash=createHash('sha256').update(JSON.stringify({...e,occurredAt:new Date(e.occurredAt).toISOString(),metadata:Object.fromEntries(Object.entries(e.metadata).sort(([a],[b])=>a.localeCompare(b)))})).digest('hex');
 const m=e.metadata;
 const rows=await execute([
  {text:"SELECT set_config('statement_timeout','4000',true),set_config('lock_timeout','2000',true)",values:[]},
  {text:"SELECT pg_advisory_xact_lock(hashtext('corsaimanager:contact-events'))",values:[]},
  {text:'SELECT id FROM crm_prospects WHERE id=$1 FOR UPDATE',values:[e.crmProspectId]},
  {text:`WITH prior AS MATERIALIZED (SELECT * FROM crm_sequence_events WHERE source_system='ai-team' AND event_id=$1),
    eligible AS MATERIALIZED (SELECT p.id FROM crm_prospects p JOIN crm_rehabilitation_jobs j ON j.prospect_id=p.id
      WHERE p.id=$2 AND p.source_system='ai-team' AND p.source_entity_id=$3 AND p.updated_at::text=$4
       AND p.commercial_state='ACTIVE_ELIGIBLE' AND NOT p.do_not_contact AND p.replied_at IS NULL AND p.bounced_at IS NULL
       AND p.dormant_at IS NULL AND p.archived_at IS NULL AND p.status NOT IN ('client','perdu') AND NOT p.opportunity_suggested
       AND NOT EXISTS(SELECT 1 FROM crm_commercial_state cs WHERE cs.prospect_id=p.id AND cs.sequence_version>=($8::jsonb->>'generation')::int)
       AND j.applied_at IS NOT NULL AND j.application_key=$5 AND NOT EXISTS(SELECT 1 FROM prior)),
    event AS (INSERT INTO crm_sequence_events(prospect_id,source_system,event_id,kind,occurred_at,payload_hash,metadata)
      SELECT id,'ai-team',$1,'SEQUENCE_REACTIVATED',$6::timestamptz,$7,$8::jsonb FROM eligible RETURNING prospect_id),
    blocks AS (INSERT INTO crm_legacy_execution_blocks(entity_type,entity_id,prospect_id,source_event_id)
      SELECT 'EmailDraft',id,prospect_id,$1 FROM crm_email_drafts WHERE prospect_id IN(SELECT prospect_id FROM event) AND sent_at IS NULL
      UNION ALL SELECT 'FollowUpEmail',id,prospect_id,$1 FROM follow_ups WHERE prospect_id IN(SELECT prospect_id FROM event) AND sent_at IS NULL
      ON CONFLICT DO NOTHING),
    updated AS (INSERT INTO crm_commercial_state(prospect_id,state,sequence_id,sequence_version,source_system,source_event_id,occurred_at,revision,metadata)
      SELECT prospect_id,'SEQUENCE_REACTIVATED',$8::jsonb->>'sequenceId',($8::jsonb->>'generation')::int,'ai-team',$1,$6::timestamptz,$4,$8::jsonb FROM event
      ON CONFLICT(prospect_id) DO UPDATE SET state=EXCLUDED.state,sequence_id=EXCLUDED.sequence_id,sequence_version=EXCLUDED.sequence_version,
      source_event_id=EXCLUDED.source_event_id,occurred_at=EXCLUDED.occurred_at,revision=EXCLUDED.revision,metadata=EXCLUDED.metadata,follow_up_count=0,next_action_at=NULL
      RETURNING prospect_id AS id)
    SELECT (SELECT id FROM updated) AS applied_id,(SELECT prospect_id FROM prior) AS prior_id,
      EXISTS(SELECT 1 FROM prior WHERE payload_hash<>$7) AS conflict`,
    values:[e.sourceEventId,e.crmProspectId,e.sourceEntityId,m.crmRevision,m.rehabilitationKey,e.occurredAt,hash,JSON.stringify(m)]}
 ]);
 const r=rows[3][0];
 if(r.conflict)throw new CrmInputError('SEQUENCE_EVENT_CONFLICT',409);
 if(!r.applied_id&&!r.prior_id)throw new CrmInputError('SEQUENCE_RECHECK_FAILED',409);
 return {ok:true,prospectId:r.applied_id??r.prior_id,replay:!!r.prior_id};
}
