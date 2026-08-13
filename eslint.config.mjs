import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Enforces the locked ingestion rule: no client-triggered upstream API calls.
  // Pages and components read cached data through lib/queries.ts; anything that
  // talks to an upstream API belongs in a scheduled ingestion job behind the
  // CRON_SECRET guard. Phase 3 adds the Gemini client to this list.
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx", "src/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/finnhub", "@/lib/yahoo", "@/lib/refresh"],
              message:
                "Upstream API clients must not be reached from a page or component. Pages read cached data via @/lib/queries; upstream calls belong in a scheduled ingestion job (see CLAUDE.md, 'Ingestion architecture').",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
