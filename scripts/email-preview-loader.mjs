// Minimal resolve hook for scripts/email-preview.mjs: teaches Node's native TypeScript
// stripping about this repo's "@/…" path alias (tsconfig `paths`), so the preview can
// import the real templates rather than a copy of them.

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = process.cwd();
const CANDIDATES = ["", ".ts", ".tsx", ".mjs", ".js", "/index.ts", "/index.tsx"];

/** First existing file among `base` + each candidate extension. */
function firstHit(base) {
  for (const ext of CANDIDATES) {
    const full = base + ext;
    if (ext !== "" && existsSync(full)) return pathToFileURL(full).href;
  }
  return null;
}

export function resolve(specifier, context, next) {
  // "@/lib/foo" → <root>/src/lib/foo.ts
  if (specifier.startsWith("@/")) {
    const hit = firstHit(path.join(ROOT, "src", specifier.slice(2)));
    if (hit) return { url: hit, shortCircuit: true };
  }
  // "./reviews.generated" → sibling .ts. TypeScript source omits extensions; Node requires
  // them, so any relative specifier without one gets the same candidate sweep. Checked
  // BEFORE delegating, because next() is async and its rejection cannot be caught here.
  // NB: a dotted module name like "./reviews.generated" has a non-empty path.extname, so the
  // test is "does it end in a module extension", not "does it have one".
  const hasModuleExt = /\.(m?[jt]sx?|cjs|json)$/.test(specifier);
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:") && !hasModuleExt) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const hit = firstHit(path.resolve(parentDir, specifier));
    if (hit) return { url: hit, shortCircuit: true };
  }
  return next(specifier, context);
}
