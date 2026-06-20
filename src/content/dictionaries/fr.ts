// French dictionary — the canonical, fully-populated content set. It COMPOSES the
// existing typed content modules into one object so there is a single locale-access
// shape; the modules remain the editable source of truth (no duplication). The
// `Dictionary` type is derived from this object, so every other locale is checked
// against the French structure.
//
// French components keep importing the content modules directly (zero churn / zero
// regression); the dictionary is the seam that localized rendering uses via
// `getDictionary(locale)` (lib/dictionary.ts).

import { site, copy } from "@/content/site";
import { home } from "@/content/home";
import { pricing } from "@/content/pricing";
import { services } from "@/content/services";
import { locations } from "@/content/locations";
import { faq } from "@/content/faq";
import { contactChannels } from "@/content/contact-channels";
import { testimonials } from "@/content/testimonials";
import { photographer } from "@/content/photographer";
import { mentionsLegales, confidentialite } from "@/content/legal";

export const fr = {
  site,
  copy,
  home,
  pricing,
  services,
  locations,
  faq,
  contactChannels,
  testimonials,
  photographer,
  legal: { mentionsLegales, confidentialite },
} as const;

/** The shape every locale must follow. */
export type Dictionary = typeof fr;
