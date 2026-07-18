import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // V2 design-token law (VLS §3/§5/§6, Foundations §1) as lint. Scoped to
    // className strings so prose is never false-flagged. The Tailwind ESLint
    // plugin does not support Tailwind v4 flat config reliably, so the bans are
    // expressed as core no-restricted-syntax selectors (recorded deviation).
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'JSXAttribute[name.name="className"] Literal[value=/(^|[\\s:])shadow-/]',
          message:
            "Elevation is banned (Creative DNA §6): no shadow-* utilities.",
        },
        {
          selector:
            'JSXAttribute[name.name="className"] Literal[value=/[a-z]-\\[/]',
          message:
            "Arbitrary values are banned (VLS): use the token scale (space/*, text roles, radius trio).",
        },
        {
          selector:
            'JSXAttribute[name.name="className"] Literal[value=/(^|[\\s:])bg-gradient-/]',
          message:
            "Gradients are banned outside the two scrim utilities (VLS §4).",
        },
      ],
    },
  },
]);

export default eslintConfig;
