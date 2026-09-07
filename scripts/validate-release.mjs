import {existsSync} from 'node:fs';
import {loadEnvFile} from 'node:process';
import {spawnSync} from 'node:child_process';
if(existsSync('.env.release.local'))loadEnvFile('.env.release.local');
let url;try{url=new URL(process.env.CRM_TEST_DATABASE_URL??'');}catch{/* fail closed */}
if(!url||!['postgres:','postgresql:'].includes(url.protocol)||!['localhost','127.0.0.1'].includes(url.hostname)||url.port!=='55439'||url.pathname!=='/crm_foundations_test'){
 console.error('Release requires the dedicated local crm_foundations_test database. No Production fallback.');process.exit(1);
}
const env={...process.env,DATABASE_URL:url.toString(),DIRECT_URL:url.toString()};
const baseline=spawnSync(process.execPath,['scripts/check-test-baseline.mjs'],{stdio:'inherit',env});
if(baseline.status!==0)process.exit(baseline.status??1);
const guard=spawnSync(process.execPath,['scripts/check-release-migrations.mjs'],{stdio:'inherit',env});
if(guard.status!==0)process.exit(guard.status??1);
for(const name of ['typecheck','lint','test','test:critical-postgres','build']){
 const r=spawnSync(process.execPath,[process.env.npm_execpath,'run',name],{stdio:'inherit',env});
 if(r.status!==0)process.exit(r.status??1);
}
