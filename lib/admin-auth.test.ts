import { beforeEach, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
const {rows,cookie,query}=vi.hoisted(()=>({rows:new Map<string,{expires:Date;revoked:boolean}>(),cookie:{value:''},query:vi.fn()}));
vi.mock('./neon',()=>({getNeonClient:()=>({query})}));
vi.mock('next/headers',()=>({cookies:async()=>({get:()=>({value:cookie.value}),set:(_n:string,value:string)=>{cookie.value=value;},delete:()=>{cookie.value='';}})}));
vi.mock('next/cache',()=>({revalidatePath:vi.fn()}));
vi.mock('next/navigation',()=>({redirect:()=>{throw new Error('redirect');}}));
beforeEach(()=>{
  rows.clear();cookie.value='';query.mockReset();
  query.mockImplementation(async(text:string,values:unknown[])=>{
    const key=String(values[0]);
    if(text.startsWith('INSERT')) rows.set(key,{expires:new Date(String(values[1])),revoked:false});
    if(text.startsWith('UPDATE')) {const row=rows.get(key);if(row) row.revoked=true;}
    const row=rows.get(key);
    return text.startsWith('SELECT')&&row&&!row.revoked&&row.expires>new Date()?[{token_hash:key}]:[];
  });
});
it('cookie legacy et falsifié refusés',async()=>{
  const {isAdminAuthenticated}=await import('./admin-auth');
  for(const value of ['1','forged','a'.repeat(64)]){cookie.value=value;expect(await isAdminAuthenticated()).toBe(false);}
});
it('session valide opaque acceptée, expiration serveur et révocation contrôlées',async()=>{
  const auth=await import('./admin-auth');
  await auth.setAdminSession();expect(await auth.isAdminAuthenticated()).toBe(true);
  const token=cookie.value;expect(token).toHaveLength(64);
  expect(rows.has(token)).toBe(false);
  rows.get(createHash('sha256').update(token).digest('hex'))!.expires=new Date(0);
  expect(await auth.isAdminAuthenticated()).toBe(false);
  await auth.setAdminSession();const newToken=cookie.value;
  await auth.clearAdminSession();cookie.value=newToken;
  expect(await auth.isAdminAuthenticated()).toBe(false);
});
it('action administrative sensible refuse absence de session avant toute mutation',async()=>{
  const {setLeadStatusAction,updateLeadNotesAction,generateProposalForLead}=await import('../app/admin/actions');
  await expect(setLeadStatusAction(new FormData())).rejects.toThrow('Non autorisé');
  await expect(updateLeadNotesAction(new FormData())).rejects.toThrow('Non autorisé');
  await expect(generateProposalForLead(155)).rejects.toThrow('Non autorisé');
  expect(query).not.toHaveBeenCalled();
});
