// i18n CORE. Full architecture for four locales — French canonical (unprefixed at
// "/"), English live at /en, Russian and Ukrainian prepared but not shipped.
//
// The system is driven by two lists:
//   • `locales`        — every locale the architecture understands (types, dictionaries).
//   • `activeLocales`  — locales with real, shipped content: French + English today.
//
// Activating a further language is a content+config change, not an architecture
// change: translate its dictionary (content/dictionaries/<locale>.ts — the ru/uk
// drafts are the starting point) and add the locale to `activeLocales`. From that
// moment its routes prerender under `app/[lang]`, and its hreflang, switcher entry
// and localized metadata all turn on automatically. Inactive locales 404
// (`dynamicParams = false`), so hreflang never advertises a route that doesn't exist.

export const locales = ["fr", "en", "ru", "uk"] as const;
export type Locale = (typeof locales)[number];

/** Canonical locale — served unprefixed at "/". */
export const defaultLocale: Locale = "fr";

/**
 * Locales with shipped content — French and English are live. Add a locale here
 * ONLY once its dictionary is fully translated: advertising hreflang for a locale
 * that renders French fallback (or 404s) is an SEO liability.
 */
export const activeLocales: readonly Locale[] = ["fr", "en"];

/** Endonyms for the language switcher. */
export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ru: "Русский",
  uk: "Українська",
};

/** Short codes for the switcher's compact form. */
export const localeShort: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  ru: "RU",
  uk: "UK",
};

/** OpenGraph locale codes. */
export const ogLocale: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_US",
  ru: "ru_RU",
  uk: "uk_UA",
};

/** HTML lang attribute. */
export const htmlLang: Record<Locale, string> = {
  fr: "fr",
  en: "en",
  ru: "ru",
  uk: "uk",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Build a path for a locale. The default locale is unprefixed ("/galeries"); every
 * other locale is prefixed ("/en/galeries"). This is the routing contract the future
 * `app/[lang]` tree implements.
 */
export function localizedPath(locale: Locale, path: string = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Detect the locale from a pathname; the default locale when there's no known prefix. */
export function localeFromPathname(pathname: string): Locale {
  const seg = pathname.split("/")[1] ?? "";
  return isLocale(seg) ? seg : defaultLocale;
}

/** Strip a leading non-default locale prefix, returning the canonical (FR) path. */
export function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1] ?? "";
  if (isLocale(seg) && seg !== defaultLocale) {
    const rest = pathname.slice(seg.length + 1);
    return rest === "" ? "/" : rest;
  }
  return pathname;
}

/**
 * Strip ANY leading locale prefix (including the default) → the canonical, unprefixed
 * path. Use this for client-side route comparisons (`usePathname`): the default locale
 * is generated at "/fr/…" (SSG) but served at "/…" (browser), so comparing the raw
 * pathname against a prefixed target mismatches between SSR and hydration. Normalising
 * both sides to the unprefixed path ("/fr/galeries" and "/galeries" → "/galeries")
 * makes the derived state (isHome / isActive / switcher base) identical in both.
 */
export function canonicalPathname(pathname: string): string {
  const seg = pathname.split("/")[1] ?? "";
  if (isLocale(seg)) {
    const rest = pathname.slice(seg.length + 1);
    return rest === "" ? "/" : rest;
  }
  return pathname;
}

/**
 * `alternates` for Next metadata: a localized canonical plus an hreflang map covering
 * every ACTIVE locale and `x-default`. Today that is French + x-default; it grows
 * automatically as locales are activated.
 */
export function localizedAlternates(path: string, locale: Locale = defaultLocale) {
  const languages: Record<string, string> = {};
  for (const l of activeLocales) languages[htmlLang[l]] = localizedPath(l, path);
  languages["x-default"] = localizedPath(defaultLocale, path);
  return { canonical: localizedPath(locale, path), languages };
}
