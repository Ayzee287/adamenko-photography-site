import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/* V2 design-token law (VLS §3/§5/§6, Foundations §1) as lint. Scoped to
   className strings so prose is never false-flagged. The Tailwind ESLint
   plugin does not support Tailwind v4 flat config reliably, so the bans are
   expressed as core no-restricted-syntax selectors (recorded deviation). */
const tokenBans = [
  {
    selector:
      'JSXAttribute[name.name="className"] Literal[value=/(^|[\\s:])shadow-/]',
    message: "Elevation is banned (Creative DNA §6): no shadow-* utilities.",
  },
  {
    selector: 'JSXAttribute[name.name="className"] Literal[value=/[a-z]-\\[/]',
    message:
      "Arbitrary values are banned (VLS): use the token scale (space/*, text roles, radius trio).",
  },
  {
    selector:
      'JSXAttribute[name.name="className"] Literal[value=/(^|[\\s:])bg-gradient-/]',
    message: "Gradients are banned outside the two scrim utilities (VLS §4).",
  },
];

/* Route-registry law (Architecture §3): link() is the only legal internal
   href builder in UI code. proxy.ts and lib keep the i18n primitives —
   they ARE the plumbing. */
const registryBans = [
  {
    selector: 'JSXAttribute[name.name="href"] > Literal[value=/^\\//]',
    message:
      "Hardcoded internal href — build it with link() from @/lib/routes.",
  },
  {
    selector:
      'JSXAttribute[name.name="href"] JSXExpressionContainer > Literal[value=/^\\//]',
    message:
      "Hardcoded internal href — build it with link() from @/lib/routes.",
  },
  {
    selector: 'ImportSpecifier[imported.name="localizedPath"]',
    message:
      "localizedPath is V1 plumbing (proxy/lib only) — UI code uses link() from @/lib/routes.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/app/**", "src/components/**"],
    rules: { "no-restricted-syntax": ["error", ...tokenBans] },
  },
  {
    // UI code gets both rule sets (flat config replaces, never merges —
    // hence the explicit union).
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": ["error", ...tokenBans, ...registryBans] },
  },
]);

export default eslintConfig;
