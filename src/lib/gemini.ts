// Gemini client. Every call from this file is batched and runs inside a
// scheduled ingestion job — never per article, never per visitor.
//
// Model note: CLAUDE.md originally locked "Gemini 2.5 Flash", but that model
// returns 404 "no longer available to new users" for this API key (so does
// gemini-2.5-flash-lite). gemini-3.5-flash is the pinned replacement — pinned
// rather than the `gemini-flash-latest` alias so the summarisation prompt,
// which is tuned against the safety rules below, cannot shift underneath a
// graded demo.

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * The AI Safety / Data Integrity Rules from CLAUDE.md, verbatim in intent.
 * This is the single source of truth for what the model may say; Phase 4's
 * prompt reuses this constant rather than restating a looser version.
 */
export const SAFETY_RULES = `Rules you must follow without exception:
- Never invent news, events, timestamps, or numerical values.
- Never calculate or derive a new numerical value. Only state numbers that appear in the input.
- Never claim that one thing caused another unless the input explicitly states that causal link. Two things appearing together is not grounds to assert one caused the other.
- Never predict future prices, trends, or outcomes.
- Never give investment advice or recommendations of any kind, including framing like "a good entry point", "investors should", or buy/sell/hold language.
- Only use information present in the input you are given. If the input does not support a statement, do not make it.`;

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  error?: { code: number; message: string };
  usageMetadata?: { totalTokenCount?: number };
};

export type GeminiCallResult<T> = {
  data: T;
  tokens: number | undefined;
};

/**
 * One structured-JSON request. Retries only on 429/5xx, because the free tier's
 * per-minute cap is the realistic failure mode here.
 */
export async function generateJson<T>(
  prompt: string,
  responseSchema: Record<string, unknown>,
  { retries = 2 }: { retries?: number } = {},
): Promise<GeminiCallResult<T>> {
  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0,
      // Reasoning tokens are charged against this budget too, so it has to sit
      // well above the visible output or the JSON is truncated mid-string.
      maxOutputTokens: 32768,
      // Latency on this model swings widely with unbounded reasoning — a
      // 13-article batch once took longer than a 40-article one. Capping the
      // budget keeps a cycle inside the 60s function limit. Paraphrasing needs
      // little reasoning, but it is not set to 0: the safety rules (no causal
      // claims, no predictions) are followed noticeably better with some.
      thinkingConfig: { thinkingBudget: 2048 },
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }

    const json = (await res.json()) as GeminiResponse;
    if (json.error) {
      throw new Error(`Gemini ${json.error.code}: ${json.error.message}`);
    }

    const candidate = json.candidates?.[0];
    const text = (candidate?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("");

    if (!text) {
      throw new Error(
        `Gemini returned no text (finishReason: ${candidate?.finishReason ?? "unknown"})`,
      );
    }

    return {
      data: JSON.parse(text) as T,
      tokens: json.usageMetadata?.totalTokenCount,
    };
  }
}
