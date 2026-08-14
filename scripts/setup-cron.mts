// Provisions the Supabase Cron schedules that drive all ingestion.
// Run with: npm run setup-cron
//
// This is a script rather than a migration because the schedule needs the
// deployment URL and the shared secret, and a migration file would commit them
// to git. Secrets are read from .env.local and stored in Supabase Vault; the
// scheduled command reads them back out at run time, so nothing here or in the
// database's job definition contains a literal secret.
//
// Idempotent — safe to re-run after rotating the secret or changing the URL.
import pkg from "pg";

const { Client } = pkg;

const { CRON_SECRET, APP_BASE_URL, DATABASE_URL } = process.env;

if (!CRON_SECRET || !APP_BASE_URL) {
  console.error("CRON_SECRET and APP_BASE_URL must be set in .env.local");
  process.exit(1);
}

// The market-hours check lives in the endpoint (evaluated in America/New_York),
// so this window only has to be wide enough to contain the US session under
// both EST and EDT. A tighter UTC expression would drift by an hour at each DST
// changeover; a wider one just costs a few no-op ticks.
const JOBS = [
  {
    name: "intraday-snapshots",
    schedule: "*/15 13-21 * * 1-5",
    path: "/api/refresh",
  },
  // ~4x/day. Fixed UTC hours land within an hour of the 08:00 / 12:00 / 16:30 /
  // 20:00 ET targets year-round; news ingestion has no market-hours gate, so a
  // DST shift changes nothing that matters here.
  {
    name: "news-ingest",
    schedule: "0 12,16,21,1 * * *",
    path: "/api/ingest-news",
  },
  // End-of-day Today's Activity summaries. Each run summarises the next couple
  // of watchlist symbols that still lack one, so the list finishes across
  // several runs rather than in a single call that would overrun the 60s
  // function limit; the spare runs also absorb the model's intermittent 503s.
  //
  // 21:05 UTC is 16:05 ET under EST and 17:05 ET under EDT — after the close in
  // both, which is what the handler's own America/New_York check enforces. The
  // :05 offset keeps every run clear of the 21:00 news cycle, which has to land
  // first so the day's articles are in the database before they are summarised.
  {
    name: "daily-summaries",
    schedule: "5-55/10 21-22 * * 1-5",
    path: "/api/daily-summary",
  },
];

// A cold news cycle can take ~45s, so pg_net must outwait the function rather
// than aborting a run that is still working.
const REQUEST_TIMEOUT_MS = 60000;

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

async function putSecret(name: string, value: string) {
  const { rows } = await client.query<{ id: string }>(
    "SELECT id FROM vault.secrets WHERE name = $1",
    [name],
  );
  if (rows.length) {
    await client.query("SELECT vault.update_secret($1, $2, $3)", [
      rows[0].id,
      value,
      name,
    ]);
    console.log(`vault  update ${name}`);
  } else {
    await client.query("SELECT vault.create_secret($1, $2)", [value, name]);
    console.log(`vault  create ${name}`);
  }
}

await putSecret("cron_secret", CRON_SECRET);
await putSecret("app_base_url", APP_BASE_URL);

for (const job of JOBS) {
  // cron.unschedule throws if the job is absent, so check first.
  const { rows } = await client.query(
    "SELECT 1 FROM cron.job WHERE jobname = $1",
    [job.name],
  );
  if (rows.length) await client.query("SELECT cron.unschedule($1)", [job.name]);

  const command = `
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'app_base_url')
             || '${job.path}',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' ||
          (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := ${REQUEST_TIMEOUT_MS}
    );`;

  await client.query("SELECT cron.schedule($1, $2, $3)", [
    job.name,
    job.schedule,
    command,
  ]);
  console.log(`cron   ${job.name}  ${job.schedule}  -> ${job.path}`);
}

const { rows: scheduled } = await client.query(
  "SELECT jobname, schedule, active FROM cron.job ORDER BY jobname",
);
console.table(scheduled);

await client.end();
