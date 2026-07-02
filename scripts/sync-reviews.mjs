// Syncs the Google Business reviews into the typed content graph —
// src/content/reviews.generated.ts — so the testimonials stay fully static (SSG):
// the Next build NEVER talks to Google. This script runs on demand at
// content-update time; its output is reviewed like any other content change and
// committed (git history is the sync log). Full workflow: docs/google-reviews.md.
//
//   npm run sync:reviews
//
// Credentials (script-only — the Next runtime never reads them), from the
// environment or .env.local:
//
//   GOOGLE_PLACES_API_KEY  — Maps Platform key with "Places API (New)" enabled
//   GOOGLE_PLACE_ID        — the business's Place ID
//
// Offline verification (no network, same mapping + emit path):
//
//   node scripts/sync-reviews.mjs --fixture <places-response.json>
//
// Failure handling: ANY error — missing credentials, HTTP failure, malformed
// payload — exits non-zero without touching the generated file, so the
// last-known-good reviews keep shipping. A response with zero reviews refuses to
// overwrite a non-empty file unless --allow-empty is passed (a Google-side glitch
// must not silently wipe real words).

import { readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, "src", "content", "reviews.generated.ts");

function fail(msg) {
  console.error(`sync-reviews: ${msg}`);
  process.exit(1);
}

/** Fill process.env from .env.local (never overriding real env vars). */
function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (line.trim().startsWith("#")) continue;
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}

/** The Places API (New) place payload — from the fixture or the live API. */
async function fetchPlace() {
  const fixtureAt = process.argv.indexOf("--fixture");
  if (fixtureAt !== -1) {
    const file = process.argv[fixtureAt + 1];
    if (!file) fail("--fixture needs a path to a canned Places API response (JSON).");
    console.log(`sync-reviews: reading fixture ${file} (no network)`);
    return JSON.parse(await readFile(file, "utf8"));
  }

  loadEnvLocal();
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) {
    fail(
      "GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID must be set (environment or .env.local). " +
        "Setup: docs/google-reviews.md.",
    );
  }

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        // Reviews plus the aggregate — nothing else leaves Google.
        "X-Goog-FieldMask": "rating,userRatingCount,reviews",
      },
    },
  );
  if (!res.ok) {
    fail(`Places API responded ${res.status}: ${(await res.text()).slice(0, 400)}`);
  }
  return res.json();
}

const place = await fetchPlace();
if (typeof place !== "object" || place === null || Array.isArray(place)) {
  fail("unexpected payload — not a Places API place object.");
}
if (place.reviews !== undefined && !Array.isArray(place.reviews)) {
  fail("unexpected payload — `reviews` is not an array.");
}

// Map to the typed shape (src/types/reviews.ts). The ORIGINAL text is kept —
// testimonials are real words only, never machine-translated.
const reviews = (place.reviews ?? [])
  .map((r) => ({
    id: r.name ?? "",
    author: r.authorAttribution?.displayName ?? "",
    rating: typeof r.rating === "number" ? r.rating : 0,
    text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
    language: r.originalText?.languageCode ?? r.text?.languageCode ?? undefined,
    publishTime: r.publishTime ?? "",
  }))
  .filter((r) => r.id && r.author && r.rating > 0)
  .sort((a, b) => (a.publishTime < b.publishTime ? 1 : -1));

// Guard: never let an empty (possibly glitched) response wipe real words.
if (reviews.length === 0 && !process.argv.includes("--allow-empty")) {
  const existing = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, "utf8") : "";
  if (/^\s*id:/m.test(existing)) {
    fail(
      "the response contains no reviews but the generated file does. Refusing to " +
        "overwrite — rerun with --allow-empty if the profile really has none.",
    );
  }
}

const summary =
  typeof place.rating === "number" && typeof place.userRatingCount === "number"
    ? `{ rating: ${place.rating}, count: ${place.userRatingCount} }`
    : "null";

// JSON.stringify handles all string escaping, so review text can never break the
// emitted module. Output is deterministic for identical input (no timestamps).
const lit = JSON.stringify;
const entries = reviews.map((r) =>
  [
    "  {",
    `    id: ${lit(r.id)},`,
    `    author: ${lit(r.author)},`,
    `    rating: ${r.rating},`,
    `    text: ${lit(r.text)},`,
    ...(r.language ? [`    language: ${lit(r.language)},`] : []),
    `    publishTime: ${lit(r.publishTime)},`,
    "  },",
  ].join("\n"),
);

const body = `// AUTO-GENERATED by scripts/sync-reviews.mjs (\`npm run sync:reviews\`) — the Google
// Business reviews, verbatim and newest first. Do not hand-edit: rerun the sync to
// refresh (git history records when each sync happened). Editorial policy — which
// reviews actually render — lives in src/content/testimonials.ts, so nothing is
// ever lost by curation. Workflow + credentials: docs/google-reviews.md.

import type { GoogleReview, GoogleRatingSummary } from "@/types/reviews";

/** Aggregate profile rating at the last sync, or null before the first sync. */
export const googleRating: GoogleRatingSummary | null = ${summary};

/** All reviews returned by the last sync, newest first — real words only. */
export const googleReviews: GoogleReview[] = ${
  entries.length === 0 ? "[]" : `[\n${entries.join("\n")}\n]`
};
`;

await writeFile(OUT_FILE, body);
console.log(
  `sync-reviews: wrote ${reviews.length} review(s)` +
    (summary !== "null" ? ` (profile ${place.rating}★ · ${place.userRatingCount})` : "") +
    ` → ${path.relative(ROOT, OUT_FILE)}`,
);
console.log(
  "sync-reviews: review the diff, adjust the editorial policy in " +
    "src/content/testimonials.ts if needed, then commit.",
);
