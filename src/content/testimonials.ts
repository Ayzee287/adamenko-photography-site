// Testimonials are REAL ONLY — never fabricated (vault brand-voice / client-profile).
// This array stays empty until the photographer supplies genuine words; the
// Testimonials section renders a quiet reserved state while empty and real cards
// the moment it isn't — no layout change either way. A future Google-reviews pull
// would populate the same shape.

export type Testimonial = {
  quote: string;
  name: string;
  /** City / context, e.g. "Lyon". */
  city?: string;
  /** Which kind of session it was — optional context. */
  service?: string;
  /** ISO date (YYYY-MM) of the session — optional, for ordering. */
  date?: string;
  /** Where the words came from — for the operator's own tracking, not shown. */
  source?: "email" | "instagram" | "google" | "form";
};

// Stays empty until the photographer supplies genuine words (see
// docs/content-collection/testimonials-questionnaire.md for the collection flow).
export const testimonials: Testimonial[] = [];
