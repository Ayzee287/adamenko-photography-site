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
 * Tone ownership: the rendered tone is DERIVED every render — a route base tone
 * (home opens over the dark hero, every other route over paper; a pure function of
 * the pathname) refined by the marker measurement, which is TAGGED with the pathname
 * it was measured on and ignored on any other route. It is never a bare stored value
 * that a navigation must remember to reset: the outgoing page's scroll subscription
 * stays live until the new page commits, and React may replay or drop competing
 * `setState`s across a suspended App Router transition (observed on Next 16 /
 * React 19.2: a render-phase reset committed, then a follow-up pass reverted it,
 * leaving white nav text on a paper page). Deriving from (pathname, tagged
 * measurement) makes any stale or dropped write inert by construction.
 *
 * SSR/hydration: with no measurement yet, the base tone is what renders, so the
 * server and first client render agree; the measurement only refines it after
 * mount, and the hero (the LCP) is never touched. On the homepage the bar is
 * `fixed` and floats over the hero; on every other route it is a sticky solid bar.
 * Locale-aware: internal links are prefixed for the active locale and the strings
 * are passed in (the content graph never enters the client bundle). Mobile (D038):
 * a full-screen editorial overlay (`MobileMenu`).
 *
 * Breakpoints (audit finding 02, MEASURED on production): the desktop strip needs
 * ~748px in French (serif brand + four FR labels at gap-8 + the double-spaced
 * switcher), so mounting it at sm/640 wrapped both the brand and the nav onto two
 * lines everywhere in 640–~775px — including iPad portrait at exactly 768. The
 * desktop nav therefore mounts at md/768, and the brand holds its mobile text-lg
 * until lg (text-xl at 768 measures 229.6px and re-breaks the 768 window by 3px;
 * text-lg measures 206.7px and leaves ~20px of slack). ≥1024 is pixel-identical
 * to the previous design.
 */
export function SiteHeader({ lang, chrome }: { lang: Locale; chrome: ChromeStrings }) {
  const pathname = usePathname();
  // Normalise the pathname (strip any locale prefix) so SSR (generated at "/fr/…") and
  // the hydrated client (served at "/…") compute identical state — no hydration
  // mismatch on the active nav state (I1).
  const path = canonicalPathname(pathname);
  const homePath = localizedPath(lang, "/");
  const isHome = path === "/";

  // The route's own base tone — what renders before (and unless) a measurement for
  // THIS route says otherwise. Derived from the pathname, never stored.
  const routeTone: HeaderTone = isHome ? "dark" : "paper";

  // The tone measured from the markers, tagged with the pathname it was measured on.
  // The tag is load-bearing: a measurement taken on route A can commit after the
  // navigation to route B (A's subscription lives until B's effects run), so the
  // render below ignores any measurement whose tag isn't the current route instead
  // of trusting update order.
  const [measured, setMeasured] = useState<{
    path: string;
    tone: HeaderTone;
  } | null>(null);
  const tone =
    measured !== null && measured.path === pathname ? measured.tone : routeTone;

  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  // Close the overlay whenever the route changes (React's "adjust state during
  // render"): the layout persists across navigations, so the menu must not stay open
  // over a new page. (The tone needs no such reset — its route tag invalidates it.)
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const marks = Array.from(
      document.querySelectorAll<HTMLElement>("[data-header-tone]"),
    );
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
      // Referentially stable when unchanged so the per-tick write bails out of
      // re-rendering on quiet stretches.
      setMeasured((prev) =>
        prev !== null && prev.path === pathname && prev.tone === next
          ? prev
          : { path: pathname, tone: next },
      );
    };
    // subscribeScroll runs `update` once immediately — the commit-time measurement
    // for the route just navigated to — and on every scroll/resize, batched in the
    // shared rAF. Subscribed on EVERY route, marker-less ones included (they simply
    // keep confirming "paper"), so the live subscription always belongs to the
    // current route and no route can be left showing a stale tone.
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
      <Container className="flex h-16 items-center justify-between md:h-20">
        <Link
          href={homePath}
          // Already home → the logo means "back to the start": scroll instead of a
          // same-URL navigation (whose scroll reset is erratic and adds nothing).
          // Plain left-click/Enter only — modified clicks (new tab, etc.) fall
          // through to the native link, and every other route navigates as before.
          onClick={(e) => {
            if (!isHome || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            });
          }}
          className={cn(
            "whitespace-nowrap font-serif text-lg lg:text-xl",
            onDark ? "text-paper" : "text-ink",
          )}
        >
          {chrome.brand}
        </Link>

        <nav
          aria-label={chrome.ui.nav.primary}
          className="hidden items-center gap-8 md:flex lg:gap-10"
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
          {/* The switcher is a utility control, not a fifth destination: it sits a
              full nav-gap further out — twice the link spacing — so the group
              boundary is unmistakable while the strip stays one quiet band. */}
          <LanguageSwitcher
            onDark={onDark}
            label={chrome.ui.nav.language}
            className="ml-8 lg:ml-10"
          />
        </nav>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={chrome.ui.nav.openMenu}
          onClick={() => setMenuOpen(true)}
          className={cn(
            "-mr-2 flex h-12 items-center px-2 text-[0.95rem] hover:text-clay md:hidden",
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
