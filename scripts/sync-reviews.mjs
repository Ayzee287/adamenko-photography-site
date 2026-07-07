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
// Each review is preserved in its ORIGINAL language (verbatim), PLUS Google's
// machine translation into each site locale where the original differs. The card
// shows the translation in the visitor's language with a "view original" toggle
// (Google-Maps behaviour), and nothing is ever lost. To collect the translations
// this fetches the place once per active locale (LOCALES below) — a couple of
// requests per sync, far inside the free tier.
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

// The site's active locales, in priority order — MUST mirror `activeLocales` in
// src/lib/i18n.ts. The first is the base (canonical) fetch used for the aggregate
// rating and the review roster; every locale is fetched to collect its translation.
const LOCALES = ["fr", "en"];

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

const FIXTURE_AT = process.argv.indexOf("--fixture");
const IS_FIXTURE = FIXTURE_AT !== -1;

/** The Places API (New) place payload for one locale — from the fixture or the
 *  live API. `languageCode` asks Google to translate each review's `text` into
 *  that locale (its `originalText` is always returned unchanged). */
async function fetchPlace(languageCode) {
  if (IS_FIXTURE) {
    const file = process.argv[FIXTURE_AT + 1];
    if (!file) fail("--fixture needs a path to a canned Places API response (JSON).");
    console.log(`sync-reviews: reading fixture ${file} (no network)`);
    return JSON.parse(await readFile(file, "utf8"));
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) {
    fail(
      "GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID must be set (environment or .env.local). " +
        "Setup: docs/google-reviews.md.",
    );
  }

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${languageCode}`,
    {
      headers: {
        "X-Goog-Api-Key": key,
        // Reviews, the aggregate, and the official profile deep-links — nothing else.
        "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri,googleMapsLinks",
      },
    },
  );
  if (!res.ok) {
    fail(`Places API responded ${res.status}: ${(await res.text()).slice(0, 400)}`);
  }
  return res.json();
}

loadEnvLocal();

// Fetch the place once per active locale. In fixture mode there is only one canned
// response, so only the base locale is "fetched" (translations still derive from
// its per-review originalText/text pair).
const fetchLocales = IS_FIXTURE ? [LOCALES[0]] : LOCALES;
const places = {};
for (const loc of fetchLocales) {
  const place = await fetchPlace(loc);
  if (typeof place !== "object" || place === null || Array.isArray(place)) {
    fail(`unexpected payload for ${loc} — not a Places API place object.`);
  }
  if (place.reviews !== undefined && !Array.isArray(place.reviews)) {
    fail(`unexpected payload for ${loc} — \`reviews\` is not an array.`);
  }
  places[loc] = place;
}

const basePlace = places[fetchLocales[0]];

// Merge the per-locale responses by review id (src/types/reviews.ts). Each review
// keeps its ORIGINAL words verbatim; a locale's translation is stored ONLY when the
// original is in a different language (i.e. Google actually translated it).
const byId = new Map();
for (const loc of fetchLocales) {
  for (const r of places[loc].reviews ?? []) {
    const id = r.name ?? "";
    if (!id) continue;
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        author: r.authorAttribution?.displayName ?? "",
        rating: typeof r.rating === "number" ? r.rating : 0,
        originalText: (r.originalText?.text ?? r.text?.text ?? "").trim(),
        originalLanguage: r.originalText?.languageCode ?? r.text?.languageCode ?? undefined,
        publishTime: r.publishTime ?? "",
        translations: {},
      });
    }
    const rec = byId.get(id);
    // `r.text` is the review rendered in `loc`; when the original is a different
    // language this is Google's machine translation into `loc`.
    const translated = (r.text?.text ?? "").trim();
    if (
      rec.originalLanguage &&
      rec.originalLanguage !== loc &&
      translated &&
      translated !== rec.originalText
    ) {
      rec.translations[loc] = translated;
    }
  }
}

const reviews = [...byId.values()]
  .map((r) => ({
    ...r,
    translations: Object.keys(r.translations).length ? r.translations : undefined,
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

const place = basePlace;

const summary =
  typeof place.rating === "number" && typeof place.userRatingCount === "number"
    ? `{ rating: ${place.rating}, count: ${place.userRatingCount} }`
    : "null";

// Official Google Maps deep-links for the profile (locale-independent). Fall back to
// the canonical `googleMapsUri` for any link the API didn't provide.
const links = place.googleMapsLinks ?? {};
const profileUri = links.placeUri || place.googleMapsUri || "";
const googleProfile = profileUri
  ? {
      profileUri,
      reviewsUri: links.reviewsUri || profileUri,
      writeReviewUri: links.writeAReviewUri || profileUri,
    }
  : null;

// JSON.stringify handles all string escaping, so review text can never break the
// emitted module. Output is deterministic for identical input (no timestamps).
const lit = JSON.stringify;
const entries = reviews.map((r) =>
  [
    "  {",
    `    id: ${lit(r.id)},`,
    `    author: ${lit(r.author)},`,
    `    rating: ${r.rating},`,
    `    originalText: ${lit(r.originalText)},`,
    ...(r.originalLanguage ? [`    originalLanguage: ${lit(r.originalLanguage)},`] : []),
    ...(r.translations ? [`    translations: ${lit(r.translations)},`] : []),
    `    publishTime: ${lit(r.publishTime)},`,
    "  },",
  ].join("\n"),
);

const body = `// AUTO-GENERATED by scripts/sync-reviews.mjs (\`npm run sync:reviews\`) — the Google
// Business reviews, verbatim and newest first. Do not hand-edit: rerun the sync to
// refresh (git history records when each sync happened). Editorial policy — which
// reviews actually render — lives in src/content/testimonials.ts, so nothing is
// ever lost by curation. Workflow + credentials: docs/google-reviews.md.

import type { GoogleReview, GoogleRatingSummary, GoogleProfileLinks } from "@/types/reviews";

/** Aggregate profile rating at the last sync, or null before the first sync. */
export const googleRating: GoogleRatingSummary | null = ${summary};

/** Official Google Maps deep-links for the profile, or null before the first sync. */
export const googleProfile: GoogleProfileLinks | null = ${
  googleProfile
    ? `{
  profileUri: ${lit(googleProfile.profileUri)},
  reviewsUri: ${lit(googleProfile.reviewsUri)},
  writeReviewUri: ${lit(googleProfile.writeReviewUri)},
}`
    : "null"
};

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
