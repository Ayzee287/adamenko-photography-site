"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { canonicalPathname, localizedPath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/content/dictionaries/fr";
import { subscribeScroll } from "@/lib/scroll";
import { cn } from "@/lib/utils";

export type ChromeStrings = {
  brand: string;
  instagramHref: string;
  facebookHref?: string;
  nav: readonly { href: string; label: string }[];
  ui: Dictionary["ui"];
  contactCta: string;
};

/** The surface the header strip currently sits over. `dark` is the transparent,
 *  light-text treatment (over the hero or any dark band); `paper`/`sand` are the
 *  two solid warm surfaces, so the chrome quietly matches whichever band is behind
 *  it. Sections declare their own tone via `data-header-tone`; paper is the base. */
type HeaderTone = "dark" | "paper" | "sand";

/**
 * Slim, persistent, **context-aware** header. It quietly adopts the surface of the
 * section currently behind it: transparent + light over the cinematic hero (and any
 * dark band), solid warm paper over the body, a hair warmer over the sand bands.
 * The tone is derived from `data-header-tone` markers each non-paper section plants
 * (an IntersectionObserver tracks which one the header strip overlaps); only colours
 * cross-fade, on the shared `--ease-settle` clock — no layout shift, no glass, no
 * flashy motion.
 *
 * SSR/hydration: the initial tone is computed purely from the route (home opens over
 * the dark hero, every other route over paper), so the server and first client render
 * agree; the observer only refines it after mount, and the hero (the LCP) is never
 * touched. On the homepage the bar is `fixed` and floats over the hero; on every other
 * route it is a sticky solid bar. Locale-aware: internal links are prefixed for the
 * active locale and the strings are passed in (the content graph never enters the
 * client bundle). Mobile (D038): a full-screen editorial overlay (`MobileMenu`).
 */
export function SiteHeader({ lang, chrome }: { lang: Locale; chrome: ChromeStrings }) {
  const pathname = usePathname();
  // Normalise the pathname (strip any locale prefix) so SSR (generated at "/fr/…") and
  // the hydrated client (served at "/…") compute identical state — no hydration
  // mismatch on the active nav state (I1).
  const path = canonicalPathname(pathname);
  const homePath = localizedPath(lang, "/");
  const isHome = path === "/";

  const [tone, setTone] = useState<HeaderTone>(isHome ? "dark" : "paper");
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  // Close the overlay AND reset the tone whenever the route changes (React's "adjust
  // state during render"): the layout persists across navigations, so a new page must
  // not inherit the previous page's tone before the observer re-runs.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setTone(isHome ? "dark" : "paper");
  }

  useEffect(() => {
    const marks = Array.from(
      document.querySelectorAll<HTMLElement>("[data-header-tone]"),
    );
    // No markers on this route (e.g. an inner page) → the tone stays the base
    // `paper` already set by the route-change reset; nothing to track.
    if (marks.length === 0) return;
    // The tone of the marked region the header strip currently sits over: the one
    // whose box straddles the header's bottom edge. Paper (the base surface) when
    // none does. Driven by the ONE shared, rAF-throttled scroll source (no extra
    // listener), reading only a handful of section rects — so the tone is always
    // exact at the line crossing (an IntersectionObserver would only fire at its band
    // edges and read stale across the crossing). Colour-only state → no layout, CWV-safe.
    const update = () => {
      const line = headerRef.current?.offsetHeight ?? 72;
      let next: HeaderTone = "paper";
      let bestTop = -Infinity;
      for (const el of marks) {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line && r.top > bestTop) {
          bestTop = r.top;
          next = (el.dataset.headerTone as HeaderTone) ?? "paper";
        }
      }
      setTone(next);
    };
    // subscribeScroll runs `update` once immediately (correct initial tone) and on
    // every scroll/resize, batched in the shared rAF.
    return subscribeScroll(update);
  }, [pathname]);

  const onDark = tone === "dark";
  const surface =
    tone === "dark"
      ? "border-transparent bg-transparent"
      : tone === "sand"
        ? "border-line bg-sand"
        : "border-line bg-paper";

  // Wayfinding: mark the current section. `href` is the canonical (unprefixed) nav
  // path; comparing against the normalised `path` keeps /galeries active inside
  // /galeries/familles in BOTH locales and matches SSR↔client (I1).
  const isActive = (href: string) =>
    href === "/"
      ? path === "/"
      : path === href || path.startsWith(`${href}/`);

  const navLink = "py-2.5 text-[0.95rem] hover:text-clay";

  return (
    <header
      ref={headerRef}
      className={cn(
        "isolate top-0 z-50 border-b transition-colors duration-300 ease-[var(--ease-settle)]",
        isHome ? "fixed inset-x-0" : "sticky",
        surface,
        onDark && "dark-surface",
      )}
    >
      {onDark ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-ink/50 to-transparent"
        />
      ) : null}
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link
          href={homePath}
          className={cn(
            "font-serif text-lg sm:text-xl",
            onDark ? "text-paper" : "text-ink",
          )}
        >
          {chrome.brand}
        </Link>

        <nav
          aria-label={chrome.ui.nav.primary}
          className="hidden items-center gap-8 sm:flex lg:gap-10"
        >
          {chrome.nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={localizedPath(lang, item.href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  navLink,
                  active && "underline decoration-1 underline-offset-4",
                  onDark
                    ? active
                      ? "text-paper decoration-paper/70"
                      : "text-paper/70"
                    : active
                      ? "text-ink decoration-clay"
                      : "text-ink/70",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <LanguageSwitcher onDark={onDark} label={chrome.ui.nav.language} />
        </nav>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={chrome.ui.nav.openMenu}
          onClick={() => setMenuOpen(true)}
          className={cn(
            "-mr-2 flex h-12 items-center px-2 text-[0.95rem] hover:text-clay sm:hidden",
            onDark ? "text-paper" : "text-ink",
          )}
        >
          {chrome.ui.nav.menu}
        </button>
      </Container>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isActive={isActive}
        lang={lang}
        chrome={chrome}
      />
    </header>
  );
}
