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
import { ui } from "@/content/ui";
import { galleries, featured } from "@/content/galleries";

export const fr = {
  site,
  copy,
  ui,
  home,
  pricing,
  services,
  locations,
  faq,
  contactChannels,
  testimonials,
  photographer,
  galleries,
  featured,
  legal: { mentionsLegales, confidentialite },
} as const;

// Activation Step 0 (docs/localization-roadmap.md): the content modules are `as const`,
// so `typeof fr` pins every string to its French LITERAL — a translation override could
// never be assignable. `Widen` relaxes those literals to their base types (string /
// number / …) while preserving the structure (and `readonly`, via the homomorphic
// mapped type), so a locale dictionary can carry real translations. This is a pure TYPE
// change: the French modules and runtime are untouched, and `fr` is still assignable to
// `Dictionary` (literals → their widened bases; tuples → readonly arrays).
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : T extends object
          ? { [K in keyof T]: Widen<T[K]> }
          : T;

/** The shape every locale must follow (structure of `fr`, with widened string types). */
export type Dictionary = Widen<typeof fr>;
