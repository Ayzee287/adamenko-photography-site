import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

// Locale routing. The whole app lives under `app/[lang]`; this middleware keeps the
// default locale (French) UNPREFIXED at "/" while every other active locale is served
// from its prefix ("/en/…"):
//
//   /            → rewrite to /fr            (URL stays "/", renders the FR tree)
//   /galeries    → rewrite to /fr/galeries  (URL unchanged)
//   /fr, /fr/*   → redirect to /, /*         (the prefixed default never has its own URL)
//   /en, /en/*   → next()                    (served by the [lang] tree as-is)
//   /ru, /uk     → next() → 404 (inactive locale, dynamicParams=false)
//
// Metadata routes (sitemap, robots, icons, og images) and assets are excluded by the
// matcher, so they keep working at the app root.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1] ?? "";

  // The default locale must stay canonical at the root: strip a /fr prefix.
  if (seg === defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url);
  }

  // Any locale prefix that already routes correctly (active non-default, or an
  // inactive one we want to 404) passes straight through.
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
  // dot-less metadata image routes (which live at the app root).
  matcher: ["/((?!_next/|api/|.*\\..*|opengraph-image|twitter-image).*)"],
};
