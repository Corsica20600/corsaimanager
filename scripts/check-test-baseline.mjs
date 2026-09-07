import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
// These inputs are read as immutable text, never submitted to PostgreSQL.
const names=['create-crm-tables.sql','20260905-crm-foundations.sql','20260907-commercial-history.sql','create-leads-table.sql','20260907-crm-lead-link.sql'];
const parts=names.map(n=>readFileSync('sql/'+n,'utf8').trim());
const kinds=parts[2].match(/ADD CONSTRAINT crm_contact_events_kind_check CHECK \(kind IN \((.*?)\)\)/)?.[1];
assert.ok(kinds,'Historical baseline changed: review snapshot generation');
parts[1]=parts[1].replace(/kind TEXT NOT NULL CHECK \(kind IN \([^)]*\)\)/,'kind TEXT NOT NULL CHECK (kind IN ('+kinds+'))');
parts[2]=parts[2].split(/\r?\n/).filter(l=>!l.includes('DROP CONSTRAINT')&&!l.includes('ADD CONSTRAINT crm_contact_events_kind_check')).join('\n');
const header='-- TEST BASELINE ONLY: consolidated pre-rehabilitation schema, 2026-09-07.\n-- Historical SQL files are immutable references; never executed by release tests.\n-- Contact-event CHECK is created once with the already established email event kinds.\n';
const expected=(header+parts.join('\n\n')+'\n').replace(/\r\n/g,'\n').trim();
const snapshot=readFileSync('sql/test/crm-baseline.sql','utf8').replace(/\r\n/g,'\n').trim();
assert.equal(snapshot,expected,'Snapshot drift: review consolidated baseline');
assert.doesNotMatch(snapshot,/\bDROP\s/i);
console.info('Canonical test snapshot verified; historical scripts are not executed.');
