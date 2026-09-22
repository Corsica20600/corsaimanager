import {describe,it,expect} from 'vitest';
import {classifyHistoricalProspect as classify,proposeAddress,presentEmailReliability,presentProspectStatus} from './historical-classification';
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
  it('ne présente jamais une relance historique expirée comme une prochaine action',()=>{
    expect(presentProspectStatus({status:'relance prévue',nextFollowUpAt:'2026-01-01T10:00:00Z',now}).label).toBe('À requalifier');
    expect(presentProspectStatus({status:'relance prévue',nextFollowUpAt:'2026-01-01T10:00:00Z',now}).nextActionAt).toBeNull();
  });
  it('présente les décisions historiques et une relance active avec un statut métier',()=>{
    expect(presentProspectStatus({status:'nouveau',email:'a@b.fr',rehabilitationClassification:'REQUALIFY',now}).label).toBe('À requalifier');
    expect(presentProspectStatus({status:'contacté',email:'a@b.fr',followUpCount:1,nextActionAt:'2026-09-08T12:00:00Z',now}).label).toBe('Relance 2 prévue');
    expect(presentProspectStatus({status:'nouveau',email:null,now}).label).toBe('À enrichir');
  });
  it('ne présente jamais UNKNOWN comme VERIFIED ou RELIABLE',()=>{
    expect(presentEmailReliability({email:null})).toBe('MISSING');
    expect(presentEmailReliability({email:'invalid'})).toBe('INVALID');
    expect(presentEmailReliability({email:'a@b.fr'})).toBe('UNKNOWN');
    expect(presentEmailReliability({email:'a@b.fr',bounced:true})).toBe('BOUNCED');
  });
});
