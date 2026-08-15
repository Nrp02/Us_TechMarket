// Intraday sparkline drawn straight from the stored snapshots — no chart
// library, and no data of its own beyond the points it is handed.

export function Sparkline({
  values,
  up,
  width = 96,
  height = 28,
}: {
  values: number[];
  up: boolean;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) {
    return (
      <span className="inline-block text-xs text-muted" style={{ width }}>
        —
      </span>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const pad = 2;
  const usable = height - pad * 2;

  const points = values
    .map((value, i) => {
      const y = pad + usable - ((value - min) / span) * usable;
      return `${(i * step).toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      role="img"
      // DESIGN.md requires a chart's accessible name to state its range where
      // one exists. This said only "Trending up today", so a screen reader got
      // the direction the adjacent signed number already gave it, and none of
      // the shape.
      aria-label={`${
        up ? "Trending up today" : "Trending down today"
      }, from ${values[0].toFixed(2)} to ${values[values.length - 1].toFixed(
        2,
      )}, session low ${min.toFixed(2)}, high ${max.toFixed(2)}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={up ? "var(--color-semantic-up)" : "var(--color-semantic-down)"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
