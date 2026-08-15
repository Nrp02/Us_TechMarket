// The page's own atmosphere: one fixed layer behind everything, carrying the
// ambient blue (from the `night-sky` utility in globals.css) and the starfield
// below it.
//
// Server-rendered inline SVG, and deliberately not a client component. The
// product's rule is that nothing renders on the client for a purely visual
// gain, and a starfield is the purest possible case of that. No canvas, no
// image request, no runtime randomness — the coordinates below are literals,
// so the sky is byte-identical on every render and can be hand-tuned.
//
// THE STARS DO NOT TWINKLE, and that is a product decision rather than a
// performance one. This interface reports a session that has already closed;
// nothing in it ticks, flashes or pulses, because a completed day that shimmers
// is lying with its motion design. A quiet midnight sky, not a screensaver.

// [x, y, radius, opacity] in the 1600x1000 viewBox.
//
// Sparse and top-biased: density falls off toward the bottom, away from the
// ambient core, and no two stars sit within 62 units of each other — a clump
// reads as a galaxy, which is the one thing the sky must not look like.
const DIM: [number, number, number, number][] = [
  [1334.7, 789.4, 0.85, 0.14],
  [864.9, 713.3, 0.93, 0.22],
  [271, 291.8, 0.81, 0.11],
  [1001.1, 113.5, 0.71, 0.2],
  [1462.9, 387.9, 0.75, 0.19],
  [1082.5, 180.9, 0.93, 0.1],
  [788.9, 429.7, 1.08, 0.14],
  [1099.8, 960.6, 1.1, 0.18],
  [623.5, 724.6, 0.76, 0.15],
  [1152.1, 320.1, 1.1, 0.21],
  [1594.6, 30.5, 1.15, 0.13],
  [576.1, 433.8, 0.78, 0.1],
  [29.1, 371.1, 0.93, 0.22],
  [749.9, 680.1, 1.16, 0.25],
  [1302.4, 941, 0.74, 0.22],
  [1004.7, 184.8, 1.28, 0.11],
  [754, 353.5, 0.87, 0.25],
  [201.6, 166.1, 1.29, 0.22],
  [148.3, 660.1, 1.17, 0.13],
  [998.2, 396.4, 1.25, 0.13],
  [895.7, 207.3, 0.96, 0.16],
  [137.3, 473.9, 0.85, 0.18],
  [552, 639.7, 1.2, 0.14],
  [1288.7, 486.5, 0.84, 0.15],
  [145.5, 231.7, 0.97, 0.15],
  [766.2, 905.7, 0.86, 0.13],
  [914.9, 310.3, 0.84, 0.13],
  [271.3, 202.8, 0.74, 0.2],
  [597.7, 177.3, 0.85, 0.24],
  [91.3, 557.5, 1.01, 0.19],
  [487, 178, 1.26, 0.19],
  [969, 576.3, 0.87, 0.22],
  [365.1, 607.3, 1.15, 0.13],
  [25.8, 952.2, 0.9, 0.21],
  [631.9, 276.6, 1.22, 0.14],
  [1383.8, 355.8, 1, 0.11],
  [1282.9, 93.2, 1.27, 0.18],
  [14.8, 121.5, 1.09, 0.23],
  [278.8, 388.8, 1.21, 0.12],
  [1045.4, 281, 1.29, 0.25],
  [1441.7, 973.3, 0.73, 0.15],
  [579, 962.2, 0.82, 0.16],
  [1363.6, 497.8, 1.23, 0.26],
  [1374.8, 870, 1.07, 0.2],
  [824.1, 66.2, 1.06, 0.18],
  [611.8, 82.1, 1, 0.22],
  [625.4, 565.3, 1.12, 0.14],
  [456.2, 291.1, 1.11, 0.16],
  [1255.3, 20.7, 1.16, 0.11],
  [965.2, 235.5, 0.75, 0.18],
  [1207.8, 594.2, 1.09, 0.14],
  [1469.2, 639.1, 0.81, 0.13],
  [1303.1, 344.5, 0.76, 0.19],
  [630, 348.9, 1.13, 0.16],
  [516.8, 10.3, 1.1, 0.21],
  [1554.9, 821.9, 0.75, 0.17],
  [789.4, 275.4, 0.94, 0.26],
  [132.2, 89.6, 1.18, 0.15],
  [1491, 243.3, 0.94, 0.14],
  [416.4, 368.1, 1.02, 0.24],
  [1157.9, 199.7, 0.87, 0.21],
  [174.3, 358.4, 0.91, 0.11],
  [1368.2, 142, 1.08, 0.22],
  [165.8, 549.2, 1.26, 0.14],
  [359.4, 895.5, 1.15, 0.26],
  [1301.2, 578.7, 0.8, 0.17],
];

// The handful of brighter stars, each with a soft halo.
//
// Constrained to x < 270 or x > 1330 on purpose: those bands fall outside the
// 1200px content column, so a bright star never ends up behind a panel. A dim
// star bleeding through glass moves the local field by a couple of RGB units
// and is what the material is for; a crisp bright one would be a hot spot under
// the text, and the Worst-Case Composite Rule does not model point sources.
const BRIGHT: [number, number, number, number][] = [
  [69, 556.4, 1.33, 0.55],
  [1346.5, 166, 1.3, 0.44],
  [1377.5, 485.4, 1.54, 0.53],
  [1583.9, 211.2, 1.86, 0.58],
  [269.2, 126.4, 1.36, 0.45],
  [245.1, 443.4, 1.66, 0.43],
  [1568.4, 508.3, 1.39, 0.57],
  [1582.2, 876.6, 1.44, 0.45],
  [1471.1, 19, 1.79, 0.43],
];

export function NightSky() {
  return (
    <div className="night-sky" aria-hidden>
      <svg
        // `slice` scales the field to cover the viewport and crops the excess,
        // so stars stay round at every aspect ratio. `none` would stretch them
        // into ellipses on a wide laptop.
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
        focusable="false"
      >
        <defs>
          {/* One gradient reused by every halo. A flat circle at low opacity
              would read as a visible disc rather than a glow. */}
          <radialGradient id="star-glow">
            <stop offset="0%" stopColor="#eaf0ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#eaf0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Blue-white rather than pure white — a star in a navy sky picks up
            the sky. */}
        <g fill="#dfe7ff">
          {DIM.map(([cx, cy, r, o], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} opacity={o} />
          ))}
        </g>

        <g>
          {BRIGHT.map(([cx, cy, r, o], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r * 6} fill="url(#star-glow)" opacity={o * 0.55} />
              <circle cx={cx} cy={cy} r={r} fill="#eaf0ff" opacity={o} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
