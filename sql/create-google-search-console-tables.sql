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
  seo_potential INTEGER,
  priority TEXT,
  estimated_clicks_gain INTEGER,
  opportunity_type TEXT,
  detected_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE search_console_query_metrics
  ADD COLUMN IF NOT EXISTS opportunity_score INTEGER,
  ADD COLUMN IF NOT EXISTS seo_potential INTEGER,
  ADD COLUMN IF NOT EXISTS priority TEXT,
  ADD COLUMN IF NOT EXISTS estimated_clicks_gain INTEGER,
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

CREATE TABLE IF NOT EXISTS seo_ai_recommendations (
  id BIGSERIAL PRIMARY KEY,
  account_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  recommendation_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);

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
);

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
);

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
);

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
);

CREATE TABLE IF NOT EXISTS seo_audit_runs (
  id BIGSERIAL PRIMARY KEY,
  run_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  pages_count INTEGER NOT NULL DEFAULT 0,
  average_score INTEGER NOT NULL DEFAULT 0,
  priority_pages INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'https://www.corsaimanager.com',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE seo_audit_runs
  ADD COLUMN IF NOT EXISTS run_type TEXT NOT NULL DEFAULT 'full';

CREATE TABLE IF NOT EXISTS seo_audit_page_results (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT REFERENCES seo_audit_runs(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  h1 TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  h2_count INTEGER NOT NULL DEFAULT 0,
  h3_count INTEGER NOT NULL DEFAULT 0,
  faq_count INTEGER NOT NULL DEFAULT 0,
  internal_links_count INTEGER NOT NULL DEFAULT 0,
  cta_count INTEGER NOT NULL DEFAULT 0,
  schema_count INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  score_breakdown JSONB,
  extracted JSONB,
  issues TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  recommendations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE seo_audit_page_results
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS h1 TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS h2_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS h3_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS faq_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS internal_links_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cta_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS schema_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB,
  ADD COLUMN IF NOT EXISTS extracted JSONB;

CREATE TABLE IF NOT EXISTS seo_audit_cache_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_console_page_metrics_site_page
  ON search_console_page_metrics(site_url, page_url);

CREATE INDEX IF NOT EXISTS idx_search_console_query_metrics_site_query
  ON search_console_query_metrics(site_url, query);

CREATE UNIQUE INDEX IF NOT EXISTS uq_search_console_query_metrics
  ON search_console_query_metrics(account_id, project_id, site_url, COALESCE(page_url, ''), query, range_label, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_seo_google_opportunities_status
  ON seo_google_opportunities(status, priority);

CREATE INDEX IF NOT EXISTS idx_seo_ai_recommendations_site_page
  ON seo_ai_recommendations(site_id, page_url, status);

CREATE INDEX IF NOT EXISTS idx_ga4_page_metrics_site_page
  ON ga4_page_metrics(site_id, page_path);

CREATE INDEX IF NOT EXISTS idx_ga4_events_property_event
  ON ga4_events(property_id, event_name);

CREATE INDEX IF NOT EXISTS idx_seo_business_opportunities_status
  ON seo_business_opportunities(site_id, status, priority);

CREATE INDEX IF NOT EXISTS idx_seo_exports_site_created
  ON seo_exports(site_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_action_plan_items_level
  ON seo_action_plan_items(site_id, level, status);

CREATE INDEX IF NOT EXISTS idx_seo_audit_runs_completed
  ON seo_audit_runs(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_audit_runs_type_completed
  ON seo_audit_runs(run_type, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_audit_page_results_run
  ON seo_audit_page_results(run_id, priority);
