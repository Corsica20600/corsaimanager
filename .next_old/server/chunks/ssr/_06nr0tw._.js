module.exports=[50640,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"InvariantError",{enumerable:!0,get:function(){return d}});class d extends Error{constructor(a,b){super(`Invariant: ${a.endsWith(".")?a:a+"."} This is a bug in Next.js.`,b),this.name="InvariantError"}}},5034,a=>{"use strict";var b=a.i(5246);let c="cm_admin_session";async function d(){let a=await (0,b.cookies)();return a.get(c)?.value==="1"}async function e(){(await (0,b.cookies)()).set(c,"1",{httpOnly:!0,sameSite:"lax",secure:!0,path:"/",maxAge:28800})}async function f(){(await (0,b.cookies)()).delete(c)}a.s(["clearAdminSession",0,f,"isAdminAuthenticated",0,d,"setAdminSession",0,e])},37936,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"registerServerReference",{enumerable:!0,get:function(){return d.registerServerReference}});let d=a.r(11857)},57132,84347,a=>{"use strict";var b=a.i(52991);async function c(){let a=(0,b.getNeonClient)();await a`
    CREATE TABLE IF NOT EXISTS leads (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      nom TEXT NOT NULL,
      email TEXT NOT NULL,
      telephone TEXT,
      entreprise TEXT NOT NULL,
      activite TEXT NOT NULL,
      besoin TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      source TEXT NOT NULL DEFAULT 'audit-form',
      score INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'low',
      score_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      last_contact_at TIMESTAMPTZ,
      notes TEXT,
      pipeline_stage TEXT NOT NULL DEFAULT 'new',
      reminder_step INTEGER NOT NULL DEFAULT 0,
      reminder_last_sent_at TIMESTAMPTZ,
      ai_summary TEXT,
      next_action_suggestion TEXT,
      ai_qualification TEXT,
      ai_detected_needs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      ai_urgency TEXT,
      ai_next_action TEXT,
      ai_suggested_reply TEXT,
      ai_confidence INTEGER,
      ai_processed_at TIMESTAMPTZ,
      is_spam BOOLEAN NOT NULL DEFAULT FALSE,
      review_needed BOOLEAN NOT NULL DEFAULT FALSE,
      spam_score INTEGER NOT NULL DEFAULT 0,
      spam_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 0`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'low'`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'audit-form'`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'new'`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS reminder_step INTEGER NOT NULL DEFAULT 0`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS reminder_last_sent_at TIMESTAMPTZ`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_summary TEXT`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action_suggestion TEXT`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_qualification TEXT`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_detected_needs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_urgency TEXT`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_next_action TEXT`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_suggested_reply TEXT`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_confidence INTEGER`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMPTZ`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT FALSE`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS review_needed BOOLEAN NOT NULL DEFAULT FALSE`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS spam_score INTEGER NOT NULL DEFAULT 0`,await a`ALTER TABLE leads ADD COLUMN IF NOT EXISTS spam_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,await a`
    CREATE TABLE IF NOT EXISTS lead_submission_attempts (
      id BIGSERIAL PRIMARY KEY,
      ip_address TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,await a`
    CREATE INDEX IF NOT EXISTS idx_lead_submission_attempts_ip_created_at
    ON lead_submission_attempts (ip_address, created_at DESC)
  `}async function d(a){let d=(0,b.getNeonClient)();await c();let[e]=await d`
    INSERT INTO leads (
      nom,
      email,
      telephone,
      entreprise,
      activite,
      besoin,
      message,
      status,
      source,
      score,
      priority,
      score_reasons,
      last_contact_at,
      notes,
      pipeline_stage,
      reminder_step,
      reminder_last_sent_at,
      ai_summary,
      next_action_suggestion,
      ai_qualification,
      ai_detected_needs,
      ai_urgency,
      ai_next_action,
      ai_suggested_reply,
      ai_confidence,
      ai_processed_at,
      is_spam,
      review_needed,
      spam_score,
      spam_reasons
    ) VALUES (
      ${a.nom},
      ${a.email},
      ${a.telephone||null},
      ${a.entreprise},
      ${a.secteur},
      ${a.besoin},
      ${a.message||null},
      ${a.status??"new"},
      ${a.source??"audit-form"},
      ${a.score??0},
      ${a.priority??"low"},
      ${a.scoreReasons??[]},
      ${null},
      ${null},
      ${"new"},
      ${0},
      ${null},
      ${null},
      ${null},
      ${null},
      ${[]},
      ${null},
      ${null},
      ${null},
      ${null},
      ${null},
      ${a.isSpam??!1},
      ${a.reviewNeeded??!1},
      ${a.spamScore??0},
      ${a.spamReasons??[]}
    )
    RETURNING id
  `;return e?.id??null}async function e(){let a=(0,b.getNeonClient)();await c();let[d]=await a`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'new')::int AS new_count,
      COUNT(*) FILTER (WHERE priority = 'hot')::int AS hot_count,
      COUNT(*) FILTER (WHERE status IN ('closed', 'lost'))::int AS treated_count,
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS today_count,
      COUNT(*) FILTER (
        WHERE status IN ('new', 'contacted', 'qualified', 'proposal')
        AND (last_contact_at IS NULL OR last_contact_at < NOW() - INTERVAL '3 days')
      )::int AS no_reply_count,
      COUNT(*) FILTER (WHERE reminder_last_sent_at::date = CURRENT_DATE)::int AS reminders_today,
      CASE WHEN COUNT(*) FILTER (WHERE status IN ('won', 'closed', 'lost')) = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE status IN ('won','closed'))::numeric /
           NULLIF(COUNT(*) FILTER (WHERE status IN ('won','closed','lost')), 0)) * 100
        )::int
      END AS conversion_rate,
      COALESCE(ROUND(AVG(score))::int, 0) AS avg_score,
      COALESCE(
        (
          SELECT STRING_AGG(activity_label, ', ')
          FROM (
            SELECT activite AS activity_label, COUNT(*) AS c
            FROM leads
            GROUP BY activite
            ORDER BY c DESC
            LIMIT 3
          ) t
        ),
        ''
      ) AS top_activities,
      COALESCE(
        (
          SELECT STRING_AGG(need_label, ', ')
          FROM (
            SELECT besoin AS need_label, COUNT(*) AS c
            FROM leads
            GROUP BY besoin
            ORDER BY c DESC
            LIMIT 3
          ) t
        ),
        ''
      ) AS top_needs
    FROM leads
  `;return d??{total:0,new_count:0,hot_count:0,treated_count:0,today_count:0,no_reply_count:0,reminders_today:0,conversion_rate:0,avg_score:0,top_activities:"",top_needs:""}}async function f(a={}){let d=(0,b.getNeonClient)();await c();let e=(a.query??"").trim().toLowerCase(),g=a.status&&"all"!==a.status?a.status:null,h=a.priority&&"all"!==a.priority?a.priority:null,i=a.sort??"recent",j=a.spamFilter??"valid",k=a.includeSpam??!1;return await d`
    SELECT
      id,
      created_at,
      nom,
      email,
      telephone,
      entreprise,
      activite,
      besoin,
      message,
      source,
      status,
      score,
      priority,
      score_reasons,
      last_contact_at,
      notes,
      reminder_step,
      reminder_last_sent_at,
      ai_summary,
      next_action_suggestion,
      ai_qualification,
      ai_detected_needs,
      ai_urgency,
      ai_next_action,
      ai_suggested_reply,
      ai_confidence,
      ai_processed_at,
      is_spam,
      review_needed,
      spam_score,
      spam_reasons
    FROM leads
    WHERE
      (${g}::text IS NULL OR status = ${g})
      AND (${h}::text IS NULL OR priority = ${h})
      AND (
        (${k} = false AND is_spam = false)
        OR (${k} = true)
      )
      AND (
        ${j}::text = 'all'
        OR (${j}::text = 'valid' AND is_spam = false)
        OR (${j}::text = 'spam' AND is_spam = true)
      )
      AND (
        ${e}::text = ''
        OR LOWER(nom) LIKE ${`%${e}%`}
        OR LOWER(entreprise) LIKE ${`%${e}%`}
        OR LOWER(email) LIKE ${`%${e}%`}
      )
    ORDER BY
      CASE WHEN ${i} = 'score' THEN score END DESC,
      created_at DESC
    LIMIT 250
  `}async function g(a){let d=(0,b.getNeonClient)();return await c(),(await d`
    SELECT
      id,
      created_at,
      nom,
      email,
      telephone,
      entreprise,
      activite,
      besoin,
      message,
      source,
      status,
      score,
      priority,
      score_reasons,
      last_contact_at,
      notes,
      reminder_step,
      reminder_last_sent_at,
      ai_summary,
      next_action_suggestion,
      ai_qualification,
      ai_detected_needs,
      ai_urgency,
      ai_next_action,
      ai_suggested_reply,
      ai_confidence,
      ai_processed_at,
      is_spam,
      review_needed,
      spam_score,
      spam_reasons
    FROM leads
    WHERE id = ${a}
    LIMIT 1
  `)[0]??null}async function h(a,d){let e=(0,b.getNeonClient)();await c(),await e`
    UPDATE leads
    SET
      status = ${d},
      updated_at = NOW(),
      last_contact_at = CASE
        WHEN ${d} IN ('contacted', 'qualified', 'proposal', 'closed', 'won')
        THEN NOW()
        ELSE last_contact_at
      END
    WHERE id = ${a}
  `}async function i(a,d){let e=(0,b.getNeonClient)();await c(),await e`
    UPDATE leads
    SET
      notes = ${d||null},
      updated_at = NOW()
    WHERE id = ${a}
  `}async function j(a){let d=(0,b.getNeonClient)();await c(),await d`
    UPDATE leads
    SET
      last_contact_at = NOW(),
      updated_at = NOW()
    WHERE id = ${a}
  `}async function k(a,d){let e=(0,b.getNeonClient)();await c(),await e`
    UPDATE leads
    SET
      ai_summary = ${d.summary},
      ai_qualification = ${d.qualification},
      ai_detected_needs = ${d.detectedNeeds},
      ai_urgency = ${d.urgency},
      ai_next_action = ${d.nextAction},
      ai_suggested_reply = ${d.suggestedReply},
      ai_confidence = ${d.confidence},
      ai_processed_at = NOW(),
      updated_at = NOW()
    WHERE id = ${a}
  `}async function l(a,d=3){let e=(0,b.getNeonClient)();await c();let[f]=await e`
    SELECT COUNT(*)::int AS attempts
    FROM lead_submission_attempts
    WHERE ip_address = ${a}
      AND created_at >= NOW() - INTERVAL '1 hour'
  `,g=f?.attempts??0;return g>=d?{allowed:!1,attempts:g}:(await e`
    INSERT INTO lead_submission_attempts (ip_address)
    VALUES (${a})
  `,{allowed:!0,attempts:g+1})}async function m(){let a=(0,b.getNeonClient)();await a`
    CREATE TABLE IF NOT EXISTS lead_activities (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      user_action TEXT,
      metadata JSONB
    )
  `}async function n(a){let c=(0,b.getNeonClient)();await m(),await c`
    INSERT INTO lead_activities (lead_id, type, description, user_action, metadata)
    VALUES (
      ${a.leadId},
      ${a.type},
      ${a.description},
      ${a.userAction??null},
      ${a.metadata?JSON.stringify(a.metadata):null}::jsonb
    )
  `}async function o(a){let c=(0,b.getNeonClient)();return await m(),await c`
    SELECT id, lead_id, created_at, type, description, user_action, metadata::text AS metadata
    FROM lead_activities
    WHERE lead_id = ${a}
    ORDER BY created_at DESC
    LIMIT 200
  `}a.s(["createAuditLead",0,d,"enforceLeadSubmissionRateLimit",0,l,"getLeadById",0,g,"getLeads",0,f,"getLeadsStats",0,e,"touchLeadLastContactAt",0,j,"updateLeadAIAnalysis",0,k,"updateLeadNotes",0,i,"updateLeadStatus",0,h],57132),a.s(["createLeadActivity",0,n,"getLeadActivities",0,o],84347)},13095,(a,b,c)=>{"use strict";function d(a){for(let b=0;b<a.length;b++){let c=a[b];if("function"!=typeof c)throw Object.defineProperty(Error(`A "use server" file can only export async functions, found ${typeof c}.
Read more: https://nextjs.org/docs/messages/invalid-use-server-value`),"__NEXT_ERROR_CODE",{value:"E352",enumerable:!1,configurable:!0})}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"ensureServerEntryExports",{enumerable:!0,get:function(){return d}})},4100,a=>{"use strict";var b=a.i(66274);a.s([],10849),a.i(10849),a.s(["00006d3e5f21667c96b47b36bbdcc93abd9377b936",()=>b.adminLogoutAction,"40067cbfa47323346ec5afba423c6f4c5025ad95b3",()=>b.updateLeadNotesAction,"40489c9df3cde1a0cb48083b39ba38aa0f2b66361c",()=>b.setLeadStatusAction,"405bbff8bbc3e8262b6697dcc130149f4ceaa92170",()=>b.updateProposalAction,"408b5faac0ca7c645ecf9af8970d950193666b4e3d",()=>b.getProposalForLead,"40b724aea133f2503428b11083f7ae79aa09d19b62",()=>b.touchLastContactAction,"40cea54ae42a473aa535762331b368e4058392402a",()=>b.adminLoginAction,"40d0c8bbf4223d45803b4acf4bdd31fb316a74d716",()=>b.generateProposalForLeadAction,"40e5fff500eda6eb9ba751783b2a853a3a99c96e32",()=>b.markProposalSentAction,"40ee9144eec2b53c06ccd73f08b0781691e801daed",()=>b.generateProposalForLead,"6033a7d3537111745ebe0107cdc0b13a867b89274e",()=>b.markProposalSent,"70224c6767629d59dbcdd5ae20cc39883742b042ad",()=>b.updateProposal],4100)}];

//# sourceMappingURL=_06nr0tw._.js.map