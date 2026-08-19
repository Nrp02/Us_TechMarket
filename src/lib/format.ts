const price = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return `$${price.format(value)}`;
}

export function formatChange(value: number): string {
  return `${value >= 0 ? "+" : "−"}${price.format(Math.abs(value))}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : "−"}${price.format(Math.abs(value))}%`;
}

export function formatVolume(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

export function formatRelVolume(value: number | null): string {
  return value == null ? "—" : `${value.toFixed(2)}x`;
}

// Everything time-related is rendered in New York, not the viewer's zone: these
// are US market events, and a Bangkok reader seeing "9:30 PM" for the opening
// bell would be reading a true number that means nothing.

const etTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
});

const etDateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function formatEtTime(iso: string): string {
  return `${etTimeFormat.format(new Date(iso))} ET`;
}

export function formatEtDate(iso: string): string {
  return etDateFormat.format(new Date(iso));
}

const etDateLongFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "long",
  month: "long",
  day: "numeric",
});

/** A YYYY-MM-DD trading day, which carries no time to be shifted by a zone. */
export function formatDay(day: string): string {
  return etDateFormat.format(new Date(`${day}T12:00:00Z`));
}

/**
 * The same trading day, spelled out — for Home's masthead, where the date is
 * the page's headline rather than a value in a corner.
 *
 * The T12:00:00Z is load-bearing and is the reason this shares `formatDay`'s
 * parse rather than taking a shortcut. A bare `new Date("2026-08-18")` parses
 * as UTC midnight, which is 8pm on the 17th in New York, so the formatter
 * would name the wrong weekday for every date in the product. Noon is far
 * enough from both edges that no offset, DST included, can push it across.
 */
export function formatDayLong(day: string): string {
  return etDateLongFormat.format(new Date(`${day}T12:00:00Z`));
}
