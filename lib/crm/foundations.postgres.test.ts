import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { atomicImportProspect, type AtomicExecutor } from "./atomic-import";
import { recordContactEvent } from "./contact-events";
import { RehabilitationQueue } from './rehabilitation-queue';
import { applyRehabilitation } from './rehabilitation-application';

// No DATABASE_URL fallback: this suite may only touch an explicitly named local test database.
const url=process.env.CRM_TEST_DATABASE_URL;
if (url && (!['127.0.0.1','localhost',process.env.CRM_TEST_WSL_HOST].includes(new URL(url).hostname) || new URL(url).port!=='55439' || new URL(url).pathname!=='/crm_foundations_test')) throw new Error("Local isolated test database required");
const pool=new Pool({connectionString:url,max:12});
const sqlTag=Object.assign((strings: TemplateStringsArray,...values:unknown[])=>pool.query(strings.reduce((a,s,i)=>a+s+(i<values.length?`$${i+1}`:""),""),values).then(r=>r.rows),{query:(text:string,values:unknown[])=>pool.query(text,values).then(r=>r.rows)});
vi.mock("../neon",()=>({getNeonClient:()=>sqlTag}));
vi.mock('../admin-auth',()=>({isAdminAuthenticated:async()=>true}));
vi.mock('next/cache',()=>({revalidatePath:()=>{}}));
vi.mock('../mailer',()=>({getMailerTransport:()=>{throw new Error('UNEXPECTED SMTP');}}));
const execute:AtomicExecutor=async statements=>{
  const c=await pool.connect();
  try {await c.query("BEGIN");const rows=[];for(const s of statements) rows.push((await c.query(s.text,s.values)).rows);await c.query("COMMIT");return rows;}
  catch(e){await c.query("ROLLBACK");throw e;}finally{c.release();}
};
const input=(id="one",country="Belgique")=>({company_name:`Société ${id}`,email:`${id}@example.test`,country,region:"Zone sourcée",source:"OPENCLAW",source_system:"ai-team",source_entity_id:id,idempotency_key:`import:${id}`,quality_score:97,commercial_score:89,emma_summary:"Synthèse Emma",audit_summary:"Audit",suggested_email_subject:"Sujet",suggested_email_body:"Brouillon",provenance:[{source:"OPENCLAW",sourceUrl:"https://example.test/contact"}],origin_metadata:{batchId:"batch-1"}});

