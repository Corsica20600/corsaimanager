import { spawnSync } from "node:child_process";
let url;
try {url=new URL(process.env.CRM_TEST_DATABASE_URL??"");} catch { /* reject below */ }
if(!url || !["postgres:","postgresql:"].includes(url.protocol) || !["localhost","127.0.0.1"].includes(url.hostname) || url.port!=="55439" || url.pathname!=="/crm_foundations_test") {
  console.error("CRM critical PostgreSQL tests require the dedicated local crm_foundations_test database; no fallback to DATABASE_URL.");
  process.exit(1);
}
const result=spawnSync(process.execPath,["node_modules/vitest/vitest.mjs","run","lib/crm/foundations.postgres.test.ts"],{stdio:"inherit",env:process.env});
process.exit(result.status??1);
