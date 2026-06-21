import { getNeonClient } from "@/lib/neon";
import { getGoogleAccessToken, getGoogleConnectionStatus, GOOGLE_ANALYTICS_READONLY_SCOPE } from "@/lib/google/searchConsole";

const accountId = "corsaimanager-internal";
const projectId = "corsaimanager-seo";
const siteId = "corsaimanager.com";

export type Ga4Range = "28d" | "3m";

export type Ga4Summary = {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  engagementRate: number;
  averageSessionDuration: number;
  eventCount: number;
};

export type Ga4PageMetric = Ga4Summary & {
  path: string;
  entranceRate: number;
  conversions: number;
  businessSeoScore: number;
};

export type Ga4ChannelMetric = Ga4Summary & {
  channel: string;
};

export type Ga4EventMetric = {
  eventName: string;
  eventCount: number;
  activeUsers: number;
  conversions: number;
};

export type Ga4BusinessOpportunity = {
  type: "traffic_no_conversion" | "good_position_low_engagement" | "clicks_low_visits" | "organic_growth" | "cta_tracking";
  page: string;
  title: string;
  detail: string;
  priority: "Critique" | "Haute" | "Moyenne" | "Faible";
  action: string;
};

export type Ga4Report = {
  connected: boolean;
  propertyId: string | null;
  range: Ga4Range;
  startDate: string;
  endDate: string;
  hasAnalyticsScope: boolean;
  summary: Ga4Summary;
  organicSummary: Ga4Summary;
  pages: Ga4PageMetric[];
  landingPages: Ga4PageMetric[];
  channels: Ga4ChannelMetric[];
  events: Ga4EventMetric[];
  businessOpportunities: Ga4BusinessOpportunity[];
  error?: string;
};

type Ga4RunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

type Ga4Dimension = "pagePathPlusQueryString" | "landingPagePlusQueryString" | "sessionDefaultChannelGroup" | "eventName";
export async function getGa4Report(options?: { range?: Ga4Range }): Promise<Ga4Report> {
  const range = options?.range ?? "28d";
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID ?? null;
  const { startDate, endDate } = getDateRange(range);
  const status = await getGoogleConnectionStatus();
  const hasAnalyticsScope = status.scopes.includes(GOOGLE_ANALYTICS_READONLY_SCOPE);

  if (!status.connected || !propertyId) {
    return emptyGa4Report({
      propertyId,
      range,
      startDate,
      endDate,
      hasAnalyticsScope,
      error: status.error ?? (!propertyId ? "GOOGLE_ANALYTICS_PROPERTY_ID non configure." : "Compte Google non connecte."),
    });
  }

  if (!hasAnalyticsScope) {
    return emptyGa4Report({
      propertyId,
      range,
      startDate,
      endDate,
      hasAnalyticsScope,
      error: "Scope GA4 manquant. Relancez la connexion Google pour accepter analytics.readonly.",
    });
  }

  try {
    const [summaryRows, pageRows, channelRows] = await Promise.all([
      runGa4Report({ propertyId, range }),
      runGa4Report({ propertyId, range, dimension: "pagePathPlusQueryString", limit: 50 }),
      runGa4Report({ propertyId, range, dimension: "sessionDefaultChannelGroup", limit: 20 }),
    ]);
    const [landingRows, eventRows, organicRows] = await Promise.all([
      runGa4Report({ propertyId, range, dimension: "landingPagePlusQueryString", limit: 40 }),
      runGa4Report({ propertyId, range, dimension: "eventName", limit: 40 }),
      runGa4Report({ propertyId, range, channelFilter: "Organic Search" }),
    ]);
    const summary = mapGa4Summary(summaryRows.rows?.[0]?.metricValues ?? []);
    const organicSummary = mapGa4Summary(organicRows.rows?.[0]?.metricValues ?? []);
    const pages = mapGa4PageRows(pageRows.rows ?? []).map(addBusinessScore);
    const landingPages = mapGa4PageRows(landingRows.rows ?? []).map(addBusinessScore);
    const channels = mapGa4DimensionRows(channelRows.rows ?? [], "channel");
    const events = mapGa4Events(eventRows.rows ?? []);
    const businessOpportunities = detectGa4BusinessOpportunities(pages, landingPages, organicSummary);

    await saveGa4PageMetrics(propertyId, range, startDate, endDate, pages);
    await saveGa4Events(propertyId, range, startDate, endDate, events);
    await saveBusinessOpportunities(propertyId, businessOpportunities);

    return {
      connected: true,
      propertyId,
      range,
      startDate,
      endDate,
      hasAnalyticsScope,
      summary,
      organicSummary,
      pages,
      landingPages,
      channels,
      events,
      businessOpportunities,
    };
  } catch (error) {
    return emptyGa4Report({
      propertyId,
      range,
      startDate,
      endDate,
      hasAnalyticsScope,
      error: error instanceof Error ? error.message : "Impossible de recuperer les donnees GA4.",
    });
  }
}

