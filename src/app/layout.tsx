import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { ChartGradients } from "@/components/chart-gradients";
import { NightSky } from "@/components/night-sky";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Every numeric value renders in mono, per the design system.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// The editorial voice, and the answer to a fair complaint that the product
// looked like every other dashboard. Inter is the most common UI face on the
// web; DESIGN.md described the pairing as having "no stylistic opinion", which
// for a portfolio piece is a weakness rather than restraint.
//
// The reasoning is about what this product *is*. It does not trade, does not
// tick, and does not advise — its output is written prose, a daily narrative
// and summarised news. It is far closer to a financial paper's evening edition
// than to a terminal, and terminal typography would misrepresent it by
// implying something is still moving. A serif for the words and a grotesque for
// the instruments is the newspaper structure, and it says "read, edited,
// considered" — which is exactly this product's claim and precisely what a
// competitor optimising for confident prediction cannot say.
//
// Source Serif 4 rather than a fashionable display serif: it is drawn for
// reading on screens, it is sober rather than mannered, and it will not look
// dated in a year. Variable, so the whole 200-900 range costs one file.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "US TechMarket",
  description: "Daily AI intelligence for US Technology stocks.",
};

// There is one theme. The pre-paint script that used to sit here read a stored
// "light" preference and rewrote data-theme before hydration; with light mode
// dropped it has nothing to decide, so the script, the attribute and the
// suppressHydrationWarning it required are all gone rather than left inert.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full">
        {/* The sky sits behind everything, fixed, at z-index -1 — inside the
            root stacking context so every backdrop-filter above it has
            something to sample. It is the first child so it paints first. */}
        <NightSky />
        {/* The sidebar is only 3 items, so this costs little on most visits —
            but it was still missing, on a codebase that otherwise author its
            own a11y fixes rather than skip them. First focusable element in
            the document, invisible until it receives focus. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-fill focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Sidebar />
        {/* min-w-0 is load-bearing, not tidying. A flex item defaults to
            min-width:auto, so without it <main> cannot shrink below its
            content's min-content width — the 880px watchlist table and the
            560px intraday chart pushed the whole page sideways instead of
            scrolling inside their own overflow-x-auto wrappers. */}
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
          {children}
        </main>
        <ChartGradients />
      </body>
    </html>
  );
}
