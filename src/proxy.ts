import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

// Locale routing (Next 16 `proxy` convention; replaces the deprecated `middleware`).
// The whole app lives under `app/[lang]`; this keeps the default locale (French)
// UNPREFIXED at "/" while every other active locale is served from its prefix
// ("/en/…"):
//
//   /            → rewrite to /fr            (URL stays "/", renders the FR tree)
//   /galeries    → rewrite to /fr/galeries  (URL unchanged)
//   /fr, /fr/*   → 308 redirect to /, /*     (permanent — the prefixed default has no URL)
//   /en, /en/*   → next()                    (served by the [lang] tree as-is)
//   /ru, /uk     → next() → 404 (inactive locale, dynamicParams=false)
//
// Assets, the API, files with an extension, and the per-locale metadata image routes
// (`*/opengraph-image`, `*/twitter-image`) are excluded by the matcher, so they are
// served directly — in particular `/fr/opengraph-image` is NOT caught by the
// default-locale redirect (which would otherwise strip it to a non-existent URL).
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1] ?? "";

  // The default locale must stay canonical at the root: permanently strip a /fr prefix.
  if (seg === defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Any locale prefix that already routes correctly (active non-default, or an inactive
  // one we want to 404) passes straight through.
  if (isLocale(seg)) {
    return NextResponse.next();
  }

  // No locale prefix → serve the canonical French tree, internally, at this URL.
  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on everything except Next internals, the API, files with an extension, and the
  // metadata image routes at any depth (which live under each locale and must be served
  // directly, never redirected or rewritten).
  matcher: [
    "/((?!_next/|api/|.*\\..*|.*opengraph-image|.*twitter-image).*)",
  ],
};