export async function getGa4Overview(options?: { range?: Ga4Range }) {
  const report = await getGa4Report(options);
  return {
    connected: report.connected,
    propertyId: report.propertyId,
    range: report.range,
    startDate: report.startDate,
    endDate: report.endDate,
    summary: report.summary,
    organicSummary: report.organicSummary,
    channels: report.channels,
    error: report.error,
  };
}

export async function getGa4Pages(options?: { range?: Ga4Range }) {
  const report = await getGa4Report(options);
  return {
    connected: report.connected,
    propertyId: report.propertyId,
    range: report.range,
    pages: report.pages,
    landingPages: report.landingPages,
    businessOpportunities: report.businessOpportunities,
    error: report.error,
  };
}

export async function getGa4Events(options?: { range?: Ga4Range }) {
  const report = await getGa4Report(options);
  return {
    connected: report.connected,
    propertyId: report.propertyId,
    range: report.range,
    events: report.events,
    error: report.error,
  };
}

async function runGa4Report({
  propertyId,
  range,
  dimension,
  channelFilter,
  limit = 1,
}: {
  propertyId: string;
  range: Ga4Range;
  dimension?: Ga4Dimension;
  channelFilter?: string;
  limit?: number;
}) {
  const accessToken = await getGoogleAccessToken();
  const { startDate, endDate } = getDateRange(range);
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: dimension ? [{ name: dimension }] : undefined,
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
        { name: "eventCount" },
      ],
      orderBys: dimension ? [{ metric: { metricName: "sessions" }, desc: true }] : undefined,
      dimensionFilter: channelFilter
        ? {
            filter: {
              fieldName: "sessionDefaultChannelGroup",
              stringFilter: { matchType: "EXACT", value: channelFilter },
            },
          }
        : undefined,
      limit,
    }),
    signal: AbortSignal.timeout(18000),
  });
  const payload = (await response.json()) as Ga4RunReportResponse & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Erreur API Google Analytics Data.");
  }
  return payload;
}

function mapGa4Summary(values: Array<{ value?: string }>): Ga4Summary {
  return {
    activeUsers: numberValue(values[0]?.value),
    sessions: numberValue(values[1]?.value),
    pageViews: numberValue(values[2]?.value),
    engagementRate: numberValue(values[3]?.value),
    averageSessionDuration: numberValue(values[4]?.value),
    eventCount: numberValue(values[5]?.value),
  };
}

function mapGa4DimensionRows<T extends "path" | "channel">(
  rows: NonNullable<Ga4RunReportResponse["rows"]>,
  key: T,
): Array<(T extends "path" ? { path: string } : { channel: string }) & Ga4Summary> {
  return rows.map((row) => ({
    [key]: row.dimensionValues?.[0]?.value ?? "(not set)",
    ...mapGa4Summary(row.metricValues ?? []),
    ...(key === "path" ? { entranceRate: 0, conversions: inferPageConversions(row.metricValues?.[5]?.value), businessSeoScore: 0 } : {}),
  })) as Array<(T extends "path" ? { path: string } : { channel: string }) & Ga4Summary>;
}

function mapGa4PageRows(rows: NonNullable<Ga4RunReportResponse["rows"]>): Ga4PageMetric[] {
  return rows.map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "(not set)",
    ...mapGa4Summary(row.metricValues ?? []),
    entranceRate: 0,
    conversions: inferPageConversions(row.metricValues?.[5]?.value),
    businessSeoScore: 0,
  }));
}

