// US market session state, evaluated in America/New_York so it stays correct
// across EST/EDT without the server's own timezone mattering.

const OPEN_MINUTES = 9 * 60 + 30; // 09:30 ET
const CLOSE_MINUTES = 16 * 60; // 16:00 ET

export function isMarketOpen(at: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(at);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return false;

  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  return minutes >= OPEN_MINUTES && minutes < CLOSE_MINUTES;
}

/** Calendar date in ET, as YYYY-MM-DD — the "trading day" key used for summaries. */
export function tradingDay(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(at);
}
