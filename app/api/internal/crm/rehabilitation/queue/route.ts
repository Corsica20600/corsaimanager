import {NextResponse} from 'next/server';
import {authorizeCrm,readCrmJson,crmError,CrmInputError} from '@/lib/crm/internal-api';
import {RehabilitationQueue} from '@/lib/crm/rehabilitation-queue';
/** Control-plane state only. Business mutations are exclusively in /apply through CRM_SYNC. */
export async function POST(request:Request) {
  if(!authorizeCrm(request)) return NextResponse.json({error:'Non autorisé.'},{status:401});
  try {
    const p=await readCrmJson(request);
    if(p.tenant!=='corsaimanager') throw new CrmInputError('Tenant interdit.',403);
    const q=new RehabilitationQueue();
    if(p.operation==='claim') { await q.seed(); return NextResponse.json({jobs:await q.claim()}); }
    if(p.operation==='pending') return NextResponse.json({jobs:await q.pendingApplications()});
    if(p.operation==='deferBatch') {
      if(!Array.isArray(p.jobs)||p.jobs.length>5)throw new CrmInputError('Lot invalide.');
      const jobs=p.jobs.map((raw:unknown)=>{
        if(!raw||typeof raw!=='object')throw new CrmInputError('Bail invalide.');
        const j=raw as Record<string,unknown>;
        if(typeof j.prospectId!=='string'||!/^[1-9][0-9]{0,17}$/.test(j.prospectId)||typeof j.token!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(j.token))throw new CrmInputError('Bail invalide.');
        return {prospectId:j.prospectId,token:j.token};
      });
      return NextResponse.json({count:await q.deferBudgetBatch(jobs)});
    }
    if(typeof p.prospectId!=='string'||!/^[1-9][0-9]{0,17}$/.test(p.prospectId)) throw new CrmInputError('Identité invalide.');
    if(p.operation==='snapshot') return NextResponse.json({prospect:await q.snapshot(p.prospectId)});
    if(typeof p.token!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(p.token)) throw new CrmInputError('Bail invalide.');
    if(p.operation==='defer') return NextResponse.json({ok:await q.defer(p.prospectId,p.token,p.budgetOnly===true)});
    if(!p.value||typeof p.value!=='object'||Array.isArray(p.value)) throw new CrmInputError('Proposition invalide.');
    if(p.operation==='checkpoint') return NextResponse.json({ok:await q.checkpoint(p.prospectId,p.token,p.value as Record<string,unknown>)});
    if(p.operation==='complete') return NextResponse.json({ok:await q.complete(p.prospectId,p.token,p.value as Record<string,unknown>)});
    throw new CrmInputError('Opération invalide.');
  } catch(e) { return crmError(e); }
}
