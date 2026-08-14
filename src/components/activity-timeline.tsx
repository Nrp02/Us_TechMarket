import { formatEtTime } from "@/lib/format";
import type { TimelineEntry } from "@/lib/queries";

// Reconstructed once by the end-of-day job from stored snapshots and news, then
// read straight from the table here — no polling, no live listener.

const DOT: Record<TimelineEntry["kind"], string> = {
  market_open: "bg-muted",
  market_close: "bg-muted",
  price_milestone: "bg-primary",
  high_volume: "bg-primary",
  news: "bg-semantic-up",
};

export function ActivityTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-ink">Today&apos;s Timeline</h2>

      {entries.length ? (
        <ol className="rounded-3xl border border-hairline bg-canvas p-5">
          {entries.map((entry, i) => (
            <li key={`${entry.at}-${entry.kind}-${i}`} className="flex gap-4">
              {/* The rail is drawn per row so it stops cleanly at the last one. */}
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${DOT[entry.kind]}`}
                  aria-hidden
                />
                {i < entries.length - 1 && (
                  <span className="w-px flex-1 bg-hairline" aria-hidden />
                )}
              </div>

              <div className={i < entries.length - 1 ? "pb-5" : ""}>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-mono text-xs tabular-nums text-muted">
                    {formatEtTime(entry.at)}
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {entry.label}
                  </span>
                </div>
                {entry.detail && (
                  <p className="mt-0.5 text-sm leading-relaxed text-body">
                    {entry.detail}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-3xl border border-hairline bg-canvas px-5 py-10 text-sm text-muted">
          The timeline is built after the close, from the session&apos;s stored
          snapshots.
        </p>
      )}
    </section>
  );
}
