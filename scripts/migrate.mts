// Applies supabase/migrations/*.sql in filename order, once each.
// Run with: npm run migrate
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { Client } from "pg";

const DIR = join(process.cwd(), "supabase", "migrations");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

// Same posture as every app table: RLS on, no policies, so the anon key sees
// nothing. This connection is the table owner, which RLS never applies to
// (only FORCE ROW LEVEL SECURITY would), so the reads below still work.
await client.query("ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY");

const { rows } = await client.query<{ name: string }>(
  "SELECT name FROM schema_migrations",
);
const applied = new Set(rows.map((r) => r.name));

for (const name of readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort()) {
  if (applied.has(name)) {
    console.log(`skip  ${name}`);
    continue;
  }
  const sql = readFileSync(join(DIR, name), "utf8");
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
    await client.query("COMMIT");
    console.log(`apply ${name}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`FAIL  ${name}:`, (error as Error).message);
    process.exitCode = 1;
    break;
  }
}

await client.end();
