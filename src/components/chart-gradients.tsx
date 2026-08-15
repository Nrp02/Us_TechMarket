// The fill gradients every sparkline and the intraday chart paint under their
// price line, defined once for the whole document.
//
// An SVG `url(#id)` reference resolves document-wide, not per-<svg>, so one
// hidden defs block serves the eleven sparklines a Home page renders plus the
// chart on Today's Activity. The alternative — a <defs> inside each sparkline —
// needs a unique id per instance, and these are server components with no
// useId available and no stable key to derive one from.
//
// Two gradients rather than one recoloured by currentColor: SVG gradient stops
// cannot read the element they fill, so a single "session" gradient would need
// a CSS custom property per instance, which is the per-instance problem again.

export function ChartGradients() {
  return (
    <svg
      aria-hidden
      focusable="false"
      // Not `display: none` — Safari drops referenced gradients out of a
      // display:none subtree. Zero-size and absolutely positioned keeps the
      // definitions live without occupying layout.
      className="pointer-events-none absolute size-0"
    >
      <defs>
        <linearGradient id="session-up" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-semantic-up)"
            stopOpacity="0.34"
          />
          <stop
            offset="100%"
            stopColor="var(--color-semantic-up)"
            stopOpacity="0"
          />
        </linearGradient>

        <linearGradient id="session-down" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-semantic-down)"
            stopOpacity="0.34"
          />
          <stop
            offset="100%"
            stopColor="var(--color-semantic-down)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}
