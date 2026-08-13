-- US TechMarket — initial schema
-- Covers: watchlist, price cache, intraday snapshots, news, AI summaries, events.
-- No auth/user system (see CLAUDE.md) — single global watchlist, RLS enabled with
-- no policies so the anon/publishable key gets zero access; all reads/writes go
-- through Next.js API routes using the service_role key.

-- Which of the Top 20 stocks are on the single global watchlist. 10-item cap is
-- enforced in application code, not here.
CREATE TABLE watchlist (
  symbol TEXT PRIMARY KEY,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Latest quote per symbol (watchlist + Top 20 + index proxies). Relative volume
-- is computed from volume / avg_volume at read time.
CREATE TABLE price_cache (
  symbol TEXT PRIMARY KEY,
  price NUMERIC NOT NULL,
  change NUMERIC NOT NULL,
  change_percent NUMERIC NOT NULL,
  volume BIGINT,
  avg_volume BIGINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only price/volume time series. Backs Home page sparklines and the
-- Today's Activity intraday chart/timeline (Phase 2 and Phase 4 both read from
-- this instead of separate storage).
-- Cadence: every 15 minutes during US market hours (9:30am-4:00pm ET) — chosen
-- for smoother sparklines within free-tier cron limits (~26 snapshots/day/symbol).
CREATE TABLE intraday_snapshots (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  price NUMERIC NOT NULL,
  volume BIGINT,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_intraday_snapshots_symbol_time ON intraday_snapshots (symbol, snapshot_at);

-- Cached Finnhub articles, deduped on Finnhub's own article id.
CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  finnhub_id BIGINT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('company', 'industry', 'market')),
  headline TEXT NOT NULL,
  source_url TEXT NOT NULL,
  image_url TEXT,
  related_symbols TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_news_published_at ON news (published_at DESC);
CREATE INDEX idx_news_category ON news (category);

-- AI-generated paraphrase per article (never Finnhub's raw snippet), produced
-- one Gemini call per fetch cycle covering all new articles together.
CREATE TABLE news_summaries (
  news_id BIGINT PRIMARY KEY REFERENCES news(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Earnings date + earnings call only, from Finnhub's calendar. Powers Today's
-- Activity "Upcoming Events".
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('earnings_date', 'earnings_call')),
  event_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_symbol ON events (symbol);

-- Today's Activity AI Daily Summary — one narrative per stock per day, produced
-- by the end-of-day batch job from structured data (price, volume, news, events).
CREATE TABLE daily_summaries (
  symbol TEXT NOT NULL,
  summary_date DATE NOT NULL,
  summary TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (symbol, summary_date)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE intraday_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
