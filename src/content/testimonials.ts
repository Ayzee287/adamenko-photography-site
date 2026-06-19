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
};

export const testimonials: Testimonial[] = [];
