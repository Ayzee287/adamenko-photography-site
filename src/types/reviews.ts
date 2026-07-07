// The typed shape of the synced Google Business reviews (docs/google-reviews.md).
// Data is written by scripts/sync-reviews.mjs into src/content/reviews.generated.ts;
// editorial policy (filtering, exclusions) lives in src/content/testimonials.ts.

import type { Locale } from "@/lib/i18n";

export type GoogleReview = {
  /** Stable review resource name (`places/…/reviews/…`) — the key used to
   *  exclude a specific review from display (testimonials.ts `EXCLUDED`). */
  id: string;
  /** Reviewer display name, exactly as published on the Google profile. */
  author: string;
  /** Star rating, 1–5. */
  rating: number;
  /** The review in its ORIGINAL language, verbatim — the words the client
   *  actually wrote. Always preserved; never discarded by translation. */
  originalText: string;
  /** BCP-47 language code of `originalText`, when Google reports it (e.g. "ru"). */
  originalLanguage?: string;
  /** Google's machine translations of the review, keyed by the site's active
   *  locales. A locale key is present ONLY when the original is in a different
   *  language (Google genuinely translated it) — so the card can show the
   *  translation in the visitor's language with a "view original" toggle. When a
   *  locale key is absent the original already reads in that locale (no toggle);
   *  missing translations always fall back to `originalText`. */
  translations?: Partial<Record<Locale, string>>;
  /** ISO-8601 publish timestamp from Google. */
  publishTime: string;
};

/** The profile's aggregate rating at the last sync. */
export type GoogleRatingSummary = {
  /** Average star rating, e.g. 4.9. */
  rating: number;
  /** Total number of published reviews. */
  count: number;
};

/** Official Google Maps deep-links for the business, captured at sync time from the
 *  Places API `googleMapsLinks` field (locale-independent). Let a visitor open the
 *  real profile to verify the reviews — or leave one of their own. */
export type GoogleProfileLinks = {
  /** The business's Google Maps profile (rating + reviews). */
  profileUri: string;
  /** Straight to the reviews list — where a visitor can also write one. */
  reviewsUri: string;
  /** Opens Google's "write a review" flow directly. */
  writeReviewUri: string;
};
