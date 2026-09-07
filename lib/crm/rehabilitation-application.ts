import { executeAtomic, type AtomicExecutor } from './atomic-import';
import { CrmInputError } from './internal-api';
import {activeRehabilitationPatch,parseActiveAuthorization} from './rehabilitation-active';

export function parseRehabilitationApplication(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CrmInputError('Contrat invalide.');
  const p = input as Record<string, unknown>;
  if (Object.keys(p).some(k => !['version','kind','tenant','crmProspectId','proposalKey','authorization'].includes(k))
    || p.version !== 1 || p.kind !== 'REHABILITATION_APPLY' || p.tenant !== 'corsaimanager'
    || typeof p.crmProspectId !== 'string' || !/^[1-9][0-9]{0,17}$/.test(p.crmProspectId)
    || typeof p.proposalKey !== 'string' || !/^[a-zA-Z0-9:_-]{1,200}$/.test(p.proposalKey)) throw new CrmInputError('Contrat de réhabilitation invalide.');
  return { version: 1 as const, kind: 'REHABILITATION_APPLY' as const, tenant: 'corsaimanager' as const,
    crmProspectId: p.crmProspectId, proposalKey: p.proposalKey,authorization:parseActiveAuthorization(p.authorization) };
}

/** Applies only a persisted, revision-bound proposal. The caller cannot submit arbitrary fields.
 * ACTIVE_ELIGIBLE changes commercial data only, never creates or authorizes an email. */
