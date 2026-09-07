import {readCanonicalCommercialState} from './commercial-state-reader';
import { randomUUID } from 'node:crypto';
import { executeAtomic, type AtomicExecutor } from './atomic-import';

export const REHABILITATION_BATCH_SIZE = 5;
export const REHABILITATION_MAX_ATTEMPTS = 3;
const lock = { text: "SELECT pg_advisory_xact_lock(hashtext('corsaimanager:rehabilitation-seed'))", values: [] };

/** Control-plane storage only: no prospect mutation, email, import, or policy update.
 * Caller must be authenticated as CorsaiManager before using this repository. */
export class RehabilitationQueue {
  constructor(private readonly databaseExecute: AtomicExecutor = executeAtomic) {}
  private async execute(statements: Parameters<AtomicExecutor>[0]) {
    const rows = await this.databaseExecute([
      { text: "SELECT set_config('statement_timeout','4000',true),set_config('lock_timeout','2000',true)", values: [] },
      ...statements,
    ]);
    return rows.slice(1);
  }

  /** Bounded keyset seed. Explicit invocation; migration itself never enqueues data. */
  async seed() {
    const rows = await this.execute([lock,
      { text: "INSERT INTO crm_rehabilitation_cursor(name) VALUES ('historical-v1') ON CONFLICT DO NOTHING", values: [] },
      { text: `WITH page AS MATERIALIZED (
          SELECT p.* FROM crm_prospects p WHERE p.id > (SELECT last_id FROM crm_rehabilitation_cursor WHERE name='historical-v1')
          ORDER BY p.id LIMIT 50
        ), queued AS (
          INSERT INTO crm_rehabilitation_jobs(prospect_id)
          SELECT id FROM page WHERE archived_at IS NULL AND status NOT IN ('client','perdu')
            AND NOT do_not_contact AND replied_at IS NULL AND bounced_at IS NULL AND dormant_at IS NULL
            AND (email IS NULL OR email !~* '^[^[:space:]@]+@[^[:space:]@]+[.][a-z]{2,}$'
              OR source_system IS DISTINCT FROM 'ai-team' OR source_entity_id IS NULL
              OR provenance IS NULL OR provenance='[]'::jsonb
              OR origin_metadata->>'emailReliability' IS NULL
              OR origin_metadata->>'emailReliability' NOT IN ('VERIFIED','RELIABLE'))
          ON CONFLICT DO NOTHING RETURNING prospect_id
        ), advanced AS (
          UPDATE crm_rehabilitation_cursor SET last_id=coalesce((SELECT max(id) FROM page),last_id),updated_at=now()
          WHERE name='historical-v1' RETURNING last_id
        ) SELECT (SELECT count(*)::int FROM queued) AS queued, (SELECT count(*)::int FROM page) AS scanned,
          (SELECT last_id::text FROM advanced) AS cursor`, values: [] },
    ]);
    return rows[2][0];
  }

  /** One atomic statement, SKIP LOCKED and owner fencing; expired workers cannot commit. */
  async claim() {
    const token = randomUUID();
    const rows = await this.execute([{ text: `WITH exhausted AS (
        UPDATE crm_rehabilitation_jobs SET state='EXHAUSTED',lease_token=NULL,lease_until=NULL,updated_at=now()
        WHERE attempts>=3 AND state='RUNNING' AND lease_until<=now()
      ), candidates AS (
        SELECT prospect_id FROM crm_rehabilitation_jobs WHERE attempts<3 AND next_attempt_at<=now()
          AND (state IN ('WAITING','RETRY') OR (state='RUNNING' AND lease_until<=now()))
        ORDER BY next_attempt_at,prospect_id FOR UPDATE SKIP LOCKED LIMIT 5
      ) UPDATE crm_rehabilitation_jobs j SET state='RUNNING',attempts=j.attempts+1,
        lease_token=$1,lease_until=now()+interval '2 minutes',updated_at=now()
        FROM candidates c WHERE j.prospect_id=c.prospect_id RETURNING j.*`, values: [token] }]);
    return rows[0];
  }

  async checkpoint(prospectId: string, token: string, value: Record<string, unknown>) {
    const rows = await this.execute([{ text: `UPDATE crm_rehabilitation_jobs SET checkpoint=$3::jsonb,updated_at=now()
      WHERE prospect_id=$1 AND lease_token=$2 AND state='RUNNING' AND lease_until>now() RETURNING prospect_id`,
      values: [prospectId, token, JSON.stringify(value)] }]);
    return rows[0].length === 1;
  }

  /** Result is a proposal, NEVER a permission to send. Fresh commercial checks must precede application. */
  async complete(prospectId: string, token: string, result: Record<string, unknown>) {
    const rows = await this.execute([{ text: `WITH saved AS (
        UPDATE crm_rehabilitation_jobs j SET state='COMPLETED',result=$3::jsonb,completed_at=now(),updated_at=now(),lease_until=NULL
        WHERE prospect_id=$1 AND lease_token=$2 AND state='RUNNING' AND lease_until>now() RETURNING prospect_id
      ), audit AS (
        INSERT INTO crm_rehabilitation_attempts(prospect_id,lease_token,outcome)
        SELECT prospect_id,$2,'COMPLETED' FROM saved ON CONFLICT DO NOTHING
      ) SELECT prospect_id FROM saved`, values: [prospectId, token, JSON.stringify(result)] }]);
    return rows[0].length === 1;
  }

