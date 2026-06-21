module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},66680,(e,t,a)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},54653,e=>{"use strict";var t=e.i(38536),a=e.i(58075);let r="corsaimanager-internal",n="corsaimanager-seo",s="corsaimanager.com";async function i(e){let t=e?.range??"28d",r=process.env.GOOGLE_ANALYTICS_PROPERTY_ID??null,{startDate:n,endDate:s}=m(t),i=await (0,a.getGoogleConnectionStatus)(),o=i.scopes.includes(a.GOOGLE_ANALYTICS_READONLY_SCOPE);if(!i.connected||!r)return E({propertyId:r,range:t,startDate:n,endDate:s,hasAnalyticsScope:o,error:i.error??(r?"Compte Google non connecte.":"GOOGLE_ANALYTICS_PROPERTY_ID non configure.")});if(!o)return E({propertyId:r,range:t,startDate:n,endDate:s,hasAnalyticsScope:o,error:"Scope GA4 manquant. Relancez la connexion Google pour accepter analytics.readonly."});try{var c,l;let[e,a,i]=await Promise.all([u({propertyId:r,range:t}),u({propertyId:r,range:t,dimension:"pagePathPlusQueryString",limit:50}),u({propertyId:r,range:t,dimension:"sessionDefaultChannelGroup",limit:20})]),[E,m,L]=await Promise.all([u({propertyId:r,range:t,dimension:"landingPagePlusQueryString",limit:40}),u({propertyId:r,range:t,dimension:"eventName",limit:40}),u({propertyId:r,range:t,channelFilter:"Organic Search"})]),h=d(e.rows?.[0]?.metricValues??[]),y=d(L.rows?.[0]?.metricValues??[]),A=p(a.rows??[]).map(g),R=p(E.rows??[]).map(g),O=(c=i.rows??[],l="channel",c.map(e=>({[l]:e.dimensionValues?.[0]?.value??"(not set)",...d(e.metricValues??[]),..."path"===l?{entranceRate:0,conversions:function(e){return 0*_(e)}(e.metricValues?.[5]?.value),businessSeoScore:0}:{}}))),f=(m.rows??[]).map(e=>{var t,a;let r=d(e.metricValues??[]);return{eventName:e.dimensionValues?.[0]?.value??"(not set)",eventCount:r.eventCount,activeUsers:r.activeUsers,conversions:(t=e.dimensionValues?.[0]?.value??"",a=r.eventCount,/generate_lead|form_submit|audit_request|contact|conversion|calendly|cta_click/i.test(t)?a:0)}}),w=function(e,t,a){let r=[];for(let e of t){var n;e.sessions>=20&&0===e.conversions&&r.push({type:"traffic_no_conversion",page:e.path,title:"Trafic sans conversion",detail:`${e.path} g\xe9n\xe8re ${e.sessions} sessions mais aucun \xe9v\xe9nement de conversion d\xe9tect\xe9.`,priority:e.sessions>=80?"Critique":"Haute",action:"Ajouter ou renforcer CTA, preuve sociale, formulaire et tracking d'événement."}),e.sessions>=10&&e.engagementRate<.45&&r.push({type:"good_position_low_engagement",page:e.path,title:"Engagement faible",detail:`${e.path} a un taux d'engagement de ${(n=e.engagementRate,`${(100*n).toFixed(1)}%`)}.`,priority:"Haute",action:"Clarifier la promesse, ajouter sections de réassurance et améliorer le premier écran."})}for(let t of e)t.pageViews>=30&&t.sessions<8&&r.push({type:"clicks_low_visits",page:t.path,title:"Vues sans parcours clair",detail:`${t.path} a ${t.pageViews} vues mais peu de sessions qualifi\xe9es.`,priority:"Moyenne",action:"Vérifier les liens internes, le CTA et la cohérence entre intention SEO et contenu."});return a.sessions>0&&r.push({type:"organic_growth",page:"Organic Search",title:"Trafic organique mesurable",detail:`${a.sessions} sessions SEO d\xe9tect\xe9es sur la p\xe9riode.`,priority:"Moyenne",action:"Croiser les pages organiques avec Search Console pour prioriser conversion et maillage."}),r.push({type:"cta_tracking",page:"tracking",title:"Préparer le suivi conversion",detail:"Prévoir le suivi des formulaires, clics CTA, demandes d'audit et Calendly.",priority:"Haute",action:"Normaliser les événements GA4: form_submit, cta_click, audit_request, calendly_booking."}),r.slice(0,24)}(A,R,y);return await T(r,t,n,s,A),await N(r,t,n,s,f),await v(r,w),{connected:!0,propertyId:r,range:t,startDate:n,endDate:s,hasAnalyticsScope:o,summary:h,organicSummary:y,pages:A,landingPages:R,channels:O,events:f,businessOpportunities:w}}catch(e){return E({propertyId:r,range:t,startDate:n,endDate:s,hasAnalyticsScope:o,error:e instanceof Error?e.message:"Impossible de recuperer les donnees GA4."})}}async function o(e){let t=await i(e);return{connected:t.connected,propertyId:t.propertyId,range:t.range,startDate:t.startDate,endDate:t.endDate,summary:t.summary,organicSummary:t.organicSummary,channels:t.channels,error:t.error}}async function c(e){let t=await i(e);return{connected:t.connected,propertyId:t.propertyId,range:t.range,pages:t.pages,landingPages:t.landingPages,businessOpportunities:t.businessOpportunities,error:t.error}}async function l(e){let t=await i(e);return{connected:t.connected,propertyId:t.propertyId,range:t.range,events:t.events,error:t.error}}async function u({propertyId:e,range:t,dimension:r,channelFilter:n,limit:s=1}){let i=await (0,a.getGoogleAccessToken)(),{startDate:o,endDate:c}=m(t),l=await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${e}:runReport`,{method:"POST",headers:{authorization:`Bearer ${i}`,"content-type":"application/json"},body:JSON.stringify({dateRanges:[{startDate:o,endDate:c}],dimensions:r?[{name:r}]:void 0,metrics:[{name:"activeUsers"},{name:"sessions"},{name:"screenPageViews"},{name:"engagementRate"},{name:"averageSessionDuration"},{name:"eventCount"}],orderBys:r?[{metric:{metricName:"sessions"},desc:!0}]:void 0,dimensionFilter:n?{filter:{fieldName:"sessionDefaultChannelGroup",stringFilter:{matchType:"EXACT",value:n}}}:void 0,limit:s}),signal:AbortSignal.timeout(18e3)}),d=await l.json();if(!l.ok)throw Error(d.error?.message??"Erreur API Google Analytics Data.");return d}function d(e){return{activeUsers:_(e[0]?.value),sessions:_(e[1]?.value),pageViews:_(e[2]?.value),engagementRate:_(e[3]?.value),averageSessionDuration:_(e[4]?.value),eventCount:_(e[5]?.value)}}function p(e){return e.map(e=>({path:e.dimensionValues?.[0]?.value??"(not set)",...d(e.metricValues??[]),entranceRate:0,conversions:0*_(e.metricValues?.[5]?.value),businessSeoScore:0}))}function g(e){let t=Math.min(35,35*e.engagementRate),a=Math.min(25,12*Math.log10(Math.max(1,e.sessions))),r=Math.min(30,8*e.conversions),n=Math.min(10,5*Math.log10(Math.max(1,e.pageViews)));return{...e,businessSeoScore:Math.max(0,Math.min(100,Math.round(t+a+r+n)))}}async function T(e,a,i,o,c){if(process.env.DATABASE_URL&&c.length)try{let l=(0,t.getNeonClient)();for(let t of(await l`
      CREATE TABLE IF NOT EXISTS ga4_page_metrics (
        id BIGSERIAL PRIMARY KEY,
        account_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        site_id TEXT NOT NULL,
        property_id TEXT NOT NULL,
        page_path TEXT NOT NULL,
        range_label TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        active_users INTEGER NOT NULL DEFAULT 0,
        sessions INTEGER NOT NULL DEFAULT 0,
        page_views INTEGER NOT NULL DEFAULT 0,
        engagement_rate NUMERIC(10, 6) NOT NULL DEFAULT 0,
        average_session_duration NUMERIC(10, 4) NOT NULL DEFAULT 0,
        event_count INTEGER NOT NULL DEFAULT 0,
        conversions INTEGER NOT NULL DEFAULT 0,
        business_seo_score INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(account_id, project_id, property_id, page_path, range_label, start_date, end_date)
      )
    `,await l`
      DELETE FROM ga4_page_metrics
      WHERE account_id = ${r}
        AND project_id = ${n}
        AND property_id = ${e}
        AND range_label = ${a}
        AND start_date = ${i}
        AND end_date = ${o}
    `,c))await l`
        INSERT INTO ga4_page_metrics (
          account_id,
          project_id,
          site_id,
          property_id,
          page_path,
          range_label,
          start_date,
          end_date,
          active_users,
          sessions,
          page_views,
          engagement_rate,
          average_session_duration,
          event_count,
          conversions,
          business_seo_score,
          updated_at
        )
        VALUES (
          ${r},
          ${n},
          ${s},
          ${e},
          ${t.path},
          ${a},
          ${i},
          ${o},
          ${t.activeUsers},
          ${t.sessions},
          ${t.pageViews},
          ${t.engagementRate},
          ${t.averageSessionDuration},
          ${t.eventCount},
          ${t.conversions},
          ${t.businessSeoScore},
          NOW()
        )
      `}catch(t){console.warn("[google-analytics] Page metrics persistence skipped",{error:t instanceof Error?t.message:t,propertyId:e,range:a})}}async function N(e,a,i,o,c){if(process.env.DATABASE_URL&&c.length)try{let l=(0,t.getNeonClient)();for(let t of(await l`
      CREATE TABLE IF NOT EXISTS ga4_events (
        id BIGSERIAL PRIMARY KEY,
        account_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        site_id TEXT NOT NULL,
        property_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        range_label TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        event_count INTEGER NOT NULL DEFAULT 0,
        active_users INTEGER NOT NULL DEFAULT 0,
        conversions INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,await l`
      DELETE FROM ga4_events
      WHERE account_id = ${r}
        AND project_id = ${n}
        AND property_id = ${e}
        AND range_label = ${a}
        AND start_date = ${i}
        AND end_date = ${o}
    `,c))await l`
        INSERT INTO ga4_events (
          account_id,
          project_id,
          site_id,
          property_id,
          event_name,
          range_label,
          start_date,
          end_date,
          event_count,
          active_users,
          conversions,
          updated_at
        )
        VALUES (
          ${r},
          ${n},
          ${s},
          ${e},
          ${t.eventName},
          ${a},
          ${i},
          ${o},
          ${t.eventCount},
          ${t.activeUsers},
          ${t.conversions},
          NOW()
        )
      `}catch(t){console.warn("[google-analytics] Event metrics persistence skipped",{error:t instanceof Error?t.message:t,propertyId:e,range:a})}}async function v(e,a){if(process.env.DATABASE_URL&&a.length)try{let i=(0,t.getNeonClient)();for(let t of(await i`
      CREATE TABLE IF NOT EXISTS seo_business_opportunities (
        id BIGSERIAL PRIMARY KEY,
        account_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        site_id TEXT NOT NULL,
        property_id TEXT NOT NULL,
        page_path TEXT NOT NULL,
        opportunity_type TEXT NOT NULL,
        priority TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,a))await i`
        INSERT INTO seo_business_opportunities (
          account_id,
          project_id,
          site_id,
          property_id,
          page_path,
          opportunity_type,
          priority,
          title,
          detail,
          action,
          updated_at
        )
        VALUES (
          ${r},
          ${n},
          ${s},
          ${e},
          ${t.page},
          ${t.type},
          ${t.priority},
          ${t.title},
          ${t.detail},
          ${t.action},
          NOW()
        )
      `}catch(t){console.warn("[google-analytics] Business opportunities persistence skipped",{error:t instanceof Error?t.message:t,propertyId:e})}}function E(e){return{connected:!1,propertyId:e.propertyId,range:e.range,startDate:e.startDate,endDate:e.endDate,hasAnalyticsScope:e.hasAnalyticsScope,summary:{activeUsers:0,sessions:0,pageViews:0,engagementRate:0,averageSessionDuration:0,eventCount:0},organicSummary:{activeUsers:0,sessions:0,pageViews:0,engagementRate:0,averageSessionDuration:0,eventCount:0},pages:[],landingPages:[],channels:[],events:[],businessOpportunities:[],error:e.error}}function m(e){let t=new Date;t.setDate(t.getDate()-2);let a=new Date(t);return a.setDate(a.getDate()-("28d"===e?27:89)),{startDate:a.toISOString().slice(0,10),endDate:t.toISOString().slice(0,10)}}function _(e){return Number(e??0)}e.s(["getGa4Events",0,l,"getGa4Overview",0,o,"getGa4Pages",0,c])},68193,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),s=e.i(61916),i=e.i(74677),o=e.i(69741),c=e.i(16795),l=e.i(87718),u=e.i(95169),d=e.i(47587),p=e.i(66012),g=e.i(70101),T=e.i(26937),N=e.i(10372),v=e.i(93695);e.i(52474);var E=e.i(220),m=e.i(89171),_=e.i(78497),L=e.i(54653);async function h(e){if(!await (0,_.isAdminAuthenticated)())return m.NextResponse.json({error:"Non autorise."},{status:401});let{searchParams:t}=new URL(e.url),a="3m"===t.get("range")?"3m":"28d",r=await (0,L.getGa4Overview)({range:a});return m.NextResponse.json(r)}e.s(["GET",0,h,"dynamic",0,"force-dynamic"],35286);var y=e.i(35286);let A=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/google/analytics/overview/route",pathname:"/api/google/analytics/overview",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/google/analytics/overview/route.ts",nextConfigOutput:"",userland:y,...{}}),{workAsyncStorage:R,workUnitAsyncStorage:O,serverHooks:f}=A;async function w(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),A.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/google/analytics/overview/route";m=m.replace(/\/index$/,"")||"/";let _=await A.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!_)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:L,deploymentId:h,params:y,nextConfig:R,parsedUrl:O,isDraftMode:f,prerenderManifest:w,routerServerContext:U,isOnDemandRevalidate:x,revalidateOnlyGenerated:S,resolvedPathname:D,clientReferenceManifest:I,serverActionsManifest:C}=_,$=(0,o.normalizeAppPath)(m),b=!!(w.dynamicRoutes[$]||w.routes[D]),P=async()=>((null==U?void 0:U.render404)?await U.render404(e,t,O,!1):t.end("This page could not be found"),null);if(b&&!f){let e=!!w.routes[D],t=w.dynamicRoutes[$];if(t&&!1===t.fallback&&!e){if(R.adapterPath)return await P();throw new v.NoFallbackError}}let M=null;!b||A.isDev||f||(M="/index"===(M=D)?"/":M);let G=!0===A.isDev||!b,F=b&&!G;C&&I&&(0,i.setManifestsSingleton)({page:m,clientReferenceManifest:I,serverActionsManifest:C});let k=e.method||"GET",j=(0,s.getTracer)(),q=j.getActiveScopeSpan(),X=!!(null==U?void 0:U.isWrappedByNextServer),V=!!(0,n.getRequestMeta)(e,"minimalMode"),H=(0,n.getRequestMeta)(e,"incrementalCache")||await A.getIncrementalCache(e,R,w,V);null==H||H.resetRequestCache(),globalThis.__incrementalCache=H;let B={params:y,previewProps:w.preview,renderOpts:{experimental:{authInterrupts:!!R.experimental.authInterrupts},cacheComponents:!!R.cacheComponents,supportsDynamicResponse:G,incrementalCache:H,cacheLifeProfiles:R.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>A.onRequestError(e,t,r,n,U)},sharedContext:{buildId:L,deploymentId:h}},W=new c.NodeNextRequest(e),Y=new c.NodeNextResponse(t),K=l.NextRequestAdapter.fromNodeNextRequest(W,(0,l.signalFromNodeResponse)(t));try{let n,i=async e=>A.handle(K,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=j.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${k} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",r),n.updateName(t))}else e.updateName(`${k} ${m}`)}),o=async n=>{var s,o;let c=async({previousCacheEntry:a})=>{try{if(!V&&x&&S&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await i(n);e.fetchMetrics=B.renderOpts.fetchMetrics;let o=B.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let c=B.renderOpts.collectedTags;if(!b)return await (0,p.sendResponse)(W,Y,s,B.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,g.toNodeOutgoingHttpHeaders)(s.headers);c&&(t[N.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,r=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:E.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await A.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:x})},!1,U),t}},l=await A.handleResponse({req:e,nextConfig:R,cacheKey:M,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:w,isRoutePPREnabled:!1,isOnDemandRevalidate:x,revalidateOnlyGenerated:S,responseGenerator:c,waitUntil:r.waitUntil,isMinimalMode:V});if(!b)return null;if((null==l||null==(s=l.value)?void 0:s.kind)!==E.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(o=l.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});V||t.setHeader("x-nextjs-cache",x?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),f&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,g.fromNodeOutgoingHttpHeaders)(l.value.headers);return V&&b||u.delete(N.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,T.getCacheControlHeader)(l.cacheControl)),await (0,p.sendResponse)(W,Y,new Response(l.value.body,{headers:u,status:l.value.status||200})),null};X&&q?await o(q):(n=j.getActiveScopeSpan(),await j.withPropagatedContext(e.headers,()=>j.trace(u.BaseServerSpan.handleRequest,{spanName:`${k} ${m}`,kind:s.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},o),void 0,!X))}catch(t){if(t instanceof v.NoFallbackError||await A.onRequestError(e,t,{routerKind:"App Router",routePath:$,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:x})},!1,U),b)throw t;return await (0,p.sendResponse)(W,Y,new Response(null,{status:500})),null}}e.s(["handler",0,w,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:R,workUnitAsyncStorage:O})},"routeModule",0,A,"serverHooks",0,f,"workAsyncStorage",0,R,"workUnitAsyncStorage",0,O],68193)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0lzy267._.js.map