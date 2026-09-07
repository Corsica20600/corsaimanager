import {readFileSync} from 'node:fs';
const files=JSON.parse(readFileSync(new URL('./release-migrations.json',import.meta.url),'utf8'));
export function assertAdditive(sql){
 if(/\bDROP\s/i.test(sql))throw Error('Release migration contains forbidden removal');
 for(const s of sql.replace(/--[^\n]*/g,'').split(';').map(s=>s.trim().replace(/\s+/g,' ')).filter(Boolean)){
  if(!/^(BEGIN$|COMMIT$|CREATE TABLE\b|CREATE (UNIQUE )?INDEX\b|ALTER TABLE \S+ ADD (COLUMN|CONSTRAINT)\b|INSERT INTO\b)/i.test(s))throw Error('Non-additive release statement');
 }
}
for(const file of files)assertAdditive(readFileSync(file,'utf8'));
console.info('Current release migrations: additive, 0 DROP ('+files.length+' files).');

