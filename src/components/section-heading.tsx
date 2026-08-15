import type { ReactNode } from "react";

// Every section on every page opened with `text-lg font-semibold text-ink` and
// an ad-hoc right-hand note, repeated in eight components with three different
// alignment choices between them. After the one display heading the page had no
// further steps in its ramp, so eight sections all read as the same rank.
//
// One step up in size and a hairline running from the heading to the meta: the
// rule is what makes a section start read as a start, and it costs no vertical
// space because it sits on the baseline the two ends already share.

export function SectionHeading({
  children,
  meta,
  id,
}: {
  children: ReactNode;
  meta?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline gap-4">
      <h2
        id={id}
        className="shrink-0 text-xl font-semibold tracking-tight text-ink"
      >
        {children}
      </h2>
      <span className="h-px min-w-4 flex-1 bg-hairline" aria-hidden />
      {meta && <span className="shrink-0 text-xs text-muted">{meta}</span>}
    </div>
  );
}
