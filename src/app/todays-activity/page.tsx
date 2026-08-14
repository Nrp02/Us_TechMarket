import { redirect } from "next/navigation";

import { readWatchlist } from "@/lib/watchlist";

// Today's Activity is always a page about one stock. The sidebar link lands
// here, so it forwards to the first watchlist stock rather than showing a
// picker the header switcher already provides.
//
// There is no empty state to handle: the watchlist has a minimum of one and
// falls back to a default, so readWatchlist never returns an empty list.
export const dynamic = "force-dynamic";

export default async function TodaysActivity() {
  const [first] = await readWatchlist();
  redirect(`/todays-activity/${first}`);
}
