import { formatDay, formatEtTime } from "@/lib/format";
import { isMarketOpen } from "@/lib/market";
import { getSessionStamp } from "@/lib/queries";

/**
 * The one thing in the shell that answers "when".
 *
 * It exists because the product runs on New York time and is read from
 * Bangkok. Home stated the session date and the other two routes did not, so
 * "Top Movers Today", "Today's Timeline" and "What happened to NVDA today" all
 * asserted a day that nothing on those pages named — and a visitor eight hours
 * ahead of New York cannot infer it. This states the day once, on every route,
 * with the zone attached.
 *
 * `formatEtTime` is the only place in the product that prints "ET"; the string
 * is never assembled by hand. The time is the newest stored snapshot, not the
 * clock: this is a stamp of what the page is showing, and it does not tick.
 * Nothing here loops, refreshes or re-renders on a timer, which is the whole
 * motion argument of the product held in its most visible element.
 *
 * "Session of" is the vocabulary Today's Activity already uses. It is
 * load-bearing rather than decorative: on a Saturday the session is Friday's,
 * so a bare date in the shell would read as the calendar day and be wrong by
 * one or two days exactly when a visitor is most likely to be looking.
 */
export async function SessionMarker() {
  const stamp = await getSessionStamp();
  if (!stamp) return null;

  const open = isMarketOpen();

  return (
    // Two groups, each whitespace-nowrap, and the wrap between them is the
    // point. Below 1000px this line has the nav card to itself, and at 390 the
    // three facts need 368px against 324 — so something must break. Left to
    // itself the flex line broke inside "Market closed", which reads as a
    // rendering fault; grouped, it breaks where a dateline would break anyway:
    // the state on one line, the session and the stamp on the next.
    //
    // No separator between the two groups: the gap does that work, and a
    // leading "·" stranded at the start of the second line is exactly the kind
    // of debris the keycap rule already caught once in this card.
    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
      <span className="flex items-center gap-2 whitespace-nowrap">
        {/* The dot the session digest used to carry, without its halo: this is
            shell, and shell stays recessive while the page behind it changes.
            The state is also written as a word, so the colour is never the
            only channel — including at 390, which is why nothing is dropped
            here to buy back the 16px the second line costs. */}
        <span
          aria-hidden
          className={`size-2 shrink-0 rounded-full ${open ? "bg-semantic-up" : "bg-muted"}`}
        />
        <span className="font-semibold text-body">
          {open ? "Market open" : "Market closed"}
        </span>
      </span>

      {/* Mono and tabular, because a date and a clock time are measured values
          — the same rule that governs every figure in a column. */}
      <span className="whitespace-nowrap font-mono tabular-nums">
        Session of {formatDay(stamp.day)}
        <span aria-hidden> · </span>
        {formatEtTime(stamp.at)}
      </span>
    </p>
  );
}
