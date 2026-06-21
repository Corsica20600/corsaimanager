module.exports=[58075,e=>{"use strict";var t=e.i(66680),r=e.i(38536);let o="https://www.googleapis.com/auth/webmasters.readonly",n="https://www.googleapis.com/auth/analytics.readonly",i="https://www.corsaimanager.com/api/google/callback",s="corsaimanager-internal",a="corsaimanager-seo",c="google";function l(){let e=process.env.GOOGLE_CLIENT_ID,t=process.env.GOOGLE_CLIENT_SECRET,r=N().runtimeRedirectUri,o=process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL??null;if(!e||!t||!r)throw Error("Configuration Google OAuth incomplete: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET et GOOGLE_REDIRECT_URI sont requis.");return{clientId:e,clientSecret:t,redirectUri:r,siteUrl:o}}async function u(e){let{clientId:t,clientSecret:r,redirectUri:o}=l();R("oauth_code_exchange");let n=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code:e,client_id:t,client_secret:r,redirect_uri:o,grant_type:"authorization_code"}),signal:AbortSignal.timeout(15e3)}),i=await n.json();if(!n.ok)throw Error(i.error_description??i.error??"Echec de l'echange OAuth Google.");return i}async function p(e){await f();let t=(0,r.getNeonClient)(),n=new Date(Date.now()+(e.expires_in??3600)*1e3),i=e.scope?.split(" ").filter(Boolean)??[o],l=G(e.access_token),u=e.refresh_token?G(e.refresh_token):null,p=await A(e.access_token);await t`
    INSERT INTO google_connections (
      account_id,
      project_id,
      provider,
      encrypted_access_token,
      encrypted_refresh_token,
      scope,
      token_type,
      connected_email,
      expires_at,
      updated_at
    )
    VALUES (
      ${s},
      ${a},
      ${c},
      ${l},
      ${u},
      ${i},
      ${e.token_type??"Bearer"},
      ${p},
      ${n.toISOString()},
      NOW()
    )
    ON CONFLICT (account_id, project_id, provider)
    DO UPDATE SET
      encrypted_access_token = EXCLUDED.encrypted_access_token,
      encrypted_refresh_token = COALESCE(EXCLUDED.encrypted_refresh_token, google_connections.encrypted_refresh_token),
      scope = EXCLUDED.scope,
      token_type = EXCLUDED.token_type,
      connected_email = COALESCE(EXCLUDED.connected_email, google_connections.connected_email),
      expires_at = EXCLUDED.expires_at,
      updated_at = NOW()
  `}async function _(){let e=process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL??null,t=N();if(R("connection_status"),!process.env.DATABASE_URL)return U(e,t,"DATABASE_URL non configure.");try{var r;await f();let o=await S();if(!o)return U(e,t);return{connected:!0,accountId:s,projectId:a,siteUrl:e,redirectUri:t.displayRedirectUri,expectedRedirectUri:i,redirectUriStatus:t.status,connectedEmail:o.connected_email,detectedSiteUrl:e,watchedDomain:w(e),lastSyncedAt:o.updated_at?new Date(o.updated_at).toISOString():null,expiresAt:o.expires_at?new Date(o.expires_at).toISOString():null,scopes:(r=o.scope,Array.isArray(r)?r:"string"==typeof r?r.replace(/[{}"]/g,"").split(",").filter(Boolean):[])}}catch(r){return{connected:!1,accountId:s,projectId:a,siteUrl:e,redirectUri:t.displayRedirectUri,expectedRedirectUri:i,redirectUriStatus:t.status,connectedEmail:null,detectedSiteUrl:null,watchedDomain:w(e),lastSyncedAt:null,expiresAt:null,scopes:[],error:r instanceof Error?r.message:"Connexion Google indisponible."}}}async function d(){let e=await h();return(await y("https://searchconsole.googleapis.com/webmasters/v3/sites",e)).siteEntry??[]}async function E(e){var t,r;let o=e?.siteUrl??function(){let e=process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;if(!e)throw Error("GOOGLE_SEARCH_CONSOLE_SITE_URL non configure.");return e}(),{startDate:n,endDate:i}=C(e?.range??"28d"),s=await h(),a=e?.page?[{dimension:"page",operator:"equals",expression:e.page}]:void 0;return t=(await y(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(o)}/searchAnalytics/query`,s,{method:"POST",body:JSON.stringify({startDate:n,endDate:i,dimensions:e?.dimensions??["page"],rowLimit:e?.rowLimit??50,dimensionFilterGroups:a?[{filters:a}]:void 0})})).rows??[],r=e?.dimensions??["page"],t.map(e=>{let t={clicks:Math.round(e.clicks??0),impressions:Math.round(e.impressions??0),ctr:e.ctr??0,position:e.position??0};return r.forEach((r,o)=>{"page"===r&&(t.url=e.keys?.[o]),"query"===r&&(t.query=e.keys?.[o])}),t})}async function T(e,t){return E({siteUrl:t?.siteUrl,range:t?.range,dimensions:["query"],page:e,rowLimit:t?.rowLimit??12})}async function g(e){return E({siteUrl:e?.siteUrl,range:e?.range,dimensions:["page"],rowLimit:e?.rowLimit??50})}async function L(e){let t=e?.range??"28d",r=e?.siteUrl??process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL??null,{startDate:o,endDate:n}=C(t),i=await _();if(!i.connected||!r)return{connected:!1,siteUrl:r,range:t,startDate:o,endDate:n,summary:{clicks:0,impressions:0,ctr:0,position:0},pages:[],queries:[],opportunities:[],error:i.error??(r?"Google Search Console non connecte.":"GOOGLE_SEARCH_CONSOLE_SITE_URL non configure.")};try{var s;let e,i,a,[c,l]=await Promise.all([g({siteUrl:r,range:t,rowLimit:80}),E({siteUrl:r,range:t,dimensions:["query"],rowLimit:80})]);return{connected:!0,siteUrl:r,range:t,startDate:o,endDate:n,summary:(e=(s=c).reduce((e,t)=>e+t.clicks,0),i=s.reduce((e,t)=>e+t.impressions,0),a=s.reduce((e,t)=>e+t.position*Math.max(1,t.impressions),0),{clicks:e,impressions:i,ctr:i>0?e/i:0,position:i>0?a/i:0}),pages:c,queries:l,opportunities:function(e,t){let r=[];for(let t of e)t.url&&(t.impressions>=250&&t.ctr<.02&&r.push({type:"low_ctr",title:"Title/meta à réécrire",detail:`${t.url} re\xe7oit ${t.impressions} impressions mais un CTR de ${v(t.ctr)}.`,priority:"Haute",page:t.url}),t.position>=8&&t.position<=20&&r.push({type:"near_top_10",title:"Page proche du top 10",detail:`${t.url} est en position moyenne ${t.position.toFixed(1)}: renforcer contenu, FAQ et maillage interne.`,priority:"Critique",page:t.url}),t.position>20&&t.position<=50&&t.impressions>=80&&r.push({type:"needs_content",title:"Page à renforcer",detail:`${t.url} a des impressions mais reste loin du top 20. Ajouter sections, preuves et liens internes.`,priority:"Moyenne",page:t.url}),0===t.impressions&&r.push({type:"no_impressions",title:"Page sans impressions",detail:`${t.url} ne g\xe9n\xe8re aucune impression: v\xe9rifier indexation, intention et profondeur du contenu.`,priority:"Haute",page:t.url}));for(let e of t)e.query&&(e.impressions>=120&&e.ctr<.015&&r.push({type:"low_ctr",title:"Requête avec CTR faible",detail:`"${e.query}" g\xe9n\xe8re ${e.impressions} impressions avec ${v(e.ctr)} de CTR.`,priority:"Haute",query:e.query}),e.impressions>=80&&e.position>15&&e.position<=45&&r.push({type:"new_page",title:"Nouvelle page potentielle",detail:`"${e.query}" m\xe9rite peut-\xeatre une page d\xe9di\xe9e ou une section plus visible.`,priority:"Moyenne",query:e.query}));return r.slice(0,24)}(c,l)}}catch(e){return{connected:!1,siteUrl:r,range:t,startDate:o,endDate:n,summary:{clicks:0,impressions:0,ctr:0,position:0},pages:[],queries:[],opportunities:[],error:e instanceof Error?e.message:"Impossible de recuperer les donnees Search Console."}}}async function m(){return h()}async function h(){await f();let e=await S();if(!e)throw Error("Google Search Console n'est pas connecte.");if((e.expires_at?new Date(e.expires_at).getTime():0)>Date.now()+6e4)return D(e.encrypted_access_token);if(!e.encrypted_refresh_token)throw Error("Refresh token Google absent. Relancez la connexion Google Search Console.");let t=await O(D(e.encrypted_refresh_token));return await p(t),t.access_token}async function O(e){let{clientId:t,clientSecret:r}=l(),o=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:t,client_secret:r,refresh_token:e,grant_type:"refresh_token"}),signal:AbortSignal.timeout(15e3)}),n=await o.json();if(!o.ok)throw Error(n.error_description??n.error??"Echec du refresh token Google.");return{...n,refresh_token:e}}async function y(e,t,r){let o=await fetch(e,{...r,headers:{authorization:`Bearer ${t}`,"content-type":"application/json",...r?.headers??{}},signal:r?.signal??AbortSignal.timeout(18e3)}),n=await o.json();if(!o.ok)throw Error(n.error?.message??"Erreur API Google Search Console.");return n}async function S(){let e=(0,r.getNeonClient)();return(await e`
    SELECT account_id, project_id, encrypted_access_token, encrypted_refresh_token, scope, token_type, expires_at, connected_email, updated_at
    FROM google_connections
    WHERE account_id = ${s}
      AND project_id = ${a}
      AND provider = ${c}
    LIMIT 1
  `)[0]??null}async function f(){let e=(0,r.getNeonClient)();await e`
    CREATE TABLE IF NOT EXISTS google_connections (
      id BIGSERIAL PRIMARY KEY,
      account_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'google',
      encrypted_access_token TEXT NOT NULL,
      encrypted_refresh_token TEXT,
      scope TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      token_type TEXT,
      expires_at TIMESTAMPTZ,
      connected_email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(account_id, project_id, provider)
    )
  `,await e`
    CREATE TABLE IF NOT EXISTS search_console_query_metrics (
      id BIGSERIAL PRIMARY KEY,
      account_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      site_url TEXT NOT NULL,
      page_url TEXT,
      query TEXT NOT NULL,
      range_label TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      clicks INTEGER NOT NULL DEFAULT 0,
      impressions INTEGER NOT NULL DEFAULT 0,
      ctr NUMERIC(10, 6) NOT NULL DEFAULT 0,
      position NUMERIC(10, 4) NOT NULL DEFAULT 0,
      opportunity_score INTEGER,
      seo_potential INTEGER,
      priority TEXT,
      estimated_clicks_gain INTEGER,
      opportunity_type TEXT,
      detected_action TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,await e`ALTER TABLE search_console_query_metrics ADD COLUMN IF NOT EXISTS opportunity_score INTEGER`,await e`ALTER TABLE search_console_query_metrics ADD COLUMN IF NOT EXISTS seo_potential INTEGER`,await e`ALTER TABLE search_console_query_metrics ADD COLUMN IF NOT EXISTS priority TEXT`,await e`ALTER TABLE search_console_query_metrics ADD COLUMN IF NOT EXISTS estimated_clicks_gain INTEGER`,await e`ALTER TABLE search_console_query_metrics ADD COLUMN IF NOT EXISTS opportunity_type TEXT`,await e`ALTER TABLE search_console_query_metrics ADD COLUMN IF NOT EXISTS detected_action TEXT`,await e`
    CREATE INDEX IF NOT EXISTS idx_search_console_query_metrics_site_query
    ON search_console_query_metrics(site_url, query)
  `}function N(){let e=process.env.GOOGLE_REDIRECT_URI?.trim()??"";return e?/localhost|127\.0\.0\.1/i.test(e)?{rawRedirectUri:e,runtimeRedirectUri:i,displayRedirectUri:i,status:"localhost_detected"}:e!==i?{rawRedirectUri:e,runtimeRedirectUri:e,displayRedirectUri:e,status:"production_mismatch"}:{rawRedirectUri:e,runtimeRedirectUri:e,displayRedirectUri:e,status:"ok"}:{rawRedirectUri:e,runtimeRedirectUri:i,displayRedirectUri:i,status:"missing"}}function U(e,t,r){return{connected:!1,accountId:s,projectId:a,siteUrl:e,redirectUri:t.displayRedirectUri,expectedRedirectUri:i,redirectUriStatus:t.status,connectedEmail:null,detectedSiteUrl:null,watchedDomain:w(e),lastSyncedAt:null,expiresAt:null,scopes:[],error:r}}function R(e){let t=N();console.info("[google-oauth][env]",{context:e,nodeEnv:"production",vercelEnv:process.env.VERCEL_ENV??null,hasGoogleClientId:!!process.env.GOOGLE_CLIENT_ID,hasGoogleClientSecret:!!process.env.GOOGLE_CLIENT_SECRET,hasGoogleRedirectUri:!!process.env.GOOGLE_REDIRECT_URI,googleRedirectUriStatus:t.status,runtimeRedirectUri:t.displayRedirectUri,expectedProductionRedirectUri:i,hasSearchConsoleSiteUrl:!!process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL,searchConsoleSiteUrl:process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL??null,hasDatabaseUrl:!!process.env.DATABASE_URL})}async function A(e){try{let t=await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json",{headers:{authorization:`Bearer ${e}`},signal:AbortSignal.timeout(8e3)});if(!t.ok)return null;return(await t.json()).email??null}catch{return null}}function w(e){if(!e)return null;if(e.startsWith("sc-domain:"))return e.replace("sc-domain:","");try{return new URL(e).hostname}catch{return e}}function C(e){let t=new Date;t.setDate(t.getDate()-2);let r=new Date(t);return r.setDate(r.getDate()-("28d"===e?27:89)),{startDate:I(r),endDate:I(t)}}function I(e){return e.toISOString().slice(0,10)}function G(e){let r=(0,t.randomBytes)(12),o=(0,t.createCipheriv)("aes-256-gcm",k(),r),n=Buffer.concat([o.update(e,"utf8"),o.final()]),i=o.getAuthTag();return`v1:${r.toString("base64url")}:${i.toString("base64url")}:${n.toString("base64url")}`}function D(e){let[r,o,n,i]=e.split(":");if("v1"!==r||!o||!n||!i)throw Error("Token Google stocke dans un format invalide.");let s=(0,t.createDecipheriv)("aes-256-gcm",k(),Buffer.from(o,"base64url"));return s.setAuthTag(Buffer.from(n,"base64url")),Buffer.concat([s.update(Buffer.from(i,"base64url")),s.final()]).toString("utf8")}function k(){let e=process.env.GOOGLE_TOKEN_ENCRYPTION_KEY??process.env.GOOGLE_CLIENT_SECRET;if(!e)throw Error("GOOGLE_TOKEN_ENCRYPTION_KEY ou GOOGLE_CLIENT_SECRET est requis pour chiffrer les tokens Google.");return(0,t.createHash)("sha256").update(e).digest()}function v(e){return`${(100*e).toFixed(1)}%`}e.s(["GOOGLE_ANALYTICS_READONLY_SCOPE",0,n,"buildGoogleAuthUrl",0,function(e){let{clientId:t,redirectUri:r}=l();R("auth_url_build");let i=new URLSearchParams({client_id:t,redirect_uri:r,response_type:"code",access_type:"offline",prompt:"consent",include_granted_scopes:"true",scope:[o,"https://www.googleapis.com/auth/userinfo.email",n].join(" "),state:e});return`https://accounts.google.com/o/oauth2/v2/auth?${i.toString()}`},"exchangeGoogleCode",0,u,"getGoogleAccessToken",0,m,"getGoogleConnectionStatus",0,_,"getGoogleOAuthStateCookieName",0,function(){return"cm_google_oauth_state"},"getQueriesByPage",0,T,"getSearchConsoleReport",0,L,"getSearchConsoleSites",0,d,"logGoogleEnvDiagnostics",0,R,"saveGoogleConnection",0,p])}];

//# sourceMappingURL=lib_google_searchConsole_ts_05haeaj._.js.map