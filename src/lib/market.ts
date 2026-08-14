// US market session state, evaluated in America/New_York so it stays correct
// across EST/EDT without the server's own timezone mattering.

const OPEN_MINUTES = 9 * 60 + 30; // 09:30 ET
const CLOSE_MINUTES = 16 * 60; // 16:00 ET

/** Minutes past midnight ET, or null on a weekend. */
function sessionMinutes(at: Date): number | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(at);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return null;

  return Number(get("hour")) * 60 + Number(get("minute"));
}

export function isMarketOpen(at: Date = new Date()): boolean {
  const minutes = sessionMinutes(at);
  return minutes != null && minutes >= OPEN_MINUTES && minutes < CLOSE_MINUTES;
}

/** How long after 16:00 ET the closing price is still worth collecting. */
const CLOSING_WINDOW_MINUTES = 30;

/**
 * True in the minutes just after the bell.
 *
 * `isMarketOpen` is exclusive of 16:00, so a schedule gated on it alone stops
 * refreshing at 15:45 and the last price ever written is a mid-session quote —
 * which the Today's Activity page then labels "at last close" and the summary
 * prompt hands to the model as the closing price. Letting the ingestion job run
 * once more after the bell is what makes those two labels true.
 */
export function isClosingWindow(at: Date = new Date()): boolean {
  const minutes = sessionMinutes(at);
  return (
    minutes != null &&
    minutes >= CLOSE_MINUTES &&
    minutes < CLOSE_MINUTES + CLOSING_WINDOW_MINUTES
  );
}

/** Calendar date in ET, as YYYY-MM-DD — the "trading day" key used for summaries. */
export function tradingDay(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(at);
}
