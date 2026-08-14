import { redirect } from "next/navigation";

import { getWatchlistSymbols } from "@/lib/queries";

// Today's Activity is always a page about one stock. The sidebar link lands
// here, so it forwards to the first watchlist stock rather than showing a
// picker the header switcher already provides.
export const dynamic = "force-dynamic";

export default async function TodaysActivity() {
  const watchlist = await getWatchlistSymbols();

  if (!watchlist.length) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10">
        <h1 className="text-2xl font-semibold text-ink">Today&apos;s Activity</h1>
        <p className="mt-2 text-sm text-body">
          Add a stock to your watchlist on the Home page to see its daily
          activity here.
        </p>
      </div>
    );
  }

  redirect(`/todays-activity/${watchlist[0]}`);
}
