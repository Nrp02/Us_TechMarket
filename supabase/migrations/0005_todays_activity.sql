-- Phase 4 — Today's Activity.

-- The earnings calendar is re-fetched on every end-of-day run, so the rows need
-- a key to upsert against or the same earnings date would accumulate copies.
-- `note` carries Finnhub's reporting-window label ("Before market open") — it is
-- stored as a label rather than a clock time because Finnhub only reports the
-- window, and turning that into a specific minute would be inventing a timestamp.
ALTER TABLE events
  ADD COLUMN note TEXT,
  ADD CONSTRAINT events_symbol_type_time_key UNIQUE (symbol, event_type, event_at);

-- The AI Daily Summary is a narrative plus a short reasoning list. The bullets
-- are stored apart from the narrative so the page can lay them out separately
-- without parsing prose back out of a single blob.
ALTER TABLE daily_summaries ADD COLUMN bullets TEXT[] NOT NULL DEFAULT '{}';

-- Today's Timeline. Reconstructed once, during the end-of-day batch job, from
-- the intraday snapshots and news already stored — there is no real-time
-- listener and no intraday cron behind it, which would contradict the "AI runs
-- only after market close" principle the schedule is built around. Every row
-- here comes from a plain threshold rule, never from the model.
CREATE TABLE timeline_events (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  trading_day DATE NOT NULL,
  event_at TIMESTAMPTZ NOT NULL,
  kind TEXT NOT NULL CHECK (
    kind IN ('market_open', 'high_volume', 'price_milestone', 'news', 'market_close')
  ),
  label TEXT NOT NULL,
  detail TEXT
);
-- A rebuild deletes the day's rows for a symbol and re-inserts them, so the
-- lookup key is (symbol, trading_day) rather than a uniqueness constraint.
CREATE INDEX idx_timeline_symbol_day ON timeline_events (symbol, trading_day);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