export async function applyRehabilitation(input: unknown, execute: AtomicExecutor = executeAtomic) {
  const p = parseRehabilitationApplication(input);
  const snapshot=(await execute([{text:`SELECT to_jsonb(p)::text AS prospect_snapshot,j.result::text AS proposal_snapshot,
    j.applied_at,j.application_key,j.application_result,j.state,
    EXISTS(SELECT 1 FROM crm_prospects other WHERE other.id<>p.id AND other.source_system='ai-team'
      AND other.source_entity_id=j.result->>'itemId') AS identity_conflict
    FROM crm_prospects p JOIN crm_rehabilitation_jobs j ON j.prospect_id=p.id WHERE p.id=$1`,values:[p.crmProspectId]}]))[0][0];
  if(!snapshot)throw new CrmInputError('REHABILITATION_PROPOSAL_NOT_FOUND',409);
  if(snapshot.applied_at&&snapshot.application_key===p.proposalKey)return {ok:true,...snapshot.application_result as Record<string,unknown>,replay:true};
  const crm=JSON.parse(String(snapshot.prospect_snapshot)) as Record<string,unknown>;
  const proposal=JSON.parse(String(snapshot.proposal_snapshot)) as Record<string,unknown>;
  if(snapshot.state!=='COMPLETED'||!proposal||proposal.proposalKey!==p.proposalKey)throw new CrmInputError('REHABILITATION_PROPOSAL_NOT_READY',409);
  let patch:Record<string,unknown>={commercial_state:'DORMANT'};
  let reason:string|null=null;
  if(crm.status==='client')reason='REHABILITATION_CLIENT';
  else if(crm.do_not_contact)reason='REHABILITATION_DO_NOT_CONTACT';
  else if(crm.bounced_at)reason='REHABILITATION_BOUNCED';
  else if(crm.replied_at)reason='REHABILITATION_REPLIED';
  else if(crm.opportunity_suggested)reason='REHABILITATION_ACTIVE_OPPORTUNITY';
  else if(crm.archived_at||crm.status==='perdu'||crm.dormant_at)reason='REHABILITATION_CLOSED';
  else if(snapshot.identity_conflict)reason='REHABILITATION_IDENTITY_CONFLICT';
  if(!reason&&proposal.decision==='ACTIVE_ELIGIBLE') {
    try {patch=activeRehabilitationPatch({...crm,id:p.crmProspectId},proposal,p.authorization);}
    catch(e){if(e instanceof CrmInputError)reason=e.message;else throw e;}
  } else if(!reason&&!['DORMANT_NO_RELIABLE_EMAIL','DORMANT_LOW_VALUE'].includes(String(proposal.decision)))reason='REHABILITATION_DECISION_INVALID';
  if(reason) {
    await execute([{text:`UPDATE crm_rehabilitation_jobs SET application_result=jsonb_build_object('status','REFUSED','reason',$3::text),updated_at=now()
      WHERE prospect_id=$1 AND applied_at IS NULL AND result::text=$2`,values:[p.crmProspectId,snapshot.proposal_snapshot,reason]}]);
    throw new CrmInputError(reason,409);
  }
  const rows = await execute([
    { text: "SELECT set_config('statement_timeout','4000',true),set_config('lock_timeout','2000',true)", values: [] },
    { text: "SELECT pg_advisory_xact_lock(hashtextextended('crm-rehabilitation:'||$1,0))", values: [p.crmProspectId] },
    // Lock both rows: contact events and manual CRM updates must serialize with this decision.
    { text: 'SELECT p.id FROM crm_prospects p JOIN crm_rehabilitation_jobs j ON j.prospect_id=p.id WHERE p.id=$1 FOR UPDATE OF p,j', values: [p.crmProspectId] },
    { text: `WITH eligible AS MATERIALIZED (
        SELECT p.id,j.result FROM crm_prospects p JOIN crm_rehabilitation_jobs j ON j.prospect_id=p.id
        WHERE p.id=$1 AND j.state='COMPLETED' AND j.applied_at IS NULL
          AND j.result->>'proposalKey'=$2 AND j.result->>'expectedRevision'=p.updated_at::text
          AND to_jsonb(p)::text=$3 AND j.result::text=$4
          AND NOT p.do_not_contact AND p.status NOT IN ('client','perdu') AND p.archived_at IS NULL
          AND p.replied_at IS NULL AND p.bounced_at IS NULL AND p.dormant_at IS NULL
          AND j.result->>'decision' IN ('DORMANT_NO_RELIABLE_EMAIL','DORMANT_LOW_VALUE','ACTIVE_ELIGIBLE')
      ), applied AS (
        UPDATE crm_prospects p SET commercial_state=$5::jsonb->>'commercial_state',
          dormant_at=CASE WHEN $5::jsonb->>'commercial_state'='DORMANT' THEN now() ELSE p.dormant_at END,
          next_action_at=CASE WHEN $5::jsonb->>'commercial_state'='DORMANT' THEN NULL ELSE p.next_action_at END,
          next_follow_up_at=CASE WHEN $5::jsonb->>'commercial_state'='DORMANT' THEN NULL ELSE p.next_follow_up_at END,
          email=coalesce($5::jsonb->>'email',p.email),phone=coalesce($5::jsonb->>'phone',p.phone),
          address_line1=coalesce($5::jsonb->>'address_line1',p.address_line1),postal_code=coalesce($5::jsonb->>'postal_code',p.postal_code),
          city=coalesce($5::jsonb->>'city',p.city),region=coalesce($5::jsonb->>'region',p.region),country=coalesce($5::jsonb->>'country',p.country),
          quality_score=coalesce(($5::jsonb->>'quality_score')::int,p.quality_score),commercial_score=coalesce(($5::jsonb->>'commercial_score')::int,p.commercial_score),
          source_system=coalesce($5::jsonb->>'source_system',p.source_system),source_entity_id=coalesce($5::jsonb->>'source_entity_id',p.source_entity_id),
          provenance=coalesce($5::jsonb->'provenance',p.provenance),origin_metadata=coalesce($5::jsonb->'origin_metadata',p.origin_metadata),updated_at=now()
        FROM eligible e WHERE p.id=e.id RETURNING p.id
      ), receipt AS (
        UPDATE crm_rehabilitation_jobs j SET applied_at=now(),application_key=$2,
          application_result=jsonb_build_object('status','APPLIED','decision',j.result->>'decision','prospectId',j.prospect_id::text)
        FROM applied a WHERE j.prospect_id=a.id RETURNING application_result
      ) SELECT application_result,false AS replay FROM receipt
      UNION ALL SELECT application_result,true AS replay FROM crm_rehabilitation_jobs
        WHERE prospect_id=$1 AND application_key=$2 AND applied_at IS NOT NULL`, values: [p.crmProspectId,p.proposalKey,snapshot.prospect_snapshot,snapshot.proposal_snapshot,JSON.stringify(patch)] },
  ]);
  const receipt=rows[3][0];
  if (!receipt) {
    await execute([{text:`UPDATE crm_rehabilitation_jobs SET state='RETRY',next_attempt_at=now()+interval '5 minutes',
      application_result=jsonb_build_object('status','STALE','reason','REHABILITATION_REVISION_CHANGED','retryable',true),updated_at=now()
      WHERE prospect_id=$1 AND applied_at IS NULL AND result::text=$2`,values:[p.crmProspectId,snapshot.proposal_snapshot]}]);
    throw new CrmInputError('REHABILITATION_REVISION_CHANGED',409);
  }
  return { ok: true, ...receipt.application_result as Record<string, unknown>, replay: receipt.replay === true };
}
