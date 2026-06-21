import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getNeonClient } from "@/lib/neon";

export const GOOGLE_SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
export const GOOGLE_ANALYTICS_READONLY_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

const accountId = "corsaimanager-internal";
const projectId = "corsaimanager-seo";
const provider = "google";
const tokenCookieStateName = "cm_google_oauth_state";

export type GoogleConnectionStatus = {
  connected: boolean;
  accountId: string;
  projectId: string;
  siteUrl: string | null;
  expiresAt: string | null;
  scopes: string[];
  error?: string;
};

export type GoogleTokenPayload = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

export type SearchConsoleSite = {
  siteUrl: string;
  permissionLevel: string;
};

export type SearchConsoleMetric = {
  url?: string;
  query?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type PageOpportunity = {
  type: "near_top_10" | "low_ctr" | "needs_content" | "no_impressions" | "new_page";
  title: string;
  detail: string;
  priority: "Critique" | "Haute" | "Moyenne" | "Faible";
  page?: string;
  query?: string;
};

export type SearchPerformanceReport = {
  connected: boolean;
  siteUrl: string | null;
  range: "28d" | "3m";
  startDate: string;
  endDate: string;
  summary: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  pages: SearchConsoleMetric[];
  queries: SearchConsoleMetric[];
  opportunities: PageOpportunity[];
  error?: string;
};

type GoogleConnectionRow = {
  account_id: string;
  project_id: string;
  encrypted_access_token: string;
  encrypted_refresh_token: string | null;
  scope: string[] | string | null;
  token_type: string | null;
  expires_at: Date | string | null;
};

type SearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchAnalyticsResponse = {
  rows?: SearchAnalyticsRow[];
};

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? null;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Configuration Google OAuth incomplete: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET et GOOGLE_REDIRECT_URI sont requis.");
  }

  return { clientId, clientSecret, redirectUri, siteUrl };
}

export function buildGoogleAuthUrl(state: string) {
  const { clientId, redirectUri } = getGoogleOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: GOOGLE_SEARCH_CONSOLE_SCOPE,
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getGoogleOAuthStateCookieName() {
  return tokenCookieStateName;
}

export async function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(15000),
  });

  const payload = (await response.json()) as GoogleTokenPayload & { error?: string; error_description?: string };
  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.error ?? "Echec de l'echange OAuth Google.");
  }

  return payload;
}

export async function saveGoogleConnection(tokens: GoogleTokenPayload) {
  await ensureGoogleTables();
  const sql = getNeonClient();
  const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000);
  const scopes = tokens.scope?.split(" ").filter(Boolean) ?? [GOOGLE_SEARCH_CONSOLE_SCOPE];
  const encryptedAccessToken = encryptToken(tokens.access_token);
  const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;

  await sql`
    INSERT INTO google_connections (
      account_id,
      project_id,
      provider,
      encrypted_access_token,
      encrypted_refresh_token,
      scope,
      token_type,
      expires_at,
      updated_at
    )
    VALUES (
      ${accountId},
      ${projectId},
      ${provider},
      ${encryptedAccessToken},
      ${encryptedRefreshToken},
      ${scopes},
      ${tokens.token_type ?? "Bearer"},
      ${expiresAt.toISOString()},
      NOW()
    )
    ON CONFLICT (account_id, project_id, provider)
    DO UPDATE SET
      encrypted_access_token = EXCLUDED.encrypted_access_token,
      encrypted_refresh_token = COALESCE(EXCLUDED.encrypted_refresh_token, google_connections.encrypted_refresh_token),
      scope = EXCLUDED.scope,
      token_type = EXCLUDED.token_type,
      expires_at = EXCLUDED.expires_at,
      updated_at = NOW()
  `;
}

export async function getGoogleConnectionStatus(): Promise<GoogleConnectionStatus> {
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? null;
  if (!process.env.DATABASE_URL) {
    return { connected: false, accountId, projectId, siteUrl, expiresAt: null, scopes: [], error: "DATABASE_URL non configure." };
  }

  try {
    await ensureGoogleTables();
    const connection = await getStoredConnection();
    if (!connection) {
      return { connected: false, accountId, projectId, siteUrl, expiresAt: null, scopes: [] };
    }

    return {
      connected: true,
      accountId,
      projectId,
      siteUrl,
      expiresAt: connection.expires_at ? new Date(connection.expires_at).toISOString() : null,
      scopes: normalizeScopes(connection.scope),
    };
  } catch (error) {
    return {
      connected: false,
      accountId,
      projectId,
      siteUrl,
      expiresAt: null,
      scopes: [],
      error: error instanceof Error ? error.message : "Connexion Google indisponible.",
    };
  }
}

export async function getSearchConsoleSites(): Promise<SearchConsoleSite[]> {
  const accessToken = await getValidAccessToken();
  const response = await googleApiFetch<{ siteEntry?: SearchConsoleSite[] }>(
    "https://searchconsole.googleapis.com/webmasters/v3/sites",
    accessToken,
  );

  return response.siteEntry ?? [];
}

