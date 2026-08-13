-- Intraday snapshots are backfilled from a full-session bar feed on every
-- refresh, so the same 15-minute bar is offered repeatedly during the day.
-- Without this constraint each refresh would re-insert the whole session and
-- the sparklines would read duplicated points.
ALTER TABLE intraday_snapshots
  ADD CONSTRAINT intraday_snapshots_symbol_time_key UNIQUE (symbol, snapshot_at);
