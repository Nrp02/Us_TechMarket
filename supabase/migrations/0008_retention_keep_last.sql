-- Never prune away the LAST surviving data.
--
-- 0007 deleted on absolute age alone, which is correct while the app is
-- running but dangerous when it is not. Supabase pauses a free-tier project
-- after ~7 days of inactivity; cron stops with it, so nothing is deleted
-- while paused. On resume, the 04:00 UTC run then finds that EVERY row is
-- older than 7 days and removes all of them at once — sparklines blank,
-- getLatestSessionDay() null, News empty until the next ingest cycle, and no
-- AI summary until the next post-close run. For a demo whose whole purpose is
-- a working link to show a professor, "resumed the project the day before and
-- it wiped itself" is the one failure that matters.
--
-- Each DELETE is now conditional on newer data actually existing, so the job
-- trims history but can never empty a table. Postgres evaluates the EXISTS
-- against the statement's snapshot, i.e. the pre-delete state, so the guard
-- reads "is there anything inside the window to keep?" rather than chasing
-- its own deletions.
--
-- Everything else from 0007 is unchanged: same 7-day window, same function
-- name, so the existing `data-retention-cleanup` cron job keeps calling this
-- with no re-scheduling. news_summaries still cascades from news.
CREATE OR REPLACE FUNCTION prune_old_data() RETURNS void AS $$
BEGIN
  DELETE FROM news
  WHERE published_at < now() - interval '7 days'
    AND EXISTS (
      SELECT 1 FROM news WHERE published_at >= now() - interval '7 days'
    );

  DELETE FROM intraday_snapshots
  WHERE snapshot_at < now() - interval '7 days'
    AND EXISTS (
      SELECT 1 FROM intraday_snapshots WHERE snapshot_at >= now() - interval '7 days'
    );

  DELETE FROM timeline_events
  WHERE trading_day < (now() - interval '7 days')::date
    AND EXISTS (
      SELECT 1 FROM timeline_events WHERE trading_day >= (now() - interval '7 days')::date
    );

  DELETE FROM daily_summaries
  WHERE summary_date < (now() - interval '7 days')::date
    AND EXISTS (
      SELECT 1 FROM daily_summaries WHERE summary_date >= (now() - interval '7 days')::date
    );
END;
$$ LANGUAGE plpgsql;