export async function getSearchPerformance(options?: {
  siteUrl?: string;
  range?: "28d" | "3m";
  dimensions?: Array<"page" | "query">;
  page?: string;
  rowLimit?: number;
}): Promise<SearchConsoleMetric[]> {
  const siteUrl = options?.siteUrl ?? getDefaultSiteUrl();
  const range = options?.range ?? "28d";
  const { startDate, endDate } = getDateRange(range);
  const accessToken = await getValidAccessToken();
  const filters = options?.page
    ? [
        {
          dimension: "page",
          operator: "equals",
          expression: options.page,
        },
      ]
    : undefined;

  const response = await googleApiFetch<SearchAnalyticsResponse>(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: options?.dimensions ?? ["page"],
        rowLimit: options?.rowLimit ?? 50,
        dimensionFilterGroups: filters ? [{ filters }] : undefined,
      }),
    },
  );

  return mapSearchRows(response.rows ?? [], options?.dimensions ?? ["page"]);
}

export async function getQueriesByPage(pageUrl: string, options?: { siteUrl?: string; range?: "28d" | "3m"; rowLimit?: number }) {
  return getSearchPerformance({
    siteUrl: options?.siteUrl,
    range: options?.range,
    dimensions: ["query"],
    page: pageUrl,
    rowLimit: options?.rowLimit ?? 12,
  });
}

export async function getPagesPerformance(options?: { siteUrl?: string; range?: "28d" | "3m"; rowLimit?: number }) {
  return getSearchPerformance({
    siteUrl: options?.siteUrl,
    range: options?.range,
    dimensions: ["page"],
    rowLimit: options?.rowLimit ?? 50,
  });
}

export async function getPageOpportunities(options?: { siteUrl?: string; range?: "28d" | "3m" }) {
  const [pages, queries] = await Promise.all([
    getPagesPerformance({ siteUrl: options?.siteUrl, range: options?.range, rowLimit: 80 }),
    getSearchPerformance({ siteUrl: options?.siteUrl, range: options?.range, dimensions: ["query"], rowLimit: 80 }),
  ]);

  return detectGoogleOpportunities(pages, queries);
}

export async function getSearchConsoleReport(options?: { siteUrl?: string; range?: "28d" | "3m" }): Promise<SearchPerformanceReport> {
  const range = options?.range ?? "28d";
  const siteUrl = options?.siteUrl ?? process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? null;
  const { startDate, endDate } = getDateRange(range);
  const status = await getGoogleConnectionStatus();

  if (!status.connected || !siteUrl) {
    return {
      connected: false,
      siteUrl,
      range,
      startDate,
      endDate,
      summary: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      pages: [],
      queries: [],
      opportunities: [],
      error: status.error ?? (!siteUrl ? "GOOGLE_SEARCH_CONSOLE_SITE_URL non configure." : "Google Search Console non connecte."),
    };
  }

  try {
    const [pages, queries] = await Promise.all([
      getPagesPerformance({ siteUrl, range, rowLimit: 80 }),
      getSearchPerformance({ siteUrl, range, dimensions: ["query"], rowLimit: 80 }),
    ]);

    return {
      connected: true,
      siteUrl,
      range,
      startDate,
      endDate,
      summary: summarizeMetrics(pages),
      pages,
      queries,
      opportunities: detectGoogleOpportunities(pages, queries),
    };
  } catch (error) {
    return {
      connected: false,
      siteUrl,
      range,
      startDate,
      endDate,
      summary: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      pages: [],
      queries: [],
      opportunities: [],
      error: error instanceof Error ? error.message : "Impossible de recuperer les donnees Search Console.",
    };
  }
}

export function detectGoogleOpportunities(pages: SearchConsoleMetric[], queries: SearchConsoleMetric[]): PageOpportunity[] {
  const opportunities: PageOpportunity[] = [];

  for (const page of pages) {
    if (!page.url) continue;
    if (page.impressions >= 250 && page.ctr < 0.02) {
      opportunities.push({
        type: "low_ctr",
        title: "Title/meta à réécrire",
        detail: `${page.url} reçoit ${page.impressions} impressions mais un CTR de ${formatCtr(page.ctr)}.`,
        priority: "Haute",
        page: page.url,
      });
    }
    if (page.position >= 8 && page.position <= 20) {
      opportunities.push({
        type: "near_top_10",
        title: "Page proche du top 10",
        detail: `${page.url} est en position moyenne ${page.position.toFixed(1)}: renforcer contenu, FAQ et maillage interne.`,
        priority: "Critique",
        page: page.url,
      });
    }
    if (page.position > 20 && page.position <= 50 && page.impressions >= 80) {
      opportunities.push({
        type: "needs_content",
        title: "Page à renforcer",
        detail: `${page.url} a des impressions mais reste loin du top 20. Ajouter sections, preuves et liens internes.`,
        priority: "Moyenne",
        page: page.url,
      });
    }
    if (page.impressions === 0) {
      opportunities.push({
        type: "no_impressions",
        title: "Page sans impressions",
        detail: `${page.url} ne génère aucune impression: vérifier indexation, intention et profondeur du contenu.`,
        priority: "Haute",
        page: page.url,
      });
    }
  }

  for (const query of queries) {
    if (!query.query) continue;
    if (query.impressions >= 120 && query.ctr < 0.015) {
      opportunities.push({
        type: "low_ctr",
        title: "Requête avec CTR faible",
        detail: `"${query.query}" génère ${query.impressions} impressions avec ${formatCtr(query.ctr)} de CTR.`,
        priority: "Haute",
        query: query.query,
      });
    }
    if (query.impressions >= 80 && query.position > 15 && query.position <= 45) {
      opportunities.push({
        type: "new_page",
        title: "Nouvelle page potentielle",
        detail: `"${query.query}" mérite peut-être une page dédiée ou une section plus visible.`,
        priority: "Moyenne",
        query: query.query,
      });
    }
  }

  return opportunities.slice(0, 24);
}

