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
);

CREATE TABLE IF NOT EXISTS search_console_sites (
  id BIGSERIAL PRIMARY KEY,
  account_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  site_url TEXT NOT NULL,
  permission_level TEXT,
  selected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, project_id, site_url)
);

CREATE TABLE IF NOT EXISTS search_console_page_metrics (
  id BIGSERIAL PRIMARY KEY,
  account_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  site_url TEXT NOT NULL,
  page_url TEXT NOT NULL,
  range_label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(10, 6) NOT NULL DEFAULT 0,
  position NUMERIC(10, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, project_id, site_url, page_url, range_label, start_date, end_date)
);

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
  opportunity_type TEXT,
  detected_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE search_console_query_metrics
  ADD COLUMN IF NOT EXISTS opportunity_score INTEGER,
  ADD COLUMN IF NOT EXISTS opportunity_type TEXT,
  ADD COLUMN IF NOT EXISTS detected_action TEXT;

CREATE TABLE IF NOT EXISTS seo_google_opportunities (
  id BIGSERIAL PRIMARY KEY,
  account_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  site_url TEXT NOT NULL,
  page_url TEXT,
  query TEXT,
  opportunity_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_console_page_metrics_site_page
  ON search_console_page_metrics(site_url, page_url);

CREATE INDEX IF NOT EXISTS idx_search_console_query_metrics_site_query
  ON search_console_query_metrics(site_url, query);

CREATE UNIQUE INDEX IF NOT EXISTS uq_search_console_query_metrics
  ON search_console_query_metrics(account_id, project_id, site_url, COALESCE(page_url, ''), query, range_label, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_seo_google_opportunities_status
  ON seo_google_opportunities(status, priority);
