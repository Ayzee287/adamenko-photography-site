// Testimonials are REAL ONLY — never fabricated (vault brand-voice / client-profile).
// Two sources feed one shape:
//
//   1. `manual` — words the photographer collected herself (email / Instagram / the
//      contact form; see docs/content-collection/testimonials-questionnaire.md);
//   2. the Google Business reviews, synced verbatim into reviews.generated.ts by
//      `npm run sync:reviews` (docs/google-reviews.md) and CURATED here — the data
//      stays generated, the editorial policy stays hand-written and reviewable.
//
// The Testimonials section renders a quiet reserved state while this list is empty
// and a manual carousel the moment it isn't — no layout change either way.

import { googleReviews } from "./reviews.generated";
import type { Locale } from "@/lib/i18n";

export type Testimonial = {
  /** The words in their ORIGINAL language — the verbatim fallback, and what the
   *  "view original" toggle reveals. */
  quote: string;
  /** BCP-47 language of `quote` (Google reviews), e.g. "ru" — sets the correct
   *  `lang` attribute and drives the translation toggle. Absent for hand-collected
   *  words (already in the site's language). */
  language?: Locale | string;
  /** Google's per-locale machine translations of `quote`. When the active locale
   *  has an entry, the card shows it by default with a "view original" toggle;
   *  with no entry it shows `quote` verbatim and hides the toggle. */
  translations?: Partial<Record<Locale, string>>;
  name: string;
  /** Star rating 1–5 (Google reviews). Absent for hand-collected words — the
   *  card then simply renders without a star row. */
  rating?: number;
  /** City / context, e.g. "Lyon". */
  city?: string;
  /** Which kind of session it was — optional context. */
  service?: string;
  /** ISO date (YYYY-MM) of the session — optional, shown on the card. */
  date?: string;
  /** Where the words came from — for the operator's own tracking, not shown. */
  source?: "email" | "instagram" | "google" | "form";
};

// Hand-collected words — kept first: they were chosen, not synced.
const manual: Testimonial[] = [];

// Editorial policy for the synced Google reviews — adjust deliberately, never in
// the generated file. Only full-star reviews with real words. No length ceiling:
// the card truncates long reviews visually ("read more"), so the words stay
// verbatim and complete. Filtered-out reviews stay in reviews.generated.ts
// (nothing is lost) — they simply don't render.
const MIN_RATING = 5;
/** Review ids (GoogleReview.id) the photographer chooses not to display. */
const EXCLUDED: string[] = [];

const fromGoogle: Testimonial[] = googleReviews
  .filter((r) => r.rating >= MIN_RATING && r.originalText.length > 0 && !EXCLUDED.includes(r.id))
  .map((r) => ({
    quote: r.originalText,
    language: r.originalLanguage,
    translations: r.translations,
    name: r.author,
    rating: r.rating,
    date: r.publishTime.slice(0, 7),
    source: "google" as const,
  }));

export const testimonials: Testimonial[] = [...manual, ...fromGoogle];