async function getValidAccessToken() {
  await ensureGoogleTables();
  const connection = await getStoredConnection();
  if (!connection) throw new Error("Google Search Console n'est pas connecte.");

  const expiresAt = connection.expires_at ? new Date(connection.expires_at).getTime() : 0;
  if (expiresAt > Date.now() + 60_000) {
    return decryptToken(connection.encrypted_access_token);
  }

  if (!connection.encrypted_refresh_token) {
    throw new Error("Refresh token Google absent. Relancez la connexion Google Search Console.");
  }

  const refreshed = await refreshGoogleAccessToken(decryptToken(connection.encrypted_refresh_token));
  await saveGoogleConnection(refreshed);
  return refreshed.access_token;
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<GoogleTokenPayload> {
  const { clientId, clientSecret } = getGoogleOAuthConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(15000),
  });

  const payload = (await response.json()) as GoogleTokenPayload & { error?: string; error_description?: string };
  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.error ?? "Echec du refresh token Google.");
  }

  return { ...payload, refresh_token: refreshToken };
}

async function googleApiFetch<T>(url: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    signal: init?.signal ?? AbortSignal.timeout(18000),
  });

  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Erreur API Google Search Console.");
  }

  return payload;
}

async function getStoredConnection() {
  const sql = getNeonClient();
  const rows = await sql`
    SELECT account_id, project_id, encrypted_access_token, encrypted_refresh_token, scope, token_type, expires_at
    FROM google_connections
    WHERE account_id = ${accountId}
      AND project_id = ${projectId}
      AND provider = ${provider}
    LIMIT 1
  ` as GoogleConnectionRow[];

  return rows[0] ?? null;
}

async function ensureGoogleTables() {
  const sql = getNeonClient();
  await sql`
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
  `;
}

function getDefaultSiteUrl() {
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
  if (!siteUrl) throw new Error("GOOGLE_SEARCH_CONSOLE_SITE_URL non configure.");
  return siteUrl;
}

function getDateRange(range: "28d" | "3m") {
  const end = new Date();
  end.setDate(end.getDate() - 2);
  const start = new Date(end);
  start.setDate(start.getDate() - (range === "28d" ? 27 : 89));

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function mapSearchRows(rows: SearchAnalyticsRow[], dimensions: Array<"page" | "query">): SearchConsoleMetric[] {
  return rows.map((row) => {
    const metric: SearchConsoleMetric = {
      clicks: Math.round(row.clicks ?? 0),
      impressions: Math.round(row.impressions ?? 0),
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    };

    dimensions.forEach((dimension, index) => {
      if (dimension === "page") metric.url = row.keys?.[index];
      if (dimension === "query") metric.query = row.keys?.[index];
    });

    return metric;
  });
}

function summarizeMetrics(metrics: SearchConsoleMetric[]) {
  const clicks = metrics.reduce((sum, item) => sum + item.clicks, 0);
  const impressions = metrics.reduce((sum, item) => sum + item.impressions, 0);
  const weightedPosition = metrics.reduce((sum, item) => sum + item.position * Math.max(1, item.impressions), 0);

  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? weightedPosition / impressions : 0,
  };
}

function normalizeScopes(scopes: string[] | string | null) {
  if (Array.isArray(scopes)) return scopes;
  if (typeof scopes === "string") return scopes.replace(/[{}"]/g, "").split(",").filter(Boolean);
  return [];
}

function encryptToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getTokenKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

function decryptToken(value: string) {
  const [version, iv, tag, encrypted] = value.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Token Google stocke dans un format invalide.");
  const decipher = createDecipheriv("aes-256-gcm", getTokenKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function getTokenKey() {
  const secret = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY ?? process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY ou GOOGLE_CLIENT_SECRET est requis pour chiffrer les tokens Google.");
  return createHash("sha256").update(secret).digest();
}

function formatCtr(ctr: number) {
  return `${(ctr * 100).toFixed(1)}%`;
}
