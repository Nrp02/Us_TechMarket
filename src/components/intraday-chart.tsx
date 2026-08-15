import { formatEtTime, formatPrice, formatVolume } from "@/lib/format";
import type { IntradayPoint } from "@/lib/queries";

// Price and volume for the session, drawn from the same intraday_snapshots table
// the sparklines read. No chart library and no client JavaScript: the hover
// readout is a native SVG <title> on a transparent hit column, which the browser
// renders as a tooltip on its own.
//
// Price and volume share the time axis but never a y-axis. They are two stacked
// panels with separate scales, not one plot with a second axis bolted on — a
// dual-axis chart lets the crossing point of two unrelated scales imply a
// relationship that isn't in the data.

const WIDTH = 780;
const GUTTER = 64; // right-hand strip reserved for the value labels
const LEFT = 4;
const PLOT_RIGHT = WIDTH - GUTTER;

const PRICE_TOP = 14;
const PRICE_BOTTOM = 188;
const VOLUME_TOP = 216;
const VOLUME_BOTTOM = 278;
const AXIS_Y = 296;
const HEIGHT = 304;

/** Roughly this many time labels, thinned to whole bars. */
const TIME_LABELS = 5;

export function IntradayChart({
  points,
  up,
}: {
  points: IntradayPoint[];
  up: boolean;
}) {
  if (points.length < 2) {
    return (
      <p className="rounded-3xl border border-hairline bg-canvas px-5 py-10 text-sm text-muted">
        No intraday snapshots stored for this session yet.
      </p>
    );
  }

  const prices = points.map((p) => p.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const span = high - low || 1;

  const volumes = points.map((p) => p.volume ?? 0);
  const peakVolume = Math.max(...volumes) || 1;

  const step = (PLOT_RIGHT - LEFT) / (points.length - 1);
  const x = (i: number) => LEFT + i * step;
  const priceY = (value: number) =>
    PRICE_BOTTOM - ((value - low) / span) * (PRICE_BOTTOM - PRICE_TOP);

  const stroke = up ? "var(--color-semantic-up)" : "var(--color-semantic-down)";
  const line = points.map((p, i) => `${x(i).toFixed(1)},${priceY(p.price).toFixed(1)}`);

  // Bars sit a little narrower than their slot so neighbours never touch.
  const barWidth = Math.max(step - 2, 1.5);

  // Label the first and last bar, plus an even spread between. A periodic label
  // that lands close to the final one is dropped rather than drawn over it.
  const labelEvery = Math.max(1, Math.round(points.length / TIME_LABELS));
  const last = points.length - 1;
  const labelled = new Set<number>([0, last]);
  for (let i = labelEvery; i < last - labelEvery * 0.6; i += labelEvery) {
    labelled.add(i);
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-hairline bg-canvas p-5">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label={`Intraday price and volume, from ${formatPrice(low)} to ${formatPrice(high)}`}
      >
        {/* Grid stays recessive — it is a reference, not part of the data. */}
        {[high, low + span / 2, low].map((value) => {
          const y = priceY(value);
          return (
            <g key={value}>
              <line
                x1={LEFT}
                x2={PLOT_RIGHT}
                y1={y}
                y2={y}
                stroke="var(--color-hairline)"
                strokeWidth={1}
              />
              <text
                x={PLOT_RIGHT + 10}
                y={y + 4}
                className="fill-[var(--color-muted)] font-mono text-[11px]"
              >
                {formatPrice(value)}
              </text>
            </g>
          );
        })}

        <polyline
          points={line.join(" ")}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Volume panel: its own baseline and its own scale. */}
        <line
          x1={LEFT}
          x2={PLOT_RIGHT}
          y1={VOLUME_BOTTOM}
          y2={VOLUME_BOTTOM}
          stroke="var(--color-hairline)"
          strokeWidth={1}
        />
        <text
          x={PLOT_RIGHT + 10}
          y={VOLUME_TOP + 10}
          className="fill-[var(--color-muted)] font-mono text-[11px]"
        >
          {formatVolume(peakVolume)}
        </text>
        <text
          x={LEFT}
          y={VOLUME_TOP - 8}
          className="fill-[var(--color-muted)] text-[11px] font-semibold"
        >
          Volume
        </text>

        {points.map((point, i) => {
          const height =
            ((point.volume ?? 0) / peakVolume) * (VOLUME_BOTTOM - VOLUME_TOP);
          return (
            <rect
              key={point.at}
              x={x(i) - barWidth / 2}
              y={VOLUME_BOTTOM - height}
              width={barWidth}
              height={Math.max(height, 0)}
              rx={2}
              // Its own token rather than surface-strong: these bars are data,
              // so they answer to the 3:1 floor for graphical objects. On
              // surface-strong they measured 1.26:1 against the card.
              fill="var(--color-chart-bar)"
            />
          );
        })}

        {/* Time axis, shared by both panels above. */}
        {points.map((point, i) =>
          labelled.has(i) ? (
            <text
              key={point.at}
              x={x(i)}
              y={AXIS_Y}
              // The end labels are anchored inward so neither runs off the plot.
              textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
              className="fill-[var(--color-muted)] font-mono text-[11px]"
            >
              {formatEtTime(point.at).replace(" ET", "")}
            </text>
          ) : null,
        )}

        {/* Transparent hit columns give a native tooltip per bar without JS. */}
        {points.map((point, i) => (
          <rect
            key={`hit-${point.at}`}
            x={x(i) - step / 2}
            y={PRICE_TOP}
            width={step}
            height={VOLUME_BOTTOM - PRICE_TOP}
            fill="transparent"
          >
            <title>
              {`${formatEtTime(point.at)} · ${formatPrice(point.price)}` +
                (point.volume == null
                  ? ""
                  : ` · ${formatVolume(point.volume)} shares`)}
            </title>
          </rect>
        ))}
      </svg>
    </div>
  );
}
