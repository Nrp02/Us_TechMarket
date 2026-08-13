-- Scheduler for all ingestion.
--
-- Vercel Cron cannot do this job: the project is on the Hobby plan, which
-- allows a cron job to run at most once per day, and more frequent expressions
-- fail at deploy time. Intraday snapshots need ~15-minute cadence, so the
-- schedule lives in Postgres instead.
--
-- Only the extensions are created here. The schedules themselves need the
-- deployment URL and the shared secret, which must not be committed, so they
-- are provisioned by scripts/setup-cron.mts reading from .env.local.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
