import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { atomicImportProspect, type AtomicExecutor } from "./atomic-import";
import { recordContactEvent } from "./contact-events";

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

describe.skipIf(!url)("CRM foundations — real PostgreSQL",()=>{
  beforeAll(async()=>{
    await pool.query(readFileSync("sql/create-crm-tables.sql","utf8"));
    await pool.query(readFileSync("sql/20260905-crm-foundations.sql","utf8"));
    await pool.query(readFileSync("sql/20260907-commercial-history.sql","utf8"));
    await pool.query(readFileSync("sql/create-leads-table.sql","utf8"));
    await pool.query(readFileSync("sql/20260907-crm-lead-link.sql","utf8"));
  });
  beforeEach(async()=>{await pool.query("TRUNCATE leads,crm_contact_events,crm_ai_audits,crm_email_drafts,crm_commercial_actions,follow_ups,crm_prospects,admin_sessions RESTART IDENTITY CASCADE");});
  afterAll(async()=>pool.end());
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
    await pool.query("ALTER TABLE crm_ai_audits ADD CONSTRAINT test_reject_audit CHECK (score < 0)");
    try {await expect(atomicImportProspect(input(),execute)).rejects.toThrow();
      for(const table of ['crm_prospects','crm_commercial_actions','crm_ai_audits','crm_email_drafts']) expect((await pool.query(`SELECT count(*)::int n FROM ${table}`)).rows[0].n).toBe(0);
    }finally{await pool.query("ALTER TABLE crm_ai_audits DROP CONSTRAINT test_reject_audit");}
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
    try {
      await pool.query('ALTER TABLE leads ALTER COLUMN nom SET NOT NULL, ALTER COLUMN entreprise SET NOT NULL, ALTER COLUMN activite SET NOT NULL, ALTER COLUMN besoin SET NOT NULL');
      await recordContactEvent({sourceSystem:'ai-team',prospectId:String(p.prospect_id),eventId:'positive-production-shape',kind:'EMAIL_REPLIED',occurredAt:'2026-09-01T10:00:00Z',reason:'POSITIVE_REPLY_EXPLICIT'},execute);
      expect((await pool.query('SELECT nom,entreprise,activite,besoin FROM leads')).rows[0]).toEqual({nom:'',entreprise:'Société one',activite:'',besoin:''});
    } finally {
      await pool.query('ALTER TABLE leads ALTER COLUMN nom DROP NOT NULL, ALTER COLUMN entreprise DROP NOT NULL, ALTER COLUMN activite DROP NOT NULL, ALTER COLUMN besoin DROP NOT NULL');
    }
  });
});
