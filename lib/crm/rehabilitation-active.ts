import { CrmInputError } from './internal-api';

const record=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const norm=(v:unknown)=>String(v??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const emailValid=(v:unknown)=>typeof v==='string'&&/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(v);
const phoneValid=(v:unknown)=>typeof v==='string'&&/^\+?[\d () .-]{9,30}$/.test(v)&&v.replace(/\D/g,'').length>=9;
const host=(v:unknown)=>{try{const u=new URL(String(v).startsWith('https://')?String(v):`https://${v}`);return u.hostname.toLowerCase().replace(/^www\./,'');}catch{return '';}};
function fail(reason:string):never {throw new CrmInputError(reason,409);}
export type ActiveAuthorization={minimumQualityScore:number;minimumCommercialScore:number;identity:Record<string,unknown>};
export function parseActiveAuthorization(value:unknown):ActiveAuthorization|undefined {
  if(value===undefined)return undefined;
  const p=record(value);
  if(Object.keys(p).some(k=>!['minimumQualityScore','minimumCommercialScore','identity'].includes(k))
    ||![p.minimumQualityScore,p.minimumCommercialScore].every(n=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=100))throw new CrmInputError('REHABILITATION_AUTHORIZATION_INVALID');
  const identity=record(p.identity);
  if(typeof identity.id!=='string'||!identity.id||identity.id.length>200
    ||Object.keys(identity).some(k=>!['id','name','email','phone','website','city','country','remoteId'].includes(k))
    ||Object.values(identity).some(v=>v!==null&&(typeof v!=='string'||v.length>2000)))throw new CrmInputError('REHABILITATION_IDENTITY_INVALID');
  return {minimumQualityScore:p.minimumQualityScore as number,minimumCommercialScore:p.minimumCommercialScore as number,identity};
}

/** Pure patch builder. All fields are compared again atomically with the database snapshot. */
export function activeRehabilitationPatch(crm:Record<string,unknown>,proposal:Record<string,unknown>,auth:ActiveAuthorization|undefined,now=new Date()) {
  if(!auth)fail('REHABILITATION_FRESH_POLICY_REQUIRED');
  if(!['RELIABLE','VERIFIED'].includes(String(proposal.reliability))||!emailValid(proposal.selectedEmail))fail('REHABILITATION_EMAIL_UNVERIFIED');
  if(![proposal.qualityScore,proposal.commercialScore].every(v=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=100)
    ||Number(proposal.qualityScore)<auth.minimumQualityScore||Number(proposal.commercialScore)<auth.minimumCommercialScore)fail('REHABILITATION_SCORE_BELOW_POLICY');
  if(proposal.match!=='MATCH_CONFIRMED'||typeof proposal.itemId!=='string'||proposal.itemId!==auth.identity.id)fail('REHABILITATION_IDENTITY_UNCERTAIN');
  if((crm.source_entity_id&&crm.source_entity_id!==proposal.itemId)||(crm.source_system&&crm.source_system!=='ai-team'))fail('REHABILITATION_IDENTITY_CONFLICT');
  const i=auth.identity;
  const source=crm.source_system==='ai-team'&&crm.source_entity_id===i.id;
  const remote=i.remoteId===String(crm.id);
  const sameName=!!norm(crm.company_name)&&norm(crm.company_name)===norm(i.name);
  const samePlace=!!norm(crm.city)&&!!norm(crm.country)&&norm(crm.city)===norm(i.city)&&norm(crm.country)===norm(i.country);
  const sameEmail=!!crm.email&&String(crm.email).toLowerCase()===String(i.email).toLowerCase();
  const samePhone=norm(crm.phone).length>=9&&norm(crm.phone)===norm(i.phone);
  const sameSite=!!crm.website&&host(crm.website)===host(i.website);
  if((i.remoteId&&i.remoteId!==String(crm.id))||(crm.country&&i.country&&norm(crm.country)!==norm(i.country))
    ||!(source||remote||(sameName&&samePlace&&(sameEmail||samePhone||sameSite))||(sameName&&sameEmail&&samePhone)))fail('REHABILITATION_IDENTITY_UNCERTAIN');
  const official=host(crm.website);
  if(!crm.website||!official)fail('REHABILITATION_PROVENANCE_INVALID');
  if(!Array.isArray(proposal.evidence)||proposal.evidence.length>30)fail('REHABILITATION_PROVENANCE_INVALID');
  const evidence=proposal.evidence.map(record).filter(e=>{
    try{const u=new URL(String(e.sourceUrl));const date=Date.parse(String(e.observedAt));
      return u.protocol==='https:'&&!u.username&&!u.password&&host(u.href)===official&&Number.isFinite(date)&&date<=+now&&+now-date<=30*86400000;
    }catch{return false;}
  });
  const selected=String(proposal.selectedEmail).toLowerCase();
  if(!evidence.some(e=>String(e.email??'').toLowerCase()===selected)||selected.split('@')[1]!==official)fail('REHABILITATION_EMAIL_PROVENANCE_INVALID');
  const metadata=record(crm.origin_metadata);
  const rank=(v:unknown)=>v==='VERIFIED'?3:v==='RELIABLE'?2:0;
  let email=selected;
  if(crm.email&&String(crm.email).toLowerCase()!==selected&&emailValid(crm.email)) {
    if(rank(metadata.emailReliability)>=rank(proposal.reliability))email=String(crm.email);
    else if(!['UNVERIFIED','INVALID'].includes(String(metadata.emailReliability)))fail('REHABILITATION_EMAIL_CONFLICT');
  }
  const patch:Record<string,unknown>={email,quality_score:proposal.qualityScore,commercial_score:proposal.commercialScore,
    source_system:'ai-team',source_entity_id:proposal.itemId,commercial_state:'ACTIVE_ELIGIBLE'};
  const accepted:Record<string,unknown>[]=[];
  for(const e of evidence) {
    const clean:Record<string,unknown>={source:'ai-team-rehabilitation',sourceUrl:e.sourceUrl,observedAt:e.observedAt};
    if(e.email===selected)clean.email=selected;
    if(phoneValid(proposal.selectedPhone)&&!crm.phone&&e.phone===proposal.selectedPhone
      &&new Set(evidence.map(x=>x.phone).filter(phoneValid)).size===1){patch.phone=proposal.selectedPhone;clean.phone=e.phone;}
    const address=record(e.address),requested=record(proposal.addressProposal),proven:Record<string,string>={};
    for(const key of ['address_line1','postal_code','city','region','country']) {
      const v=requested[key];
      if(typeof v==='string'&&v.trim()&&v.length<=250&&v===address[key]&&!crm[key]
        &&new Set(evidence.map(x=>record(x.address)[key]).filter(Boolean)).size===1){patch[key]=v;proven[key]=v;}
    }
    if(Object.keys(proven).length)clean.address=proven;
    accepted.push(clean);
  }
  const old=Array.isArray(crm.provenance)?crm.provenance:crm.provenance?[crm.provenance]:[];
  patch.provenance=[...old,...accepted.filter(e=>!old.some(o=>JSON.stringify(o)===JSON.stringify(e)))];
  const retainedReliability=String(crm.email??'').toLowerCase()===email.toLowerCase()&&rank(metadata.emailReliability)>rank(proposal.reliability);
  patch.origin_metadata={...metadata,emailReliability:email===selected&&!retainedReliability?proposal.reliability:metadata.emailReliability,
    rehabilitation:{proposalKey:proposal.proposalKey,decision:'ACTIVE_ELIGIBLE',appliedAt:now.toISOString(),emailSequencePrepared:false}};
  return patch;
}
