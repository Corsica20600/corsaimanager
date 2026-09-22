import pg from "pg";

const names = [
  "__OPENCLAW_KEY_TEST_DO_NOT_IMPORT__",
  "__OPENCLAW_SCHEMA_TEST_DO_NOT_IMPORT__",
  "__OPENCLAW_KEY_CHECK_DO_NOT_IMPORT__",
];
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query("BEGIN");
  const { rows } = await client.query(`
    SELECT p.id, p.company_name
    FROM crm_prospects p
    WHERE p.company_name = ANY($1::text[]) AND p.archived_at IS NULL
      AND LOWER(COALESCE(p.source, '')) = 'openclaw'
      AND p.status <> 'client'
      AND NOT EXISTS (SELECT 1 FROM crm_contact_events e WHERE e.prospect_id = p.id)
      AND NOT EXISTS (SELECT 1 FROM crm_commercial_actions a WHERE a.prospect_id = p.id AND a.sent_at IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM crm_email_drafts d WHERE d.prospect_id = p.id AND d.sent_at IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM follow_ups f WHERE f.prospect_id = p.id AND f.sent_at IS NOT NULL)
    FOR UPDATE
  `, [names]);
  if (rows.length !== names.length) throw new Error(`FIXTURE_GUARD_FAILED:${rows.length}/${names.length}`);
  await client.query(`
    UPDATE crm_prospects
    SET archived_at = NOW(),
        notes = CONCAT_WS(E'\n', notes, '[ARCHIVED_PROVEN_OPENCLAW_FIXTURE] synthetic key-check record; historical dependencies retained.'),
        updated_at = NOW()
    WHERE id = ANY($1::bigint[])
  `, [rows.map((row) => row.id)]);
  await client.query("COMMIT");
  console.log(JSON.stringify({ archived: rows.map((row) => ({ id: row.id, companyName: row.company_name })) }));
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
