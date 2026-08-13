// Company logo glyphs.
//
// Source: Simple Icons (https://simpleicons.org), CC0-1.0 — chosen over
// scraping brand assets off arbitrary pages, per the logo sourcing rule.
//
// Simple Icons no longer ships marks for Microsoft, Amazon, Oracle, Salesforce,
// Adobe, Texas Instruments, Micron or ServiceNow, so those eight fall back to a
// lettermark plate in components/company-logo.tsx.
import {
  siAmd,
  siApple,
  siBroadcom,
  siCisco,
  siGoogle,
  siIntel,
  siIntuit,
  siMeta,
  siNvidia,
  siPalantir,
  siQualcomm,
  siTesla,
} from "simple-icons";

export type Glyph = { path: string; hex: string };

export const LOGOS: Record<string, Glyph> = {
  NVDA: siNvidia,
  AAPL: siApple,
  GOOGL: siGoogle,
  META: siMeta,
  AVGO: siBroadcom,
  TSLA: siTesla,
  PLTR: siPalantir,
  AMD: siAmd,
  CSCO: siCisco,
  INTC: siIntel,
  QCOM: siQualcomm,
  INTU: siIntuit,
};
