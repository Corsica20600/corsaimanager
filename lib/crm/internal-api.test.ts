import { beforeEach, expect, it } from "vitest";
import { authorizeCrm, readCrmJson, crmError } from './internal-api';
import { parseImport } from './atomic-import';
import { recordContactEvent } from './contact-events';
beforeEach(()=>{process.env.CORSAIMANAGER_API_KEY='new-test-key';process.env.OPENCLAW_AGENT_API_KEY='legacy-test-key';process.env.CORSAIMANAGER_API_KEYS_PREVIOUS='old-test-key';});
it('rotation et clé Production legacy restent acceptées, fausse clé refusée',()=>{
  for(const key of ['new-test-key','legacy-test-key','old-test-key']) expect(authorizeCrm(new Request('http://local',{headers:{authorization:`Bearer ${key}`}}))).toBe(true);
  expect(authorizeCrm(new Request('http://local',{headers:{authorization:'Bearer invalid'}}))).toBe(false);
});
it('JSON null, tableau, tenant Sentieru et surcharge refusés',async()=>{
  for(const value of [null,[],{tenant:'sentieru'}]) await expect(readCrmJson(new Request('http://local',{method:'POST',body:JSON.stringify(value)}))).rejects.toThrow();
  await expect(readCrmJson(new Request('http://local',{method:'POST',body:' '.repeat(50001)}))).rejects.toMatchObject({status:413});
});
it('contrat runtime refuse score, identité incomplète et source étrangère',()=>{
  for(const value of [{company_name:'Test',quality_score:101},{company_name:'Test',source_system:'ai-team'},{company_name:'Test',source_system:'sentieru'}]) expect(()=>parseImport(value)).toThrow();
});
it('event tenant/source interdit et prospect invalide => aucune requête',async()=>{
  const execute=async()=>{throw new Error('unexpected database');};
  await expect(recordContactEvent({sourceSystem:'sentieru'},execute)).rejects.toMatchObject({status:403});
  await expect(recordContactEvent({sourceSystem:'ai-team',prospectId:'-1'},execute)).rejects.toMatchObject({status:400});
});
it('erreur interne masquée sans secret',async()=>{
  const result=crmError(new Error('password=secret provider detail'));
  expect(result.status).toBe(503);
  expect(await result.text()).not.toContain('secret');
});
