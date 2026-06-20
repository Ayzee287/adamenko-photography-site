// Dictionary resolver + fallback strategy (real-content launch pass). Returns the
// full content dictionary for a locale, deep-merged over French so any key a locale
// hasn't translated yet falls back to French. Today every non-French locale ships an
// empty override, so every locale resolves to French — the system is ready, the
// translations are not (by design).

import { defaultLocale, type Locale } from "@/lib/i18n";
import { fr, type Dictionary } from "@/content/dictionaries/fr";
import { en } from "@/content/dictionaries/en";
import { ru } from "@/content/dictionaries/ru";
import { uk } from "@/content/dictionaries/uk";

/** A recursively-optional view of the dictionary — what a translation file provides. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly (infer U)[]
    ? readonly U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

const overrides: Record<Locale, DeepPartial<Dictionary>> = { fr: {}, en, ru, uk };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Deep-merge an override onto a base: objects merge recursively; arrays and
// primitives are replaced wholesale (a translated list replaces the French list).
function deepMerge<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (override === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override as unknown as T) ?? base;
  }
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const value = (override as Record<string, unknown>)[key];
    if (value === undefined) continue;
    out[key] =
      isPlainObject(out[key]) && isPlainObject(value)
        ? deepMerge(out[key], value as DeepPartial<unknown>)
        : value;
  }
  return out as T;
}

/** Resolve the content dictionary for a locale (French fallback for missing keys). */
export function getDictionary(locale: Locale): Dictionary {
  if (locale === defaultLocale) return fr;
  return deepMerge(fr, overrides[locale]);
}

export type { Dictionary };
