-- The News page's date picker needs one thing from the news table: which ET
-- days have at least one article. It used to get that by selecting
-- `published_at` from EVERY row and collapsing them into a Set in JS, on the
-- reasoning (recorded at that call site) that the table was "measured in the
-- low hundreds of rows" and a Postgres function was not worth adding for one
-- dropdown.
--
-- That reasoning expired and took the whole page down with it. PostgREST caps a
-- response at 1000 rows; the table reached 1402 inside its own 7-day retention
-- window, so `readRows` saw 1000 of 1402, refused to render from partial data,
-- and /news served the error boundary on every request — reproduced 5/5, on
-- every tab, digest 2018010110.
--
-- Nothing was wrong with retention: measured 2026-08-31 -> 2026-09-07, exactly
-- the window 0007 keeps. The pipeline simply publishes ~175 articles a day now
-- (8 cycles, PER_SYMBOL 8), so a date bound could not have helped — those 1402
-- rows ARE the bounded set. The fix is to stop reading rows to answer a
-- question about days.
--
-- `(published_at AT TIME ZONE 'America/New_York')::date` is the exact SQL
-- equivalent of tradingDay() in src/lib/market.ts: the ET calendar date of the
-- instant, with no weekend rolling. The days this returns therefore compare
-- directly against every other date string in the app.
--
-- The result is one row per day — at most the 7 retained days plus whatever
-- boundary day the cleanup lag leaves behind — so it cannot approach the row
-- cap again no matter how many articles a day holds.
CREATE OR REPLACE FUNCTION public.news_days()
RETURNS TABLE (day date)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT DISTINCT (published_at AT TIME ZONE 'America/New_York')::date
  FROM news
  ORDER BY 1 DESC
$$;

-- PostgREST caches the schema; without this the first call after deploy can 404
-- with "Could not find the function public.news_days in the schema cache".
NOTIFY pgrst, 'reload schema';
