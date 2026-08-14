import { fetchAllNews, type RawArticle } from "@/lib/finnhub-news";
import { generateJson, SAFETY_RULES } from "@/lib/gemini";
import { db } from "@/lib/supabase";
import { TOP_20_SYMBOLS } from "@/lib/symbols";

// One ingestion cycle: fetch -> drop anything already stored -> ONE batched
// Gemini call covering every new article -> store.
//
// The displayed blurb must be an AI paraphrase, never Finnhub's raw snippet
// pasted through: the snippet is copyrighted source text and only ever travels
// into the prompt as input.

/**
 * Upper bound on articles handed to a single batched call. Summarising costs
 * roughly a second per article, so a 40-article batch measured ~50s against a
 * 60s function limit — too little headroom, and an oversized batch also
 * truncates the model's JSON mid-string and loses every summary in it. At 15 a
 * cycle lands comfortably inside the limit, and four cycles a day still clear
 * more articles than the feeds produce.
 */
const MAX_PER_CYCLE = 15;

export type IngestResult = {
  fetched: number;
  alreadyStored: number;
  /** New articles left for the next cycle because the batch cap was reached. */
  deferred: number;
  summarised: number;
  geminiCalls: number;
  tokens: number | undefined;
  failed: string[];
};

const SUMMARY_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      id: { type: "STRING" },
      summary: { type: "STRING" },
    },
    required: ["id", "summary"],
  },
};

function buildPrompt(articles: RawArticle[]): string {
  const items = articles.map((a) => ({
    id: String(a.finnhubId),
    headline: a.headline,
    source_text: a.snippet,
  }));

  return `You are summarising financial news articles for a stock-tracking dashboard.

For each article below, write a 2-3 sentence summary in your own words. Do not copy
phrasing from the headline or source_text — rewrite the substance in plain language.
Describe only what happened. If the source_text is empty or too thin to summarise,
base the summary solely on the headline and keep it to one sentence.

${SAFETY_RULES}

Return one entry per article, using the same id you were given.

Articles:
${JSON.stringify(items, null, 2)}`;
}

export async function ingestNews(): Promise<IngestResult> {
  const failed: string[] = [];

  // All 20 symbols in one pass. Company-vs-industry is no longer decided here:
  // the watchlist is per-visitor, so the split is derived at read time from the
  // tickers stored on each row. This is the same number of Finnhub calls as
  // before, since watched + industry was already the whole Top 20.
  const { articles, errors } = await fetchAllNews(TOP_20_SYMBOLS);
  failed.push(...errors);
  const result: IngestResult = {
    fetched: articles.length,
    alreadyStored: 0,
    deferred: 0,
    summarised: 0,
    geminiCalls: 0,
    tokens: undefined,
    failed,
  };
  if (!articles.length) return result;

  // Dedup against what is already stored, so a re-run never re-summarises and
  // never writes a second copy of the same article.
  const { data: existing } = await db
    .from("news")
    .select("finnhub_id")
    .in(
      "finnhub_id",
      articles.map((a) => a.finnhubId),
    );
  const known = new Set((existing ?? []).map((r) => Number(r.finnhub_id)));

  // One Gemini call must cover the whole cycle, so the cycle itself is bounded
  // rather than the call being split. An oversized batch truncates the model's
  // JSON mid-string and loses every summary in it. Anything over the cap stays
  // unstored and is simply picked up by the next cycle.
  const allFresh = articles.filter((a) => !known.has(a.finnhubId));
  const fresh = allFresh.slice(0, MAX_PER_CYCLE);

  result.alreadyStored = articles.length - allFresh.length;
  result.deferred = allFresh.length - fresh.length;
  if (!fresh.length) return result;

  // Exactly one Gemini call per cycle, covering every new article together.
  let summaries = new Map<string, string>();
  try {
    const { data, tokens } = await generateJson<{ id: string; summary: string }[]>(
      buildPrompt(fresh),
      SUMMARY_SCHEMA,
    );
    result.geminiCalls = 1;
    result.tokens = tokens;
    summaries = new Map(data.map((d) => [String(d.id), d.summary]));
  } catch (error) {
    // Articles are still worth storing without a blurb; the next cycle can
    // backfill. What must never happen is showing Finnhub's raw snippet instead.
    failed.push(error instanceof Error ? error.message : "gemini failed");
  }

  const { data: inserted, error } = await db
    .from("news")
    .upsert(
      fresh.map((a) => ({
        finnhub_id: a.finnhubId,
        headline: a.headline,
        source_url: a.sourceUrl,
        image_url: a.imageUrl,
        related_symbols: a.relatedSymbols,
        published_at: a.publishedAt.toISOString(),
      })),
      { onConflict: "finnhub_id" },
    )
    .select("id, finnhub_id");

  if (error) throw new Error(`news upsert: ${error.message}`);

  const summaryRows = (inserted ?? []).flatMap((row) => {
    const summary = summaries.get(String(row.finnhub_id));
    return summary
      ? [{ news_id: row.id as number, summary, generated_at: new Date().toISOString() }]
      : [];
  });

  if (summaryRows.length) {
    const { error: summaryError } = await db
      .from("news_summaries")
      .upsert(summaryRows, { onConflict: "news_id" });
    if (summaryError) throw new Error(`news_summaries upsert: ${summaryError.message}`);
    result.summarised = summaryRows.length;
  }

  return result;
}
