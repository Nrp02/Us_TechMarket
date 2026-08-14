// Upcoming events for Today's Activity: earnings date and earnings call, from
// Finnhub's calendar. Nothing else — no free API covers conference/product
// calendars, and hand-entering events is neither AI-powered nor repeatable.
//
// Like every other upstream client, this is only ever reached from a scheduled
// ingestion job (see the eslint guard in eslint.config.mjs).

const BASE = "https://finnhub.io/api/v1";

/** How far ahead the calendar is queried. */
const LOOKAHEAD_DAYS = 120;

export type EventType = "earnings_date" | "earnings_call";

export type CalendarEvent = {
  symbol: string;
  eventType: EventType;
  /** Instant used for ordering only — see `note` for what is actually shown. */
  eventAt: Date;
  /** Reporting window as Finnhub reports it, or null when it omits one. */
  note: string | null;
};

type RawEarnings = {
  earningsCalendar?: {
    symbol: string;
    date: string;
    hour?: string;
  }[];
};

/**
 * Finnhub reports *when in the day* a company reports as a window code, not a
 * time. Each window is mapped to a UTC hour purely so the two rows for one
 * earnings date sort in a sensible order; all three land on the same New York
 * calendar date under both EST and EDT, and the UI renders the label below
 * rather than a clock time, so no timestamp is ever invented.
 */
const WINDOWS: Record<string, { hourUtc: number; label: string }> = {
  bmo: { hourUtc: 11, label: "Before market open" },
  dmh: { hourUtc: 15, label: "During market hours" },
  amc: { hourUtc: 21, label: "After market close" },
};

/** Noon UTC is 07:00–08:00 in New York, so it is always the same ET date. */
function dateInstant(day: string, hourUtc = 12): Date {
  return new Date(`${day}T${String(hourUtc).padStart(2, "0")}:00:00Z`);
}

function isoDay(at: Date): string {
  return at.toISOString().slice(0, 10);
}

/**
 * Upcoming earnings for one symbol. Returns an empty list rather than throwing
 * when the calendar has nothing — a company with no scheduled earnings is a
 * normal state, not a failure.
 */
export async function fetchEvents(symbol: string): Promise<CalendarEvent[]> {
  const from = isoDay(new Date());
  const to = isoDay(new Date(Date.now() + LOOKAHEAD_DAYS * 86_400_000));
  const url =
    `${BASE}/calendar/earnings?from=${from}&to=${to}` +
    `&symbol=${encodeURIComponent(symbol)}&token=${process.env.FINNHUB_API_KEY}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Finnhub /calendar/earnings -> ${res.status}`);

  const raw = (await res.json()) as RawEarnings;

  return (raw.earningsCalendar ?? []).flatMap((row) => {
    const events: CalendarEvent[] = [
      {
        symbol,
        eventType: "earnings_date",
        eventAt: dateInstant(row.date),
        note: "Quarterly results",
      },
    ];

    // The call is only a separate event when Finnhub actually says which window
    // it falls in; without that it would just be a duplicate of the date above.
    const window = WINDOWS[row.hour ?? ""];
    if (window) {
      events.push({
        symbol,
        eventType: "earnings_call",
        eventAt: dateInstant(row.date, window.hourUtc),
        note: window.label,
      });
    }

    return events;
  });
}
