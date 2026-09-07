import {getNeonClient} from '../neon';
/** Suppression facts remain global; only the current sequence counter/state is versioned. */
export async function readCanonicalCommercialState<T extends {id:unknown;commercial_state?:unknown;follow_up_count?:unknown;next_action_at?:unknown}>(legacy:T,read:(id:unknown)=>Promise<Record<string,unknown>[]>=id=>getNeonClient().query('SELECT * FROM crm_commercial_state WHERE prospect_id=$1',[id])):Promise<T>{
 const rows=await read(legacy.id);
 const current=rows[0];if(!current)return legacy;
 const stopped=['DO_NOT_CONTACT','BOUNCED','REPLIED','DORMANT','CLIENT'].includes(String(legacy.commercial_state));
 return {...legacy,commercial_state:stopped?legacy.commercial_state:current.state==='SEQUENCE_REACTIVATED'?'ACTIVE_ELIGIBLE':current.state,follow_up_count:current.follow_up_count,next_action_at:stopped?null:current.next_action_at};
}
