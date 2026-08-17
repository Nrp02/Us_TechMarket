import { fetchAllNews, type RawArticle } from "@/lib/finnhub-news";
import { generateJson, SAFETY_RULES } from "@/lib/gemini";
import { selectForSummary } from "@/lib/news-select";
import { db } from "@/lib/supabase";
import { TOP_20_SYMBOLS } from "@/lib/symbols";

// One ingestion cycle: fetch -> store every new article -> ONE batched Gemini
// call blurbing as many of the un-blurbed ones as fit -> store those blurbs.
//
// Storing and summarising are deliberately separate steps, and storing goes
// first. They used to be one: the batch cap was applied before the upsert, so
// anything past the cap was never stored at all and the article was simply lost
// until a later cycle happened to re-fetch it. That silently cost the AI Daily
// Summary most of its input — measured at 55% of one day's articles missing
// when the end-of-day job ran, with six stocks told "no news" on a day they all
// had some. Storage is unbounded now; only the Gemini batch is capped.
//
// The displayed blurb must be an AI paraphrase, never Finnhub's raw snippet
// pasted through: the snippet is copyrighted source text and only ever travels
// into the prompt as input.

/**
 * Upper bound on articles handed to a single batched Gemini call — this bounds
 * summarisation only, never storage (see `ingestNews` below: every fetched
 * article is upserted regardless of this constant). Summarising costs roughly a
 * second per article, so a 40-article batch measured ~50s against the 60s
 * function limit — too little headroom. An oversized batch also truncates the
 * model's JSON mid-string and loses every summary in it, but because storage no
 * longer depends on this cap, that failure is now recoverable: the affected
 * articles stay stored with no blurb and `selectForSummary` picks them up on
 * the next cycle. At 25 a cycle lands comfortably inside the 55s budget, and
 * six cycles a day (150 slots) comfortably clears the ~90 articles/day the
 * feeds produce, so the queue is not expected to survive a cycle in practice.
 */
const MAX_PER_CYCLE = 25;

/**
 * The route's own ceiling (its maxDuration is 60s). Bounds the Gemini call so a
 * hung or slow request is aborted with a reported failure — an article's
 * summary backfills on the next cycle — rather than the call running unbounded
 * until the platform kills the function mid-job.
 */
const JOB_BUDGET_MS = 55_000;

export type IngestResult = {
  fetched: number;
  alreadyStored: number;
  /** Articles written to `news` this cycle. No longer bounded by the batch cap. */
  stored: number;
  summarised: number;
  /**
   * Fetched articles that still carry no blurb once this cycle is done, and so
   * are candidates for the next one. Expected to be 0 in steady state; a
   * non-zero value means either the batch cap bit or the Gemini call failed.
   */
  awaitingSummary: number;
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
  const startedJobAt = Date.now();
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
    stored: 0,
    summarised: 0,
    awaitingSummary: 0,
    geminiCalls: 0,
    tokens: undefined,
    failed,
  };
  if (!articles.length) return result;

  // One read covering both questions this cycle has to answer: which articles
  // are already stored (so they are not written twice), and which of those
  // already carry a blurb (so they are not summarised twice). news_summaries'
  // primary key is news_id, so PostgREST embeds a single object here even though
  // the client's inferred type says array — the same caveat as queries.ts.
  const { data: existing } = await db
    .from("news")
    .select("id, finnhub_id, news_summaries(summary)")
    .in(
      "finnhub_id",
      articles.map((a) => a.finnhubId),
    );

  const newsIdByFinnhubId = new Map<number, number>();
  const hasSummary = new Set<number>();
  for (const row of existing ?? []) {
    const finnhubId = Number(row.finnhub_id);
    newsIdByFinnhubId.set(finnhubId, row.id as number);
    const embedded = row.news_summaries as unknown as { summary: string } | null;
    if (embedded?.summary) hasSummary.add(finnhubId);
  }

  // Store everything new, uncapped. This is the whole point of the split: the
  // article is on record before any AI call is attempted, so a slow, failed or
  // truncated Gemini request costs a blurb rather than the article itself.
  const fresh = articles.filter((a) => !newsIdByFinnhubId.has(a.finnhubId));
  result.alreadyStored = articles.length - fresh.length;

  if (fresh.length) {
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

    for (const row of inserted ?? []) {
      newsIdByFinnhubId.set(Number(row.finnhub_id), row.id as number);
    }
    result.stored = inserted?.length ?? 0;
  }

  const toSummarise = selectForSummary(articles, hasSummary, MAX_PER_CYCLE);
  const pending = articles.filter((a) => !hasSummary.has(a.finnhubId)).length;
  result.awaitingSummary = pending;
  if (!toSummarise.length) return result;

  // Exactly one Gemini call per cycle, covering the whole selection together.
  //
  // No in-call retries. Each retry is a real request against the free tier's
  // 20/day, which six cycles could exhaust on their own, and retrying is now
  // redundant: a failed call leaves these articles stored and un-blurbed, so
  // the next cycle's selection picks them up unchanged. Same reasoning as the
  // call site in daily-summary.ts.
  let summaries = new Map<string, string>();
  try {
    const { data, tokens } = await generateJson<{ id: string; summary: string }[]>(
      buildPrompt(toSummarise),
      SUMMARY_SCHEMA,
      { retries: 0, timeoutMs: JOB_BUDGET_MS - (Date.now() - startedJobAt) },
    );
    result.geminiCalls = 1;
    result.tokens = tokens;
    summaries = new Map(data.map((d) => [String(d.id), d.summary]));
  } catch (error) {
    // The articles are already stored, so this costs blurbs and nothing else.
    // What must never happen is showing Finnhub's raw snippet instead.
    failed.push(error instanceof Error ? error.message : "gemini failed");
  }

  const summaryRows = toSummarise.flatMap((article) => {
    const summary = summaries.get(String(article.finnhubId));
    const newsId = newsIdByFinnhubId.get(article.finnhubId);
    return summary && newsId != null
      ? [{ news_id: newsId, summary, generated_at: new Date().toISOString() }]
      : [];
  });

  if (summaryRows.length) {
    const { error: summaryError } = await db
      .from("news_summaries")
      .upsert(summaryRows, { onConflict: "news_id" });
    if (summaryError) throw new Error(`news_summaries upsert: ${summaryError.message}`);
    result.summarised = summaryRows.length;
    result.awaitingSummary = pending - summaryRows.length;
  }

  return result;
}