// Fault injection and stricter legacy-shape checks are transactional DDL.
// ROLLBACK restores the schema; no release constraint is removed for cleanup.
async function withTestConstraint(ddl:string,run:(executor:AtomicExecutor,query:(sql:string)=>Promise<import('pg').QueryResult>)=>Promise<void>){
 const c=await pool.connect();
 try{
  await c.query('BEGIN');await c.query(ddl);
  const executor:AtomicExecutor=async statements=>{
   await c.query('SAVEPOINT test_operation');
   try{const rows=[];for(const s of statements)rows.push((await c.query(s.text,s.values)).rows);await c.query('RELEASE SAVEPOINT test_operation');return rows;}
   catch(e){await c.query('ROLLBACK TO SAVEPOINT test_operation');throw e;}
  };
  await run(executor,sql=>c.query(sql));
 }finally{await c.query('ROLLBACK');c.release();}
}
describe.skipIf(!url)("CRM foundations — real PostgreSQL",()=>{
  it('keeping the historical CHECK rejects new kind even with an additive broader CHECK; rollback preserves history',async()=>{
    const c=await pool.connect();
    try {
      await c.query('BEGIN');
      await c.query("CREATE TEMP TABLE event_compat(id text PRIMARY KEY,kind text CONSTRAINT old_kind_check CHECK(kind IN('EMAIL_SENT','FOLLOW_UP_SENT'))) ON COMMIT DROP");
      await c.query("INSERT INTO event_compat VALUES('old','EMAIL_SENT')");
      await c.query("ALTER TABLE event_compat ADD CONSTRAINT expanded_kind_check CHECK(kind IN('EMAIL_SENT','FOLLOW_UP_SENT','SEQUENCE_REACTIVATED'))");
      await c.query('SAVEPOINT event');
      await expect(c.query("INSERT INTO event_compat VALUES('new','SEQUENCE_REACTIVATED')")).rejects.toMatchObject({code:'23514',constraint:'old_kind_check'});
      await c.query('ROLLBACK TO SAVEPOINT event');
      expect((await c.query('SELECT * FROM event_compat')).rows).toEqual([{id:'old',kind:'EMAIL_SENT'}]);
    } finally {await c.query('ROLLBACK');c.release();}
  });
  beforeAll(async()=>{
    await pool.query(readFileSync("sql/test/crm-baseline.sql","utf8"));
    await pool.query(readFileSync("sql/20260907-crm-rehabilitation.sql","utf8"));
    await pool.query(readFileSync("sql/20260907-commercial-sequence-events.sql","utf8"));
  });
  beforeEach(async()=>{await pool.query("TRUNCATE crm_rehabilitation_cursor,leads,crm_contact_events,crm_ai_audits,crm_email_drafts,crm_commercial_actions,follow_ups,crm_prospects,admin_sessions RESTART IDENTITY CASCADE");});
  afterAll(async()=>pool.end());
  async function activeProposal(overrides:Record<string,unknown>={}) {
    const row=(await pool.query("INSERT INTO crm_prospects(company_name,website,country) VALUES('Réhabilitation','https://example.test',NULL) RETURNING id,updated_at::text revision")).rows[0];
    const q=new RehabilitationQueue(execute);await q.seed();const job=(await q.claim())[0];
    const address={address_line1:'1 rue officielle',postal_code:'20000',city:'Ajaccio',region:'Corse',country:'France'};
    await q.complete(String(row.id),String(job.lease_token),{proposalKey:'active:1',expectedRevision:row.revision,decision:'ACTIVE_ELIGIBLE',
      itemId:'item-active',match:'MATCH_CONFIRMED',reliability:'RELIABLE',selectedEmail:'contact@example.test',selectedPhone:'+33495000000',
      qualityScore:95,commercialScore:90,addressProposal:address,evidence:[{sourceUrl:'https://example.test/contact',observedAt:new Date().toISOString(),email:'contact@example.test',phone:'+33495000000',address}],...overrides});
    return {version:1,kind:'REHABILITATION_APPLY',tenant:'corsaimanager',crmProspectId:String(row.id),proposalKey:'active:1',
      authorization:{minimumQualityScore:70,minimumCommercialScore:70,identity:{id:'item-active',name:'Réhabilitation',remoteId:String(row.id)}}};
  }
  it('ACTIVE_ELIGIBLE applies sourced coordinates, distinct scores and confirmed identity without creating any email or followup',async()=>{
    const p=await activeProposal();expect(await applyRehabilitation(p,execute)).toMatchObject({status:'APPLIED',replay:false});
    const row=(await pool.query('SELECT * FROM crm_prospects')).rows[0];
    expect(row).toMatchObject({commercial_state:'ACTIVE_ELIGIBLE',email:'contact@example.test',phone:'+33495000000',address_line1:'1 rue officielle',postal_code:'20000',city:'Ajaccio',region:'Corse',country:'France',quality_score:95,commercial_score:90,source_system:'ai-team',source_entity_id:'item-active'});
    expect(row.origin_metadata.rehabilitation.emailSequencePrepared).toBe(false);
    for(const table of ['crm_email_drafts','follow_ups','crm_commercial_actions'])expect((await pool.query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n).toBe(0);
  });
  it('sequence projection concurrent replay retires legacy followups once, keeps history and rejects stale revisions',async()=>{
    const p=await activeProposal();await applyRehabilitation(p,execute);
    const revision=(await pool.query('SELECT updated_at::text revision FROM crm_prospects WHERE id=$1',[p.crmProspectId])).rows[0].revision;
    const f=(await pool.query("INSERT INTO follow_ups(prospect_id,due_date,status) VALUES($1,NOW(),'prévue') RETURNING *",[p.crmProspectId])).rows[0];
    const event={version:1,tenant:'corsaimanager',sourceSystem:'ai-team',sourceEntityId:'item-active',crmProspectId:p.crmProspectId,sourceEventId:'sequence:v2',idempotencyKey:'ai-team:sequence:v2',kind:'SEQUENCE_REACTIVATED',occurredAt:new Date().toISOString(),metadata:{sequenceId:'v2',generation:2,rehabilitationKey:'active:1',crmRevision:revision}};
    const results=await Promise.all(Array.from({length:10},()=>recordContactEvent(event,execute)));
    expect(results.filter(r=>!r.replay)).toHaveLength(1);
    expect((await pool.query('SELECT status,sent_at,due_date FROM follow_ups WHERE id=$1',[f.id])).rows[0]).toEqual({status:'prévue',sent_at:null,due_date:f.due_date});
    expect((await pool.query('SELECT count(*)::int n FROM crm_sequence_events')).rows[0].n).toBe(1);
    expect((await pool.query('SELECT count(*)::int n FROM crm_legacy_execution_blocks')).rows[0].n).toBe(1);
    await expect(recordContactEvent({...event,sourceEventId:'sequence:v3',idempotencyKey:'ai-team:sequence:v3'},execute)).rejects.toThrow('SEQUENCE_RECHECK_FAILED');
    const old={...event,kind:'FOLLOW_UP_SENT',sourceEventId:'old-follow',idempotencyKey:'ai-team:old-follow',metadata:{sequence:1,sequenceId:'v1'}};
    await recordContactEvent(old,execute);
    expect((await pool.query('SELECT follow_up_count FROM crm_prospects')).rows[0].follow_up_count).toBe(0);
  });
  it('additive sequence migration keeps the old CHECK byte-identical and has no removal statements',async()=>{
    const before=(await pool.query("SELECT pg_get_constraintdef(oid) definition FROM pg_constraint WHERE conrelid='crm_contact_events'::regclass AND conname='crm_contact_events_kind_check'")).rows;
    const sql=readFileSync('sql/20260907-commercial-sequence-events.sql','utf8');expect(sql).not.toMatch(/\bDROP\s/i);
    await pool.query(sql);
    expect((await pool.query("SELECT pg_get_constraintdef(oid) definition FROM pg_constraint WHERE conrelid='crm_contact_events'::regclass AND conname='crm_contact_events_kind_check'")).rows).toEqual(before);
    expect(before[0].definition).not.toContain('SEQUENCE_REACTIVATED');
  });
  it('canonical reader prefers additive state, leaves legacy prospect unchanged and falls back without a projection',async()=>{
    const {readCanonicalCommercialState}=await import('./commercial-state-reader');
    const p=await activeProposal();await applyRehabilitation(p,execute);
    const row=(await pool.query('SELECT *,updated_at::text revision FROM crm_prospects')).rows[0];
    expect(await readCanonicalCommercialState(row)).toEqual(row);
    await recordContactEvent({version:1,tenant:'corsaimanager',sourceSystem:'ai-team',sourceEntityId:'item-active',crmProspectId:p.crmProspectId,sourceEventId:'read:v2',idempotencyKey:'ai-team:read:v2',kind:'SEQUENCE_REACTIVATED',occurredAt:new Date().toISOString(),metadata:{sequenceId:'v2',generation:2,rehabilitationKey:'active:1',crmRevision:row.revision}},execute);
    expect((await pool.query('SELECT *,updated_at::text revision FROM crm_prospects')).rows[0]).toEqual(row);
    expect((await readCanonicalCommercialState({...row,commercial_state:'legacy',follow_up_count:2})).commercial_state).toBe('ACTIVE_ELIGIBLE');
    expect((await readCanonicalCommercialState(row)).follow_up_count).toBe(0);
    expect((await pool.query('SELECT count(*)::int n FROM crm_contact_events')).rows[0].n).toBe(0);
    expect((await pool.query('SELECT kind FROM crm_sequence_events')).rows[0].kind).toBe('SEQUENCE_REACTIVATED');
  });
  it.each(['UNVERIFIED','INVALID','ABSENT'])('ACTIVE refuses %s without partial CRM mutation',async(reliability)=>{
    const p=await activeProposal({reliability});const before=(await pool.query('SELECT to_jsonb(p) row FROM crm_prospects p')).rows;
    await expect(applyRehabilitation(p,execute)).rejects.toThrow('EMAIL_UNVERIFIED');
    expect((await pool.query('SELECT to_jsonb(p) row FROM crm_prospects p')).rows).toEqual(before);
  });
  it.each(["replied_at=now()","do_not_contact=true","status='client'","updated_at=now()"] )('sequence final recheck %s preserves old followup and inserts no event',async(change)=>{
    const p=await activeProposal();await applyRehabilitation(p,execute);
    const revision=(await pool.query('SELECT updated_at::text revision FROM crm_prospects')).rows[0].revision;
    await pool.query("INSERT INTO follow_ups(prospect_id,due_date,status) VALUES($1,NOW(),'prévue')",[p.crmProspectId]);
    await pool.query(`UPDATE crm_prospects SET ${change}`);
    await expect(recordContactEvent({version:1,tenant:'corsaimanager',sourceSystem:'ai-team',sourceEntityId:'item-active',crmProspectId:p.crmProspectId,sourceEventId:'seq',idempotencyKey:'ai-team:seq',kind:'SEQUENCE_REACTIVATED',occurredAt:new Date().toISOString(),metadata:{sequenceId:'v2',generation:2,rehabilitationKey:'active:1',crmRevision:revision}},execute)).rejects.toThrow('SEQUENCE_RECHECK_FAILED');
    expect((await pool.query('SELECT status FROM follow_ups')).rows[0].status).toBe('prévue');
    expect((await pool.query('SELECT count(*)::int n FROM crm_contact_events')).rows[0].n).toBe(0);
  });
  it.each([['status',"'client'",'CLIENT'],['do_not_contact','true','DO_NOT_CONTACT'],['bounced_at','now()','BOUNCED'],['replied_at','now()','REPLIED']])('ACTIVE fresh %s refuses',async(field,value,reason)=>{
    const p=await activeProposal();await pool.query(`UPDATE crm_prospects SET ${field}=${value}`);
    const before=(await pool.query('SELECT to_jsonb(p) row FROM crm_prospects p')).rows;
    await expect(applyRehabilitation(p,execute)).rejects.toThrow(reason);
    expect((await pool.query('SELECT to_jsonb(p) row FROM crm_prospects p')).rows).toEqual(before);
  });
  it.each(['MATCH_AMBIGUOUS','NO_MATCH'])('ACTIVE %s never fabricates identity',async(match)=>{
    const p=await activeProposal({match});await expect(applyRehabilitation(p,execute)).rejects.toThrow('IDENTITY_UNCERTAIN');
    expect((await pool.query('SELECT source_entity_id,email FROM crm_prospects')).rows[0]).toEqual({source_entity_id:null,email:null});
  });
  it('ACTIVE low score and invalid provenance fail closed',async()=>{
    const p=await activeProposal({qualityScore:69});await expect(applyRehabilitation(p,execute)).rejects.toThrow('SCORE_BELOW_POLICY');
    await pool.query("UPDATE crm_rehabilitation_jobs SET result=result||'{\"qualityScore\":95,\"evidence\":[]}'::jsonb");
    await expect(applyRehabilitation(p,execute)).rejects.toThrow('EMAIL_PROVENANCE_INVALID');
  });
  it('ACTIVE preserves higher reliability email and all existing coordinates',async()=>{
    const p=await activeProposal();await pool.query(`UPDATE crm_prospects SET email='verified@example.test',phone='existing-phone',city='Existing city',origin_metadata='{"emailReliability":"VERIFIED","keep":true}'`);
    expect(await applyRehabilitation(p,execute)).toMatchObject({status:'APPLIED'});
    expect((await pool.query('SELECT email,phone,city,origin_metadata FROM crm_prospects')).rows[0]).toMatchObject({email:'verified@example.test',phone:'existing-phone',city:'Existing city',origin_metadata:{emailReliability:'VERIFIED',keep:true}});
  });
  it('ACTIVE stale revision records retry without changing CRM',async()=>{
    const p=await activeProposal();await pool.query("UPDATE crm_prospects SET notes='manual',updated_at=now()");
    await expect(applyRehabilitation(p,execute)).rejects.toThrow('REVISION_CHANGED');
    expect((await pool.query('SELECT email,notes FROM crm_prospects')).rows[0]).toEqual({email:null,notes:'manual'});
    expect((await pool.query('SELECT state,application_result FROM crm_rehabilitation_jobs')).rows[0]).toMatchObject({state:'RETRY',application_result:{status:'STALE',retryable:true}});
  });
  it('ACTIVE never downgrades VERIFIED confidence for the same email',async()=>{
    const p=await activeProposal();await pool.query(`UPDATE crm_prospects SET email='contact@example.test',origin_metadata='{"emailReliability":"VERIFIED"}'`);
    await applyRehabilitation(p,execute);
    expect((await pool.query('SELECT origin_metadata FROM crm_prospects')).rows[0].origin_metadata.emailReliability).toBe('VERIFIED');
  });
  it('ACTIVE ignores coordinates without corresponding official evidence',async()=>{
    const p=await activeProposal({selectedPhone:'invented-phone',addressProposal:{city:'Unproven city',postal_code:'99999'}});
    await applyRehabilitation(p,execute);
    expect((await pool.query('SELECT phone,city,postal_code FROM crm_prospects')).rows[0]).toEqual({phone:null,city:null,postal_code:null});
  });
  it('ACTIVE concurrent manual edit between read and locking never overwritten even without revision update',async()=>{
    const p=await activeProposal();let calls=0;
    const interleaved:AtomicExecutor=async statements=>{if(++calls===2)await pool.query("UPDATE crm_prospects SET phone='concurrent'");return execute(statements);};
    await expect(applyRehabilitation(p,interleaved)).rejects.toThrow('REVISION_CHANGED');
    expect((await pool.query('SELECT email,phone FROM crm_prospects')).rows[0]).toEqual({email:null,phone:'concurrent'});
  });
  it('ACTIVE ten concurrent applications share one mutation and durable replay',async()=>{
    const p=await activeProposal();const results=await Promise.all(Array.from({length:10},()=>applyRehabilitation(p,execute)));
    expect(results.filter(r=>!r.replay)).toHaveLength(1);
    const before=(await pool.query('SELECT to_jsonb(p) row FROM crm_prospects p')).rows;
    expect(await applyRehabilitation(p,execute)).toMatchObject({replay:true});
    expect((await pool.query('SELECT to_jsonb(p) row FROM crm_prospects p')).rows).toEqual(before);
  });
  it('ACTIVE receipt persistence failure rolls back all commercial fields',async()=>{
    const p=await activeProposal();
    await withTestConstraint('ALTER TABLE crm_rehabilitation_jobs ADD CONSTRAINT test_receipt_failure CHECK(application_key IS NULL)',async(executor,query)=>{
      await expect(applyRehabilitation(p,executor)).rejects.toThrow();expect((await query('SELECT email,source_entity_id FROM crm_prospects')).rows[0]).toEqual({email:null,source_entity_id:null});
    });
  });
  async function dormantProposal() {
    const row=(await pool.query("INSERT INTO crm_prospects(company_name) VALUES('historique') RETURNING id,updated_at::text revision")).rows[0];
    const queue=new RehabilitationQueue(execute); await queue.seed(); const job=(await queue.claim())[0];
    await queue.complete(String(row.id),String(job.lease_token),{proposalKey:'rehab:1',expectedRevision:row.revision,decision:'DORMANT_NO_RELIABLE_EMAIL'});
    return {version:1,kind:'REHABILITATION_APPLY',tenant:'corsaimanager',crmProspectId:String(row.id),proposalKey:'rehab:1'};
  }
  it('rehabilitation application replay concurrently => one durable dormant receipt',async()=>{
    const p=await dormantProposal();
    const results=await Promise.all(Array.from({length:5},()=>applyRehabilitation(p,execute)));
    expect(results.filter(r=>!r.replay)).toHaveLength(1);
    expect((await pool.query('SELECT commercial_state,dormant_at FROM crm_prospects')).rows[0].commercial_state).toBe('DORMANT');
    expect((await pool.query('SELECT count(*)::int n FROM crm_rehabilitation_jobs WHERE applied_at IS NOT NULL')).rows[0].n).toBe(1);
  });
  it('rehabilitation budget cleanup releases five owners atomically without consuming attempts',async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name) SELECT 'historique '||n FROM generate_series(1,5) n");
    const q=new RehabilitationQueue(execute);await q.seed();
    const jobs=(await q.claim()).map(j=>({prospectId:String(j.prospect_id),token:String(j.lease_token)}));
    expect(await q.deferBudgetBatch(jobs)).toBe(5);
    expect(await q.deferBudgetBatch(jobs)).toBe(0);
    expect((await pool.query('SELECT sum(attempts)::int n FROM crm_rehabilitation_jobs')).rows[0].n).toBe(0);
  });
  it('rehabilitation changed CRM revision => no overwrite, no receipt',async()=>{
    const p=await dormantProposal();
    await pool.query("UPDATE crm_prospects SET notes='nouvelle information',updated_at=updated_at+interval '1 second'");
    await expect(applyRehabilitation(p,execute)).rejects.toMatchObject({status:409});
    const row=(await pool.query('SELECT notes,dormant_at FROM crm_prospects')).rows[0];
    expect(row).toEqual({notes:'nouvelle information',dormant_at:null});
  });
  it('rehabilitation fresh suppression and wrong tenant refuse application',async()=>{
    const p=await dormantProposal();
    await pool.query("UPDATE crm_prospects SET do_not_contact=true");
    await expect(applyRehabilitation(p,execute)).rejects.toMatchObject({status:409});
    await expect(applyRehabilitation({...p,tenant:'sentieru'},execute)).rejects.toMatchObject({status:400});
  });
  it('rehabilitation endpoint requires machine authentication before DB',async()=>{
    const {POST}=await import('../../app/api/internal/crm/rehabilitation/apply/route');
    const response=await POST(new Request('https://example.test/api/internal/crm/rehabilitation/apply',{method:'POST',body:'{}'}));
    expect(response.status).toBe(401);
  });
  it('rehabilitation keyset seed bounded, terminal records excluded, replay does not enqueue twice', async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name) SELECT 'historique '||n FROM generate_series(1,78) n");
    await pool.query("UPDATE crm_prospects SET status='client' WHERE id=1");
    await pool.query("UPDATE crm_prospects SET do_not_contact=true WHERE id=2");
    const q=new RehabilitationQueue(execute);
    expect(await q.seed()).toMatchObject({scanned:50,queued:48});
    expect(await q.seed()).toMatchObject({scanned:28,queued:28});
    expect(await q.seed()).toMatchObject({scanned:0,queued:0});
    expect((await pool.query('SELECT count(*)::int n FROM crm_rehabilitation_jobs')).rows[0].n).toBe(76);
  });
  it('rehabilitation concurrent claims never share a job and stay bounded to five', async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name) SELECT 'historique '||n FROM generate_series(1,12) n");
    const q=new RehabilitationQueue(execute); await q.seed();
    const claims=await Promise.all(Array.from({length:4},()=>q.claim()));
    expect(claims.every(c=>c.length<=5)).toBe(true);
    const ids=claims.flat().map(j=>j.prospect_id); expect(ids).toHaveLength(12); expect(new Set(ids).size).toBe(12);
  });
  it('rehabilitation expired lease resumes checkpoint and fences stale owner', async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name) VALUES('historique')");
    const q=new RehabilitationQueue(execute); await q.seed(); const first=(await q.claim())[0];
    const id=String(first.prospect_id), token=String(first.lease_token);
    expect(await q.checkpoint(id,token,{enrichmentAttempted:true})).toBe(true);
    await pool.query("UPDATE crm_rehabilitation_jobs SET lease_until=now()-interval '1 second'");
    const resumed=(await new RehabilitationQueue(execute).claim())[0];
    expect(resumed.checkpoint).toEqual({enrichmentAttempted:true});
    expect(await q.complete(id,token,{decision:'ACTIVE_ELIGIBLE'})).toBe(false);
    expect(await q.complete(id,String(resumed.lease_token),{decision:'DORMANT_NO_RELIABLE_EMAIL'})).toBe(true);
    expect(await q.complete(id,String(resumed.lease_token),{decision:'DORMANT_NO_RELIABLE_EMAIL'})).toBe(false);
    expect((await pool.query('SELECT count(*)::int n FROM crm_rehabilitation_attempts')).rows[0].n).toBe(1);
  });
  it('rehabilitation source failure backs off; budget stop does not consume an attempt', async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name) VALUES('historique')");
    const q=new RehabilitationQueue(execute); await q.seed(); const first=(await q.claim())[0];
    await q.defer(String(first.prospect_id),String(first.lease_token),true);
    expect((await pool.query('SELECT attempts,state FROM crm_rehabilitation_jobs')).rows[0]).toEqual({attempts:0,state:'RETRY'});
    expect(await q.claim()).toHaveLength(0);
    await pool.query("UPDATE crm_rehabilitation_jobs SET next_attempt_at=now()-interval '1 second'");
    const second=(await q.claim())[0]; await q.defer(String(second.prospect_id),String(second.lease_token));
    expect((await pool.query("SELECT next_attempt_at>now()+interval '5 hours' ok FROM crm_rehabilitation_jobs")).rows[0].ok).toBe(true);
  });
  it('rehabilitation proposal keeps CRM/history untouched and never creates email', async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name,notes) VALUES('historique','historique conservé')");
    const before=(await pool.query('SELECT * FROM crm_prospects')).rows[0];
    const q=new RehabilitationQueue(execute); await q.seed(); const j=(await q.claim())[0];
    await q.complete(String(j.prospect_id),String(j.lease_token),{decision:'ACTIVE_ELIGIBLE',addressProposal:{city:'Ajaccio'}});
    expect((await pool.query('SELECT * FROM crm_prospects')).rows[0]).toEqual(before);
    expect((await pool.query('SELECT count(*)::int n FROM crm_email_drafts')).rows[0].n).toBe(0);
  });
  it("10 imports concurrents même identité => une fiche et un seul ensemble annexe",async()=>{
    const results=await Promise.all(Array.from({length:10},()=>atomicImportProspect(input(),execute)));
    expect(new Set(results.map(r=>r.prospect_id)).size).toBe(1);
    for(const table of ['crm_prospects','crm_commercial_actions','crm_ai_audits','crm_email_drafts']) expect((await pool.query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n).toBe(1);
  });
  it("même clé retourne remoteId, collision de clé ne crée rien",async()=>{
    const first=await atomicImportProspect(input(),execute);
    expect((await atomicImportProspect(input(),execute)).prospect_id).toBe(first.prospect_id);
    await expect(atomicImportProspect({...input('two'),idempotency_key:'import:one'},execute)).rejects.toMatchObject({status:409});
    expect((await pool.query("SELECT count(*)::int n FROM crm_prospects")).rows[0].n).toBe(1);
  });
  it("erreur audit intermédiaire => rollback prospect/action/brouillon",async()=>{
    // A temporary CHECK failure runs inside the real import statement, after inserting the prospect.
    await withTestConstraint("ALTER TABLE crm_ai_audits ADD CONSTRAINT test_reject_audit CHECK (score < 0)",async(executor,query)=>{
      await expect(atomicImportProspect(input(),executor)).rejects.toThrow();
      for(const table of ['crm_prospects','crm_commercial_actions','crm_ai_audits','crm_email_drafts']) expect((await query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n).toBe(0);
    });
  });
  it.each(['Belgique','Suisse'])("préserve pays %s, scores distincts, provenance et Emma",async country=>{
    const result=await atomicImportProspect(input('one',country),execute);
    const row=(await pool.query("SELECT * FROM crm_prospects WHERE id=$1",[result.prospect_id])).rows[0];
    expect(row).toMatchObject({country,region:"Zone sourcée",quality_score:97,commercial_score:89,source_system:"ai-team",emma_summary:"Synthèse Emma",provenance:[{source:"OPENCLAW",sourceUrl:"https://example.test/contact"}]});
  });
  it("édition partielle conserve enrichissement et opt-out après conversion/archivage",async()=>{
    const result=await atomicImportProspect(input(),execute);
    const repo=await import('./repository');
    await repo.updateProspect(Number(result.prospect_id),{companyName:"Nom modifié"});
    await recordContactEvent({sourceSystem:'ai-team',sourceEntityId:'one',eventId:'refus',kind:'DO_NOT_CONTACT',occurredAt:'2026-09-01T10:00:00Z'},execute);
    await repo.setProspectStatus(Number(result.prospect_id),'client');
    await repo.archiveProspect(Number(result.prospect_id));
    const row=(await pool.query('SELECT * FROM crm_prospects WHERE id=$1',[result.prospect_id])).rows[0];
    expect(row).toMatchObject({company_name:'Nom modifié',ai_score:89,quality_score:97,commercial_score:89,audit_summary:'Audit',suggested_email_subject:'Sujet',suggested_email_body:'Brouillon',emma_summary:'Synthèse Emma',source_system:'ai-team',do_not_contact:true,status:'client'});
    expect(row.provenance).toHaveLength(1);
    expect(await repo.checkInternalCrmProspect({email:'one@example.test'})).toMatchObject({status:'CLIENT',doNotContact:true});
    const {assertProspectContactAllowed}=await import('./contact-safety');
    await expect(assertProspectContactAllowed(Number(result.prospect_id))).rejects.toThrow('Contact interdit');
  });
  it("event replay concurrent => un historique, collision refusée, réponse distincte du refus",async()=>{
    const result=await atomicImportProspect(input(),execute);
    const event={sourceSystem:'ai-team',prospectId:String(result.prospect_id),eventId:'reply',kind:'REPLIED',occurredAt:'2026-09-01T10:00:00Z'};
    await Promise.all(Array.from({length:5},()=>recordContactEvent(event,execute)));
    expect((await pool.query('SELECT count(*)::int n FROM crm_contact_events')).rows[0].n).toBe(1);
    expect((await pool.query('SELECT do_not_contact FROM crm_prospects')).rows[0].do_not_contact).toBe(false);
    await expect(recordContactEvent({...event,kind:'BOUNCED'},execute)).rejects.toMatchObject({status:409});
    await recordContactEvent({...event,eventId:'bounce',kind:'BOUNCED'},execute);
    expect((await pool.query('SELECT do_not_contact FROM crm_prospects')).rows[0].do_not_contact).toBe(true);
  });
  it("recheck rapprochement conserve IDs historiques 155/156",async()=>{
    await pool.query("INSERT INTO crm_prospects(id,company_name,email) VALUES(155,'Cabinet Cetec','cetec@example.test'),(156,'HELIX','helix@example.test')");
    expect((await atomicImportProspect({...input('cetec'),company_name:'Cabinet Cetec'},execute)).prospect_id).toBe('155');
    expect((await atomicImportProspect({...input('helix'),company_name:'HELIX'},execute)).prospect_id).toBe('156');
    expect((await pool.query('SELECT count(*)::int n FROM crm_prospects')).rows[0].n).toBe(2);
  });

  it("v1: email initial, deux relances et dormant conservent un historique idempotent",async()=>{
    const created=await atomicImportProspect(input(),execute);
    const base={version:1,sourceSystem:"ai-team",tenant:"corsaimanager",sourceEntityId:"one",crmProspectId:String(created.prospect_id)};
    const events=[
      {kind:"EMAIL_SENT",metadata:{nextActionAt:"2026-06-08T10:00:00Z"}},
      {kind:"FOLLOW_UP_SENT",metadata:{sequence:1,nextActionAt:"2026-07-01T10:00:00Z"}},
      {kind:"FOLLOW_UP_SENT",metadata:{sequence:2,nextActionAt:"2026-08-01T10:00:00Z"}},
      {kind:"PROSPECT_DORMANT",metadata:{reason:"MAX_FOLLOW_UPS_REACHED"}},
    ];
    for(const [i,event] of events.entries()) {
      const e={...base,...event,sourceEventId:`v1-${i}`,idempotencyKey:`ai-team:v1-${i}`,occurredAt:`2026-0${i+5}-01T10:00:00Z`};
      await Promise.all(Array.from({length:5},()=>recordContactEvent(e,execute)));
    }
    const row=(await pool.query("SELECT * FROM crm_prospects WHERE id=$1",[created.prospect_id])).rows[0];
    expect(row.follow_up_count).toBe(2);expect(row.commercial_state).toBe("DORMANT");expect(row.next_action_at).toBeNull();
    expect((await pool.query("SELECT count(*)::int n FROM crm_contact_events")).rows[0].n).toBe(4);
  });
  it("v1: réponse puis anciens événements livrés hors ordre ne réouvrent jamais la prospection",async()=>{
    const created=await atomicImportProspect(input(),execute);
    const base={version:1,sourceSystem:"ai-team",tenant:"corsaimanager",sourceEntityId:"one",crmProspectId:String(created.prospect_id)};
    for(const [id,kind,date] of [["reply","EMAIL_REPLIED","2026-08-01"],["sent","EMAIL_SENT","2026-07-01"],["refusal","DO_NOT_CONTACT","2026-08-02"]]) {
      await recordContactEvent({...base,sourceEventId:id,idempotencyKey:`ai-team:${id}`,kind,occurredAt:`${date}T10:00:00Z`,metadata:{}},execute);
    }
    const repo=await import("./repository");
    expect(await repo.checkInternalCrmProspect({email:"one@example.test"})).toMatchObject({hasReplied:true,doNotContact:true,commercialContractVersion:1});
    const row=(await pool.query("SELECT commercial_state,next_action_at FROM crm_prospects")).rows[0];
    expect(row).toMatchObject({commercial_state:"DO_NOT_CONTACT",next_action_at:null});
  });
  it("v1: bounce/rejected replay atomique et identité contradictoire refusée",async()=>{
    const created=await atomicImportProspect(input(),execute);
    const base={version:1,sourceSystem:"ai-team",tenant:"corsaimanager",sourceEntityId:"one",crmProspectId:String(created.prospect_id),sourceEventId:"bounce-v1",idempotencyKey:"ai-team:bounce-v1",kind:"EMAIL_BOUNCED",occurredAt:"2026-08-02T10:00:00Z",metadata:{}};
    await Promise.all(Array.from({length:10},()=>recordContactEvent(base,execute)));
    await expect(recordContactEvent({...base,sourceEventId:"wrong",idempotencyKey:"ai-team:wrong",sourceEntityId:"other"},execute)).rejects.toMatchObject({status:404});
    expect((await pool.query("SELECT count(*)::int n FROM crm_contact_events")).rows[0].n).toBe(1);
    const repo=await import("./repository");expect(await repo.checkInternalCrmProspect({email:"one@example.test"})).toMatchObject({hasBounced:true,doNotContact:true});
  });
  it("lookup ambigu refuse de choisir arbitrairement une fiche CRM",async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name,email) VALUES ('Same','a@example.test'),('Same','b@example.test')");
    const repo=await import("./repository");
    await expect(repo.checkInternalCrmProspect({companyName:"Same"})).rejects.toMatchObject({status:409});
  });
  it('envoi local avec opt-out refusé avant SMTP, ancien perdu non converti',async()=>{
    const result=await atomicImportProspect(input(),execute);
    await pool.query("UPDATE crm_prospects SET status='perdu' WHERE id=$1",[result.prospect_id]);
    const repo=await import('./repository');
    expect(await repo.checkInternalCrmProspect({email:'one@example.test'})).toMatchObject({doNotContact:false,refused:false});
    await recordContactEvent({sourceSystem:'ai-team',prospectId:String(result.prospect_id),eventId:'dnc',kind:'DO_NOT_CONTACT',occurredAt:'2026-09-01T10:00:00Z'},execute);
    const follow=(await pool.query("INSERT INTO follow_ups(prospect_id,due_date) VALUES($1,NOW()) RETURNING id",[result.prospect_id])).rows[0];
    const form=new FormData();form.set('id',String(follow.id));form.set('prospectId',String(result.prospect_id));
    const {sendProspectFollowUpEmailAction}=await import('../../app/crm/actions');
    await expect(sendProspectFollowUpEmailAction(form)).rejects.toThrow('Contact interdit');
  });
  it('session opaque validée, expirée et révoquée par PostgreSQL',async()=>{
    const {createAdminSession,validateAdminSession,revokeAdminSession}=await import('../admin-sessions');
    const {token}=await createAdminSession();expect(await validateAdminSession(token)).toBe(true);
    await revokeAdminSession(token);expect(await validateAdminSession(token)).toBe(false);
    const next=await createAdminSession();await pool.query('UPDATE admin_sessions SET expires_at=NOW()-INTERVAL \'1 second\'');
    expect(await validateAdminSession(next.token)).toBe(false);
  });
  it('réponse positive et replay concurrents créent un seul lead sans déclencher de relance locale',async()=>{
    const p=await atomicImportProspect(input(),execute);
    const event={version:1,sourceSystem:'ai-team',tenant:'corsaimanager',sourceEntityId:'one',crmProspectId:String(p.prospect_id),sourceEventId:'positive',idempotencyKey:'ai-team:positive',kind:'EMAIL_REPLIED',occurredAt:'2026-09-01T10:00:00Z',metadata:{reason:'POSITIVE_REPLY_EXPLICIT'}};
    await Promise.all(Array.from({length:5},()=>recordContactEvent(event,execute)));
    expect((await pool.query('SELECT count(*)::int n FROM leads')).rows[0].n).toBe(1);
    const {isEmailDoNotContact}=await import('./contact-safety');
    expect(await isEmailDoNotContact('one@example.test')).toBe(true);
  });
  it('réponse positive rattache un lead certain, email partagé ambigu ne crée ni fusionne',async()=>{
    const p=await atomicImportProspect(input(),execute);
    await pool.query("INSERT INTO leads(email,entreprise) VALUES('one@example.test','Société one')");
    const event={sourceSystem:'ai-team',prospectId:String(p.prospect_id),eventId:'positive',kind:'EMAIL_REPLIED',occurredAt:'2026-09-01T10:00:00Z',reason:'POSITIVE_REPLY_EXPLICIT'};
    await recordContactEvent(event,execute);
    expect(String((await pool.query('SELECT crm_prospect_id FROM leads')).rows[0].crm_prospect_id)).toBe(String(p.prospect_id));
    await pool.query("INSERT INTO leads(email,entreprise) VALUES('one@example.test','Autre société')");
    await recordContactEvent({...event,eventId:'positive2'},execute);
    expect((await pool.query('SELECT count(*)::int n FROM leads')).rows[0].n).toBe(2);
  });
  it('domaine seul ou email partagé entre sociétés ne rattache pas arbitrairement',async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name,website,email) VALUES('Autre','shared.test','shared@shared.test')");
    await expect(atomicImportProspect({...input(),website:'shared.test',email:'different@shared.test'},execute)).rejects.toMatchObject({status:409});
    await expect(atomicImportProspect({...input(),email:'shared@shared.test'},execute)).rejects.toMatchObject({status:409});
    expect((await pool.query('SELECT count(*)::int n FROM crm_prospects')).rows[0].n).toBe(1);
    expect((await pool.query('SELECT source_entity_id FROM crm_prospects')).rows[0].source_entity_id).toBeNull();
  });
  it('client, réponse, bounce et dormant interdisent aussi le chemin manuel local',async()=>{
    const {assertProspectContactAllowed}=await import('./contact-safety');
    for(const state of ['client','reply','bounce','dormant']) {
      const row=(await pool.query(`INSERT INTO crm_prospects(company_name,email,source,status,replied_at,bounced_at,dormant_at)
        VALUES($1,$2,'manual',CASE WHEN $1='client' THEN 'client' ELSE 'nouveau' END,
          CASE WHEN $1='reply' THEN NOW() END,CASE WHEN $1='bounce' THEN NOW() END,CASE WHEN $1='dormant' THEN NOW() END) RETURNING id`,[state,`${state}@example.test`])).rows[0];
      await expect(assertProspectContactAllowed(Number(row.id))).rejects.toThrow('Contact interdit');
    }
  });
  it('compteurs nouveaux et échéances excluent les états terminaux sans modifier les fiches',async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name,status,source,dormant_at,next_action_at) VALUES('Dormant','nouveau','manual',NOW(),NOW()-INTERVAL '1 day')");
    const {getCrmDashboard}=await import('./repository');
    const data=await getCrmDashboard();
    expect(data.summary.nouveaux).toBe(0); expect(data.summary.relances_aujourdhui).toBe(0);
    expect((await pool.query('SELECT count(*)::int n FROM crm_prospects')).rows[0].n).toBe(1);
  });
  it('téléphone partagé sans identité certaine impose revue sans créer ni fusionner',async()=>{
    await pool.query("INSERT INTO crm_prospects(company_name,phone) VALUES('Autre société','01 23 45 67 89')");
    await expect(atomicImportProspect({...input(),phone:'0123456789'},execute)).rejects.toMatchObject({status:409});
    expect((await pool.query('SELECT count(*)::int n FROM crm_prospects')).rows[0].n).toBe(1);
  });
  it('lead compatible avec les contraintes françaises réelles sans inventer un contact',async()=>{
    const p=await atomicImportProspect(input(),execute);
    await withTestConstraint('ALTER TABLE leads ALTER COLUMN nom SET NOT NULL, ALTER COLUMN entreprise SET NOT NULL, ALTER COLUMN activite SET NOT NULL, ALTER COLUMN besoin SET NOT NULL',async(executor,query)=>{
      await recordContactEvent({sourceSystem:'ai-team',prospectId:String(p.prospect_id),eventId:'positive-production-shape',kind:'EMAIL_REPLIED',occurredAt:'2026-09-01T10:00:00Z',reason:'POSITIVE_REPLY_EXPLICIT'},executor);
      expect((await query('SELECT nom,entreprise,activite,besoin FROM leads')).rows[0]).toEqual({nom:'',entreprise:'Société one',activite:'',besoin:''});
    });
  });
});
