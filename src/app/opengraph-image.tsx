import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// The link preview, and it is a real surface for this product rather than SEO
// housekeeping: PRODUCT.md records that the app is "opened from a link" as well
// as walked through live, so for anyone the owner sends it to, this card is the
// first thing the product ever shows them.
//
// It is the same world, rebuilt in the subset of CSS the OG renderer supports.
// No SVG filters here, so the weather is two radial gradients rather than
// displaced fractal noise, and the starfield is a list of positioned dots. The
// masthead is the real Source Serif 4 and the strapline the real Inter, both
// vendored under `assets/` — the OG renderer cannot use `next/font`, and a card
// set in a fallback face would be a picture of a different product.
//
// Statically generated. This route has no params and reads nothing dynamic, so
// the PNG is produced once during `next build` and served as a static asset:
// no font read, no render and no dependency at request time.

export const alt =
  "US TechMarket — daily intelligence for US technology stocks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// [left %, top %, diameter px, opacity]. Kept out of the left third, which is
// where the type sits — a star behind a letterform is a smudge, not a star.
const STARS: [number, number, number, number][] = [
  [46, 12, 3, 0.5], [58, 26, 5, 0.75], [67, 8, 3, 0.45], [74, 34, 7, 0.9],
  [82, 17, 3, 0.5], [90, 40, 4, 0.6], [63, 52, 3, 0.4], [78, 61, 5, 0.7],
  [88, 72, 3, 0.45], [95, 22, 3, 0.5], [55, 74, 4, 0.55], [70, 84, 3, 0.4],
  [84, 90, 5, 0.6], [93, 58, 3, 0.35], [48, 40, 3, 0.35], [52, 62, 3, 0.3],
  [60, 92, 3, 0.35], [97, 84, 3, 0.4], [44, 86, 3, 0.3], [8, 8, 3, 0.35],
  [18, 90, 3, 0.3], [30, 6, 3, 0.3], [5, 74, 4, 0.4], [26, 94, 3, 0.28],
];

export default async function Image() {
  const [serif, inter] = await Promise.all([
    readFile(join(process.cwd(), "assets/source-serif-600.ttf")),
    readFile(join(process.cwd(), "assets/inter-400.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 88px",
          backgroundColor: "#01040c",
          // The weather, entering from the right edge — the same side the
          // dominant cloud mass sits on in the live sky.
          backgroundImage:
            "radial-gradient(circle at 104% 30%, rgba(41,84,166,0.55), rgba(1,4,12,0) 55%), radial-gradient(circle at 88% 96%, rgba(26,60,124,0.4), rgba(1,4,12,0) 45%)",
        }}
      >
        {STARS.map(([x, y, d, o], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: d,
              height: d,
              borderRadius: d,
              backgroundColor: "#dde3ec",
              opacity: o,
            }}
          />
        ))}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Source Serif 4",
              fontSize: 104,
              color: "#f2f4f7",
              letterSpacing: "-0.012em",
              lineHeight: 1.06,
            }}
          >
            US TechMarket
          </div>

          {/* The same hairline that opens every section in the product. */}
          <div
            style={{
              width: 560,
              height: 1,
              marginTop: 34,
              backgroundColor: "#25395e",
            }}
          />

          <div
            style={{
              fontFamily: "Inter",
              fontSize: 30,
              color: "#aeb7c8",
              marginTop: 30,
              maxWidth: 720,
              lineHeight: 1.45,
            }}
          >
            What happened to 20 US technology stocks today — written after the
            close, from recorded prices, volume, news and events.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Source Serif 4", data: serif, weight: 600, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
      ],
    },
  );
}