function mapGa4Events(rows: NonNullable<Ga4RunReportResponse["rows"]>): Ga4EventMetric[] {
  return rows.map((row) => {
    const summary = mapGa4Summary(row.metricValues ?? []);
    return {
      eventName: row.dimensionValues?.[0]?.value ?? "(not set)",
      eventCount: summary.eventCount,
      activeUsers: summary.activeUsers,
      conversions: inferConversions(row.dimensionValues?.[0]?.value ?? "", summary.eventCount),
    };
  });
}

function addBusinessScore(page: Ga4PageMetric): Ga4PageMetric {
  const engagementScore = Math.min(35, page.engagementRate * 35);
  const sessionScore = Math.min(25, Math.log10(Math.max(1, page.sessions)) * 12);
  const conversionScore = Math.min(30, page.conversions * 8);
  const depthScore = Math.min(10, Math.log10(Math.max(1, page.pageViews)) * 5);
  return {
    ...page,
    businessSeoScore: Math.max(0, Math.min(100, Math.round(engagementScore + sessionScore + conversionScore + depthScore))),
  };
}

function detectGa4BusinessOpportunities(
  pages: Ga4PageMetric[],
  landingPages: Ga4PageMetric[],
  organicSummary: Ga4Summary,
): Ga4BusinessOpportunity[] {
  const opportunities: Ga4BusinessOpportunity[] = [];

  for (const page of landingPages) {
    if (page.sessions >= 20 && page.conversions === 0) {
      opportunities.push({
        type: "traffic_no_conversion",
        page: page.path,
        title: "Trafic sans conversion",
        detail: `${page.path} génère ${page.sessions} sessions mais aucun événement de conversion détecté.`,
        priority: page.sessions >= 80 ? "Critique" : "Haute",
        action: "Ajouter ou renforcer CTA, preuve sociale, formulaire et tracking d'événement.",
      });
    }
    if (page.sessions >= 10 && page.engagementRate < 0.45) {
      opportunities.push({
        type: "good_position_low_engagement",
        page: page.path,
        title: "Engagement faible",
        detail: `${page.path} a un taux d'engagement de ${formatPercent(page.engagementRate)}.`,
        priority: "Haute",
        action: "Clarifier la promesse, ajouter sections de réassurance et améliorer le premier écran.",
      });
    }
  }

  for (const page of pages) {
    if (page.pageViews >= 30 && page.sessions < 8) {
      opportunities.push({
        type: "clicks_low_visits",
        page: page.path,
        title: "Vues sans parcours clair",
        detail: `${page.path} a ${page.pageViews} vues mais peu de sessions qualifiées.`,
        priority: "Moyenne",
        action: "Vérifier les liens internes, le CTA et la cohérence entre intention SEO et contenu.",
      });
    }
  }

  if (organicSummary.sessions > 0) {
    opportunities.push({
      type: "organic_growth",
      page: "Organic Search",
      title: "Trafic organique mesurable",
      detail: `${organicSummary.sessions} sessions SEO détectées sur la période.`,
      priority: "Moyenne",
      action: "Croiser les pages organiques avec Search Console pour prioriser conversion et maillage.",
    });
  }

  opportunities.push({
    type: "cta_tracking",
    page: "tracking",
    title: "Préparer le suivi conversion",
    detail: "Prévoir le suivi des formulaires, clics CTA, demandes d'audit et Calendly.",
    priority: "Haute",
    action: "Normaliser les événements GA4: form_submit, cta_click, audit_request, calendly_booking.",
  });

  return opportunities.slice(0, 24);
}

