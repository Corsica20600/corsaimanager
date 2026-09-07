import { getNeonClient } from "../neon";
import { CrmInputError, optionalScore, optionalText } from "./internal-api";

export type SqlStatement = { text: string; values: unknown[] };
export type AtomicExecutor = (statements: SqlStatement[]) => Promise<Record<string, unknown>[][]>;
export const executeAtomic: AtomicExecutor = async statements => {
  const sql = getNeonClient();
  return sql.transaction(statements.map(s => sql.query(s.text,s.values)), { isolationLevel: "ReadCommitted" });
};

export function parseImport(data: Record<string, unknown>) {
  const fields: Record<string,unknown> = {};
  for (const key of ["company_name","contact_name","email","phone","website","country","region","department","city","sector","source","source_system","source_entity_id","idempotency_key","audit_summary","suggested_email_subject","suggested_email_body","emma_summary"]) {
    fields[key] = optionalText(data[key], ["source_system","source_entity_id","idempotency_key"].includes(key) ? 200 : 10000) ?? null;
  }
  if (!fields.company_name) throw new CrmInputError("company_name est obligatoire.");
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fields.email))) throw new CrmInputError("Email invalide.");
  if (fields.source_system && fields.source_system !== "ai-team") throw new CrmInputError("Source système interdite.",403);
  if ([fields.source_system,fields.source_entity_id,fields.idempotency_key].some(Boolean) && ![fields.source_system,fields.source_entity_id,fields.idempotency_key].every(Boolean)) throw new CrmInputError("Identité source complète requise.");
  fields.source ??= "openclaw";
  fields.country ??= fields.source_system === "ai-team" ? null : "France";
  fields.website = fields.website ? String(fields.website).replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase() : null;
  fields.quality_score = optionalScore(data.quality_score) ?? null;
  fields.commercial_score = optionalScore(data.commercial_score) ?? null;
  fields.ai_score = optionalScore(data.ai_score) ?? fields.commercial_score ?? null;
  fields.score = fields.commercial_score ?? fields.ai_score ?? 0;
  fields.status = fields.email ? "nouveau" : "a_enrichir";
  fields.notes = fields.audit_summary ? `Audit OpenClaw:\n${fields.audit_summary}` : null;
  const recommendations = data.audit_recommendations ?? [];
  if (!Array.isArray(recommendations) || recommendations.length > 20) throw new CrmInputError("Recommandations invalides.");
  const auditRecommendations = recommendations.map(value => optionalText(value)).filter(Boolean);
  const provenance = data.provenance ?? [];
  if (!Array.isArray(provenance) || provenance.length > 30) throw new CrmInputError("Provenance invalide.");
  fields.provenance = provenance.map(entry => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new CrmInputError("Provenance invalide.");
    const record = entry as Record<string,unknown>;
    return Object.fromEntries(["source","sourceUrl","sourceExternalId","observedAt"].flatMap(key => {
      const value = optionalText(record[key],2000); return value ? [[key,value]] : [];
    }));
  });
  const metadata = data.origin_metadata ?? {};
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new CrmInputError("Métadonnées invalides.");
  fields.origin_metadata = Object.fromEntries(["batchId","workflowId"].flatMap(key => {
    const value = optionalText((metadata as Record<string,unknown>)[key],200); return value ? [[key,value]] : [];
  }));
  return { fields, auditRecommendations };
}

