-- News categories moved from ingest time to query time.
--
-- news.category used to be written when an article was stored, by splitting the
-- Top 20 into watched and unwatched against the one global watchlist. The
-- watchlist is now per-visitor (a cookie), so a value written at ingest time
-- describes nobody: the visitor whose watchlist produced it may never return,
-- and every other visitor would see a split drawn for someone else.
--
-- The category is now derived per request from related_symbols, which the table
-- already stores: no tickers means the general feed, any watchlist ticker means
-- Company, otherwise Industry. Measured against the whole table at the time of
-- this change, that rule reproduces the stored value exactly — 19 of 19
-- general-feed rows carried no tickers and 116 of 116 per-symbol rows carried
-- at least one.
--
-- The column keeps its existing values rather than being dropped, so the old
-- rows stay readable while the change is verified. Drop it in a later migration
-- once nothing has read it for a while. Nothing writes it as of this migration,
-- so new rows are NULL — which the CHECK constraint already permits.
ALTER TABLE news ALTER COLUMN category DROP NOT NULL;

-- Nothing filters on the column any more; the read path filters on
-- related_symbols instead.
DROP INDEX IF EXISTS idx_news_category;

-- The filter that replaced it. Postgres can only use this for the array
-- overlap tests (Company and Industry); the Market tab's "no tickers at all"
-- test is an equality check the planner handles without an index.
CREATE INDEX IF NOT EXISTS idx_news_related_symbols ON news USING GIN (related_symbols);
