import { createClient } from "@supabase/supabase-js";

// Server-only client. RLS is on with no policies, so every read/write goes
// through the secret key from a route handler or server component — the
// publishable key deliberately has zero access.
export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
);