/** The lock is a separate statement so the following READ COMMITTED snapshot sees the previous import's commit. */
export async function atomicImportProspect(data: Record<string, unknown>, execute: AtomicExecutor = executeAtomic) {
  const {fields,auditRecommendations} = parseImport(data);
  const result = await execute([
    {text:"SELECT pg_advisory_xact_lock(hashtext('corsaimanager:crm-import'))",values:[]},
    {text:`WITH input AS (SELECT * FROM jsonb_populate_record(NULL::crm_prospects,$1::jsonb)),
      matches AS MATERIALIZED (
        SELECT p.* FROM crm_prospects p, input i WHERE
          (i.source_system IS NOT NULL AND p.source_system=i.source_system AND (p.source_entity_id=i.source_entity_id OR p.idempotency_key=i.idempotency_key))
          OR (i.email IS NOT NULL AND lower(p.email)=lower(i.email))
          OR (i.website IS NOT NULL AND lower(p.website)=lower(i.website))
          OR (length(regexp_replace(coalesce(i.phone,''),'[^0-9]','','g'))>=7
              AND regexp_replace(p.phone,'[^0-9]','','g')=regexp_replace(i.phone,'[^0-9]','','g'))
        ORDER BY CASE WHEN p.source_system=i.source_system AND (p.source_entity_id=i.source_entity_id OR p.idempotency_key=i.idempotency_key) THEN 0 ELSE 1 END,
          p.do_not_contact DESC,(p.status='client') DESC,p.id
      ),
      existing AS MATERIALIZED (SELECT * FROM matches LIMIT 1),
      linked AS (
        UPDATE crm_prospects p SET source_system=i.source_system,source_entity_id=i.source_entity_id,idempotency_key=i.idempotency_key
        FROM input i, existing e WHERE p.id=e.id AND e.source_system IS NULL AND i.source_system IS NOT NULL
          AND (SELECT count(*) FROM matches)=1 AND lower(e.company_name)=lower(i.company_name)
          AND i.email IS NOT NULL AND lower(e.email)=lower(i.email)
        RETURNING p.id
      ),
      inserted AS (
        INSERT INTO crm_prospects(company_name,contact_name,email,phone,website,country,region,department,city,sector,source,status,score,ai_score,notes,audit_summary,suggested_email_subject,suggested_email_body,source_system,source_entity_id,idempotency_key,quality_score,commercial_score,emma_summary,provenance,origin_metadata)
        SELECT company_name,contact_name,email,phone,website,country,region,department,city,sector,source,status,score,ai_score,notes,audit_summary,suggested_email_subject,suggested_email_body,source_system,source_entity_id,idempotency_key,quality_score,commercial_score,emma_summary,provenance,origin_metadata FROM input WHERE NOT EXISTS(SELECT 1 FROM existing)
        RETURNING *
      ), action AS (
        INSERT INTO crm_commercial_actions(prospect_id,type,status,title,notes)
        SELECT id,'import_openclaw','à_valider',CASE WHEN source_system='ai-team' THEN 'Prospect importé par AI-Team' ELSE 'Prospect importé par OpenClaw' END,'Import CRM confirmé' FROM inserted RETURNING id
      ), audit AS (
        INSERT INTO crm_ai_audits(prospect_id,score,summary,recommendations,source)
        SELECT id,ai_score,audit_summary,$2::text[],coalesce(source_system,source) FROM inserted
        WHERE audit_summary IS NOT NULL OR ai_score IS NOT NULL OR cardinality($2::text[])>0 RETURNING id
      ), draft AS (
        INSERT INTO crm_email_drafts(prospect_id,subject,body,source)
        SELECT id,coalesce(suggested_email_subject,'Prise de contact - '||company_name),coalesce(suggested_email_body,''),source FROM inserted
        WHERE email IS NOT NULL AND (suggested_email_subject IS NOT NULL OR suggested_email_body IS NOT NULL) RETURNING id
      )
      SELECT id, status, FALSE AS duplicate, FALSE AS conflict,(SELECT id FROM action) AS action_id,(SELECT id FROM audit) AS audit_id,(SELECT id FROM draft) AS draft_id FROM inserted
      UNION ALL SELECT e.id,e.status,TRUE,
        ((SELECT count(*) FROM matches)>1 OR
         NOT (coalesce(e.source_system=i.source_system AND e.source_entity_id=i.source_entity_id AND e.idempotency_key=i.idempotency_key,FALSE)
           OR (lower(e.company_name)=lower(i.company_name) AND i.email IS NOT NULL AND lower(e.email)=lower(i.email))) OR
         (i.source_system IS NOT NULL AND e.source_system IS NOT NULL AND (e.source_system<>i.source_system OR e.source_entity_id<>i.source_entity_id OR e.idempotency_key<>i.idempotency_key))),NULL,NULL,NULL
        FROM existing e,input i`,values:[JSON.stringify(fields),auditRecommendations]}
  ]);
  const row = result[1][0];
  if (row?.conflict) throw new CrmInputError("Identité source ou clé déjà associée à un autre import.",409);
  if (!row) throw new Error("Import without result");
  return { duplicate: row.duplicate, status: row.duplicate ? "existing" : "created", prospect_id: row.id, prospect_status: row.status, action_id:row.action_id,draft_id:row.draft_id,audit_id:row.audit_id };
}
