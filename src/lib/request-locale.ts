// Request-scoped locale for SERVER components (i18n activation). Server components
// deep in the tree (the homepage sections, the footer, the legal renderer) read their
// content from `getDictionary(locale)` but receiving `locale` as a prop would mean
// threading it through every component. Instead the `[lang]` layout and each page call
// `setRequestLocale(lang)` once, and any server component reads it with
// `getRequestLocale()`. This is the standard App-Router pattern (a React `cache()` is
// memoised per request/render, so it is request-isolated and concurrency-safe).
//
// CLIENT components cannot use this (cache() is server-only) — they receive the
// resolved strings (or `lang`) as props from their server parent.

import { cache } from "react";
import { defaultLocale, localizedPath, type Locale } from "@/lib/i18n";

// One mutable holder per request/render pass. `cache()` guarantees a fresh object per
// request, so locales never leak between concurrent renders.
const store = cache((): { locale: Locale } => ({ locale: defaultLocale }));

/** Set the active locale for the current request (call in the layout + each page). */
export function setRequestLocale(locale: Locale): void {
  store().locale = locale;
}

/** The active locale for the current request (defaults to French if never set). */
export function getRequestLocale(): Locale {
  return store().locale;
}

/**
 * Localise an internal href to the current request locale (server components only).
 * Internal paths ("/contact") gain the locale prefix on non-default locales
 * ("/en/contact"); external links (http, mailto, tel) and hash links are left as-is.
 */
export function localeHref(href: string): string {
  if (!href.startsWith("/")) return href;
  return localizedPath(getRequestLocale(), href);
}
