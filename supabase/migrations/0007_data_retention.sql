-- Keep only ~1 week of history. Every ingestion job (see 0001) writes to
-- these tables forever with nothing pruning them; on a free-tier project that
-- runs for weeks this eventually fills up.
--
-- Pure SQL, run directly inside Postgres rather than through a Next.js API
-- route the way intraday-snapshots/news-ingest/daily-summaries are — there is
-- no upstream API (Finnhub/Yahoo/Gemini) involved, so it needs no secret and
-- no deployment URL, and unlike those three, `cron.job_run_details` for this
-- job IS a reliable source of truth: there is no `pg_net` HTTP round trip to
-- fail silently.
--
-- news_summaries needs no DELETE of its own — news_id is
-- REFERENCES news(id) ON DELETE CASCADE (0001_init.sql), so pruning news
-- cleans it automatically.
--
-- daily_summaries is included: every read of it (src/lib/queries.ts,
-- getActivityUncached) fetches only the single latest trading day per symbol,
-- never a range, and there is no UI to browse a past day's summary. A 7-day
-- window (rather than "just today") comfortably covers the fact that the
-- "latest session" over a weekend is still Friday's row.
--
-- price_cache is deliberately excluded: it's a fixed ~25-row cache (one row
-- per symbol, always upserted, never grows), so pruning it saves no storage
-- while breaking pages until the next refresh repopulates it. events
-- (earnings calendar) is excluded too — low, bounded volume.
--
-- This bounds storage; it does not by itself guarantee the News page never
-- shows anything older than 7 days, since this runs once a day and so can lag
-- by up to ~24h. That guarantee comes from a query-level floor in
-- src/lib/queries.ts instead.
CREATE OR REPLACE FUNCTION prune_old_data() RETURNS void AS $$
BEGIN
  DELETE FROM news WHERE published_at < now() - interval '7 days';
  DELETE FROM intraday_snapshots WHERE snapshot_at < now() - interval '7 days';
  DELETE FROM timeline_events WHERE trading_day < (now() - interval '7 days')::date;
  DELETE FROM daily_summaries WHERE summary_date < (now() - interval '7 days')::date;
END;
$$ LANGUAGE plpgsql;

-- 04:00 UTC daily: after the last news-ingest cycle (02:00 UTC), well before
-- the next intraday-snapshots or news-ingest ticks (12:00-13:00 UTC).
SELECT cron.schedule('data-retention-cleanup', '0 4 * * *', 'SELECT prune_old_data();');
