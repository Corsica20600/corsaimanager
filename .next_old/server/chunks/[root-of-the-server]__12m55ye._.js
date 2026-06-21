module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},86968,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),o=e.i(61916),i=e.i(74677),s=e.i(69741),l=e.i(16795),d=e.i(87718),p=e.i(95169),u=e.i(47587),c=e.i(66012),T=e.i(70101),E=e.i(26937),N=e.i(10372),R=e.i(93695);e.i(52474);var x=e.i(220),m=e.i(89171),h=e.i(78497),g=e.i(38536);async function v(e){if(!await (0,h.isAdminAuthenticated)())return m.NextResponse.json({error:"Non autorise."},{status:401});let t=await e.json();try{let e=await _(t);return m.NextResponse.json({ok:!0,exportId:e})}catch(e){return m.NextResponse.json({error:e instanceof Error?e.message:"Export non historise."},{status:500})}}async function _(e){let t=(0,g.getNeonClient)();await t`
    CREATE TABLE IF NOT EXISTS seo_exports (
      id BIGSERIAL PRIMARY KEY,
      account_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      export_type TEXT NOT NULL,
      pages_count INTEGER NOT NULL DEFAULT 0,
      opportunities_count INTEGER NOT NULL DEFAULT 0,
      average_score INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,await t`
    CREATE TABLE IF NOT EXISTS seo_action_plan_items (
      id BIGSERIAL PRIMARY KEY,
      export_id BIGINT REFERENCES seo_exports(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      level TEXT NOT NULL,
      priority TEXT NOT NULL,
      page_url TEXT NOT NULL,
      problem TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      estimated_impact TEXT NOT NULL,
      estimated_effort TEXT NOT NULL,
      data_used TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;let r=await t`
    INSERT INTO seo_exports (
      account_id,
      project_id,
      site_id,
      export_type,
      pages_count,
      opportunities_count,
      average_score
    )
    VALUES (
      ${"corsaimanager-internal"},
      ${"corsaimanager-seo"},
      ${"corsaimanager.com"},
      ${e.type??"unknown"},
      ${e.pagesCount??0},
      ${e.opportunitiesCount??0},
      ${e.averageScore??0}
    )
    RETURNING id
  `,a=r[0]?.id;if(!a)return null;for(let r of e.actionPlan??[])await t`
      INSERT INTO seo_action_plan_items (
        export_id,
        account_id,
        project_id,
        site_id,
        level,
        priority,
        page_url,
        problem,
        recommendation,
        estimated_impact,
        estimated_effort,
        data_used
      )
      VALUES (
        ${a},
        ${"corsaimanager-internal"},
        ${"corsaimanager-seo"},
        ${"corsaimanager.com"},
        ${r.level},
        ${r.priority},
        ${r.page},
        ${r.problem},
        ${r.recommendation},
        ${r.estimatedImpact},
        ${r.estimatedEffort},
        ${r.dataUsed}
      )
    `;return a}e.s(["POST",0,v,"dynamic",0,"force-dynamic"],10011);var L=e.i(10011);let f=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/admin/seo-exports/route",pathname:"/api/admin/seo-exports",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/admin/seo-exports/route.ts",nextConfigOutput:"",userland:L,...{}}),{workAsyncStorage:A,workUnitAsyncStorage:w,serverHooks:O}=f;async function U(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),f.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/admin/seo-exports/route";m=m.replace(/\/index$/,"")||"/";let h=await f.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!h)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:g,deploymentId:v,params:_,nextConfig:L,parsedUrl:A,isDraftMode:w,prerenderManifest:O,routerServerContext:U,isOnDemandRevalidate:y,revalidateOnlyGenerated:C,resolvedPathname:I,clientReferenceManifest:S,serverActionsManifest:b}=h,P=(0,s.normalizeAppPath)(m),$=!!(O.dynamicRoutes[P]||O.routes[I]),j=async()=>((null==U?void 0:U.render404)?await U.render404(e,t,A,!1):t.end("This page could not be found"),null);if($&&!w){let e=!!O.routes[I],t=O.dynamicRoutes[P];if(t&&!1===t.fallback&&!e){if(L.adapterPath)return await j();throw new R.NoFallbackError}}let q=null;!$||f.isDev||w||(q="/index"===(q=I)?"/":q);let k=!0===f.isDev||!$,D=$&&!k;b&&S&&(0,i.setManifestsSingleton)({page:m,clientReferenceManifest:S,serverActionsManifest:b});let X=e.method||"GET",M=(0,o.getTracer)(),F=M.getActiveScopeSpan(),H=!!(null==U?void 0:U.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),G=(0,n.getRequestMeta)(e,"incrementalCache")||await f.getIncrementalCache(e,L,O,B);null==G||G.resetRequestCache(),globalThis.__incrementalCache=G;let K={params:_,previewProps:O.preview,renderOpts:{experimental:{authInterrupts:!!L.experimental.authInterrupts},cacheComponents:!!L.cacheComponents,supportsDynamicResponse:k,incrementalCache:G,cacheLifeProfiles:L.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>f.onRequestError(e,t,a,n,U)},sharedContext:{buildId:g,deploymentId:v}},V=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),Y=d.NextRequestAdapter.fromNodeNextRequest(V,(0,d.signalFromNodeResponse)(t));try{let n,i=async e=>f.handle(Y,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${X} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${X} ${m}`)}),s=async n=>{var o,s;let l=async({previousCacheEntry:r})=>{try{if(!B&&y&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await i(n);e.fetchMetrics=K.renderOpts.fetchMetrics;let s=K.renderOpts.pendingWaitUntil;s&&a.waitUntil&&(a.waitUntil(s),s=void 0);let l=K.renderOpts.collectedTags;if(!$)return await (0,c.sendResponse)(V,W,o,K.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,T.toNodeOutgoingHttpHeaders)(o.headers);l&&(t[N.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=N.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,a=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=N.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:x.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await f.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:y})},!1,U),t}},d=await f.handleResponse({req:e,nextConfig:L,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:O,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:C,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:B});if(!$)return null;if((null==d||null==(o=d.value)?void 0:o.kind)!==x.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(s=d.value)?void 0:s.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",y?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),w&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,T.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&$||p.delete(N.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,E.getCacheControlHeader)(d.cacheControl)),await (0,c.sendResponse)(V,W,new Response(d.value.body,{headers:p,status:d.value.status||200})),null};H&&F?await s(F):(n=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(p.BaseServerSpan.handleRequest,{spanName:`${X} ${m}`,kind:o.SpanKind.SERVER,attributes:{"http.method":X,"http.target":e.url}},s),void 0,!H))}catch(t){if(t instanceof R.NoFallbackError||await f.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:y})},!1,U),$)throw t;return await (0,c.sendResponse)(V,W,new Response(null,{status:500})),null}}e.s(["handler",0,U,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:w})},"routeModule",0,f,"serverHooks",0,O,"workAsyncStorage",0,A,"workUnitAsyncStorage",0,w],86968)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__12m55ye._.js.map