  async defer(prospectId: string, token: string, budgetOnly = false) {
    const rows = await this.execute([{ text: `WITH saved AS (
      UPDATE crm_rehabilitation_jobs SET state=CASE WHEN $3::boolean THEN 'RETRY' WHEN attempts>=3 THEN 'EXHAUSTED' ELSE 'RETRY' END,
        attempts=CASE WHEN $3::boolean THEN greatest(0,attempts-1) ELSE attempts END,
        next_attempt_at=now()+CASE WHEN $3::boolean THEN interval '5 minutes' ELSE interval '6 hours'*power(2,greatest(0,attempts-1)) END,
        lease_until=NULL,updated_at=now()
      WHERE prospect_id=$1 AND lease_token=$2 AND state='RUNNING' AND lease_until>now() RETURNING prospect_id
    ), audit AS (INSERT INTO crm_rehabilitation_attempts(prospect_id,lease_token,outcome)
      SELECT prospect_id,$2,CASE WHEN $3::boolean THEN 'STOP_BUDGET' ELSE 'SOURCE_UNAVAILABLE' END FROM saved ON CONFLICT DO NOTHING)
    SELECT prospect_id FROM saved`, values: [prospectId, token, budgetOnly] }]);
    return rows[0].length === 1;
  }

  async counters() {
    const rows = await this.execute([{ text: `SELECT state,count(*)::int AS count,
      count(*) FILTER (WHERE result->>'decision'='ACTIVE_ELIGIBLE')::int AS reactivation_candidates,
      count(*) FILTER (WHERE result->>'decision' LIKE 'DORMANT%')::int AS dormant_candidates,
      count(*) FILTER (WHERE result->>'decision' IN ('BLOCKED','CLIENT','DO_NOT_CONTACT'))::int AS blocked,
      count(*) FILTER (WHERE result->>'match'='MATCH_CONFIRMED')::int AS matches_confirmed,
      count(*) FILTER (WHERE result->>'match'='MATCH_AMBIGUOUS')::int AS matches_ambiguous
      FROM crm_rehabilitation_jobs GROUP BY state`, values: [] }]);
    return rows[0];
  }

  async snapshot(prospectId: string) {
    const rows=await this.execute([{text:`SELECT id::text,company_name,email,phone,website,city,country,region,
      address_line1,postal_code,source_system,source_entity_id,quality_score,commercial_score,provenance,origin_metadata,
      status,commercial_state,do_not_contact,replied_at,bounced_at,dormant_at,archived_at,last_contacted_at,
      opportunity_suggested,updated_at::text AS revision,
      (SELECT result FROM crm_rehabilitation_jobs WHERE prospect_id=crm_prospects.id) AS rehabilitation_proposal
      ,(SELECT application_key FROM crm_rehabilitation_jobs WHERE prospect_id=crm_prospects.id AND applied_at IS NOT NULL) AS rehabilitation_applied_key
      ,(SELECT applied_at::text FROM crm_rehabilitation_jobs WHERE prospect_id=crm_prospects.id AND applied_at IS NOT NULL) AS rehabilitation_applied_revision
      FROM crm_prospects WHERE id=$1`,values:[prospectId]}]);
    const row=rows[0][0];
    return row?readCanonicalCommercialState(row as {id:unknown},async id=>(await this.execute([{text:'SELECT * FROM crm_commercial_state WHERE prospect_id=$1',values:[id]}]))[0]):null;
  }

  async deferBudgetBatch(jobs:Array<{prospectId:string;token:string}>) {
    if(jobs.length>5)throw Error('REHABILITATION_BATCH_LIMIT');
    const rows=await this.execute([{text:`UPDATE crm_rehabilitation_jobs j SET state='RETRY',attempts=greatest(0,attempts-1),
      next_attempt_at=now()+interval '5 minutes',lease_until=NULL,updated_at=now()
      FROM jsonb_to_recordset($1::jsonb) AS d("prospectId" text,token text)
      WHERE j.prospect_id=d."prospectId"::bigint AND j.lease_token=d.token AND j.state='RUNNING' AND j.lease_until>now()
      RETURNING j.prospect_id`,values:[JSON.stringify(jobs)]}]);
    return rows[0].length;
  }

  async pendingApplications() {
    const rows=await this.execute([{text:`SELECT prospect_id::text,result FROM crm_rehabilitation_jobs
      WHERE state='COMPLETED' AND applied_at IS NULL AND result->>'proposalKey' IS NOT NULL
      AND result->>'decision' IN ('DORMANT_NO_RELIABLE_EMAIL','DORMANT_LOW_VALUE','ACTIVE_ELIGIBLE')
      ORDER BY completed_at,prospect_id LIMIT 5`,values:[]}]);
    return rows[0];
  }
}