async function saveGa4PageMetrics(
  propertyId: string,
  range: Ga4Range,
  startDate: string,
  endDate: string,
  pages: Ga4PageMetric[],
) {
  if (!process.env.DATABASE_URL || !pages.length) return;

  try {
    const sql = getNeonClient();
    await sql`
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
    `;
    await sql`
      DELETE FROM ga4_page_metrics
      WHERE account_id = ${accountId}
        AND project_id = ${projectId}
        AND property_id = ${propertyId}
        AND range_label = ${range}
        AND start_date = ${startDate}
        AND end_date = ${endDate}
    `;

    for (const page of pages) {
      await sql`
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
          ${accountId},
          ${projectId},
          ${siteId},
          ${propertyId},
          ${page.path},
          ${range},
          ${startDate},
          ${endDate},
          ${page.activeUsers},
          ${page.sessions},
          ${page.pageViews},
          ${page.engagementRate},
          ${page.averageSessionDuration},
          ${page.eventCount},
          ${page.conversions},
          ${page.businessSeoScore},
          NOW()
        )
      `;
    }
  } catch (error) {
    console.warn("[google-analytics] Page metrics persistence skipped", {
      error: error instanceof Error ? error.message : error,
      propertyId,
      range,
    });
  }
}

async function saveGa4Events(
  propertyId: string,
  range: Ga4Range,
  startDate: string,
  endDate: string,
  events: Ga4EventMetric[],
) {
  if (!process.env.DATABASE_URL || !events.length) return;

  try {
    const sql = getNeonClient();
    await sql`
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
    `;
    await sql`
      DELETE FROM ga4_events
      WHERE account_id = ${accountId}
        AND project_id = ${projectId}
        AND property_id = ${propertyId}
        AND range_label = ${range}
        AND start_date = ${startDate}
        AND end_date = ${endDate}
    `;

    for (const event of events) {
      await sql`
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
          ${accountId},
          ${projectId},
          ${siteId},
          ${propertyId},
          ${event.eventName},
          ${range},
          ${startDate},
          ${endDate},
          ${event.eventCount},
          ${event.activeUsers},
          ${event.conversions},
          NOW()
        )
      `;
    }
  } catch (error) {
    console.warn("[google-analytics] Event metrics persistence skipped", {
      error: error instanceof Error ? error.message : error,
      propertyId,
      range,
    });
  }
}

async function saveBusinessOpportunities(propertyId: string, opportunities: Ga4BusinessOpportunity[]) {
  if (!process.env.DATABASE_URL || !opportunities.length) return;

  try {
    const sql = getNeonClient();
    await sql`
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
    `;

    for (const opportunity of opportunities) {
      await sql`
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
          ${accountId},
          ${projectId},
          ${siteId},
          ${propertyId},
          ${opportunity.page},
          ${opportunity.type},
          ${opportunity.priority},
          ${opportunity.title},
          ${opportunity.detail},
          ${opportunity.action},
          NOW()
        )
      `;
    }
  } catch (error) {
    console.warn("[google-analytics] Business opportunities persistence skipped", {
      error: error instanceof Error ? error.message : error,
      propertyId,
    });
  }
}

function emptyGa4Report(input: {
  propertyId: string | null;
  range: Ga4Range;
  startDate: string;
  endDate: string;
  hasAnalyticsScope: boolean;
  error: string;
}): Ga4Report {
  return {
    connected: false,
    propertyId: input.propertyId,
    range: input.range,
    startDate: input.startDate,
    endDate: input.endDate,
    hasAnalyticsScope: input.hasAnalyticsScope,
    summary: {
      activeUsers: 0,
      sessions: 0,
      pageViews: 0,
      engagementRate: 0,
      averageSessionDuration: 0,
      eventCount: 0,
    },
    organicSummary: {
      activeUsers: 0,
      sessions: 0,
      pageViews: 0,
      engagementRate: 0,
      averageSessionDuration: 0,
      eventCount: 0,
    },
    pages: [],
    landingPages: [],
    channels: [],
    events: [],
    businessOpportunities: [],
    error: input.error,
  };
}

function getDateRange(range: Ga4Range) {
  const end = new Date();
  end.setDate(end.getDate() - 2);
  const start = new Date(end);
  start.setDate(start.getDate() - (range === "28d" ? 27 : 89));

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function numberValue(value?: string) {
  return Number(value ?? 0);
}

function inferConversions(eventName: string, eventCount: number) {
  return /generate_lead|form_submit|audit_request|contact|conversion|calendly|cta_click/i.test(eventName) ? eventCount : 0;
}

function inferPageConversions(eventCount?: string) {
  return 0 * numberValue(eventCount);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}
