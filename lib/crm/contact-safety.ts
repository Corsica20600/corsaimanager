import { getNeonClient } from "../neon";

export async function isEmailDoNotContact(email: string) {
  const rows=await getNeonClient().query("SELECT id FROM crm_prospects WHERE (do_not_contact=TRUE OR replied_at IS NOT NULL OR bounced_at IS NOT NULL OR dormant_at IS NOT NULL OR status IN ('client','perdu') OR source_system='ai-team') AND lower(email)=lower($1) LIMIT 1",[email]);
  return rows.length>0;
}

/** Read again at the execution boundary, including archived suppression records. */
export async function assertProspectContactAllowed(prospectId: number) {
  const rows = await getNeonClient().query(`SELECT p.id FROM crm_prospects p WHERE p.id=$1
    AND p.archived_at IS NULL AND p.do_not_contact=FALSE
    AND p.replied_at IS NULL AND p.bounced_at IS NULL AND p.dormant_at IS NULL
    AND p.status NOT IN ('client','perdu') AND coalesce(p.source_system,'')<>'ai-team'
    AND lower(coalesce(p.source,''))<>'openclaw'
    AND NOT EXISTS(SELECT 1 FROM crm_legacy_execution_blocks b WHERE b.prospect_id=p.id)
    AND NOT EXISTS (SELECT 1 FROM crm_prospects suppressed WHERE suppressed.do_not_contact=TRUE
      AND suppressed.email IS NOT NULL AND lower(suppressed.email)=lower(p.email))`,[prospectId]);
  if (rows.length !== 1) throw new Error("Contact interdit ou prospect indisponible.");
}
