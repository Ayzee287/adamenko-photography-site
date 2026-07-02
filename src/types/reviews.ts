// The typed shape of the synced Google Business reviews (docs/google-reviews.md).
// Data is written by scripts/sync-reviews.mjs into src/content/reviews.generated.ts;
// editorial policy (filtering, exclusions) lives in src/content/testimonials.ts.

export type GoogleReview = {
  /** Stable review resource name (`places/…/reviews/…`) — the key used to
   *  exclude a specific review from display (testimonials.ts `EXCLUDED`). */
  id: string;
  /** Reviewer display name, exactly as published on the Google profile. */
  author: string;
  /** Star rating, 1–5. */
  rating: number;
  /** Review text in its ORIGINAL language — never machine-translated
   *  (testimonials are real words only, verbatim). */
  text: string;
  /** BCP-47 language code of `text`, when Google reports it. */
  language?: string;
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
