import {describe,it,expect} from 'vitest';
import {classifyHistoricalProspect as classify,proposeAddress} from './historical-classification';
const now=new Date('2026-09-07T12:00:00Z');
const base={status:'nouveau',email:'contact@example.fr',createdAt:'2026-09-01',reliability:'RELIABLE'};
describe('historical CRM deterministic triage',()=>{
  for(const [patch,category] of [[{},'A'],[{status:'client'},'B'],[{replied:true},'C'],[{doNotContact:true},'D'],[{bounced:true},'D'],[{email:'invalid'},'E'],[{reliability:'UNVERIFIED'},'F'],[{duplicate:true},'G'],[{createdAt:'2025-01-01'},'H'],[{dormant:true},'H'],[{explicitTest:true},'I'],[{identityConflict:true},'J']] as const){
    it(`classifies ${JSON.stringify(patch)} as ${category}`,()=>expect(classify({...base,...patch},now).category).toBe(category));
  }
  it('ne confond pas une adresse syntaxiquement valide avec une preuve',()=>expect(classify({...base,reliability:undefined},now).category).toBe('F'));
  it('suppression reste prioritaire même pour client/test ancien',()=>expect(classify({...base,status:'client',doNotContact:true,explicitTest:true},now).category).toBe('D'));
  it('adresse proposée uniquement sourcée sans écrasement et conflit signalé',()=>{
    const proof={sourceUrl:'https://example.fr/contact',official:true,observedAt:'2026-09-01',values:{city:'Paris',country:'France'}};
    expect(proposeAddress({city:'Lyon'},[proof]).patch).toEqual({country:'France'});
    expect(proposeAddress({},[{...proof,official:false}]).patch).toEqual({});
    expect(proposeAddress({},[proof,{...proof,values:{city:'Lyon'}}]).conflicts).toContain('city');
  });
});
