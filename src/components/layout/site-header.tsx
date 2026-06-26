"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/layout/container";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { site } from "@/content/site";
import { subscribeScroll } from "@/lib/scroll";
import { cn } from "@/lib/utils";

/**
 * Slim, persistent header. On the homepage it floats transparent over the dark
 * hero (light text) and settles to solid warm paper once scrolled past it — the
 * cinematic chrome. On every other route it behaves exactly as before: a sticky,
 * solid, in-flow bar (no layout change to inner pages).
 *
 * Desktop nav (Design Sprint V2 · D037): links carry a comfortable vertical hit
 * area and a touch more size/legibility than the old bare 14px text — the owner's
 * "nav may be too small" note, evaluated against the benchmark's generous targets,
 * implemented without making the chrome shout.
 *
 * Mobile (D038): the old `<details>` dropdown is replaced by a full-screen editorial
 * overlay (`MobileMenu`), driven by state and opened from a labelled toggle.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    return subscribeScroll(() => setScrolled(window.scrollY > 24));
  }, [isHome]);

  // Close the overlay whenever the route changes, so it never lingers open on the
  // next page (covers links to the current path and browser back/forward). React's
  // recommended "adjust state during render" reset — no effect, no cascading render.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
  }

  // Transparent + light only while floating over the dark hero.
  const overHero = isHome && !scrolled;
  // Solid warm-paper bar. NO backdrop-blur: at 90% paper opacity the frost was barely
  // visible yet caused a Chromium backdrop-filter repaint artifact — on hover the link
  // glyphs ghosted/"doubled" as the blurred backdrop re-sampled (the reported nav bug).
  // A fully opaque editorial bar is cleaner, more on-brand, and removes the cause.
  const solid = "border-b border-line bg-paper";

  // Mark the current section so the nav reads as a wayfinding system, not a row of
  // identical links. /galeries stays active inside a genre (e.g. /galeries/familles).
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  // One comfortable nav-link rhythm, shared desktop (D037): ~15px, generous vertical
  // hit area, gentle clay on hover. Colour resolves per surface (over-hero vs solid).
  const navLink = "py-2.5 text-[0.95rem] hover:text-clay";

  return (
    <header
      className={cn(
        "isolate top-0 z-50 transition-colors duration-300",
        isHome ? "fixed inset-x-0" : `sticky ${solid}`,
        isHome && (scrolled ? solid : "border-b border-transparent bg-transparent"),
        overHero && "dark-surface",
      )}
    >
      {/* Legibility scrim — only while floating transparent over photography. Keeps
          the nav readable over a bright frame without adding any visible chrome. */}
      {overHero ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-ink/50 to-transparent"
        />
      ) : null}
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          className={cn(
            "font-serif text-lg sm:text-xl",
            overHero ? "text-paper" : "text-ink",
          )}
        >
          {site.brand}
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-8 sm:flex lg:gap-10"
        >
          {site.nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  navLink,
                  // offset-4 attaches the active underline to the word and matches the
                  // mobile menu, so it never reads as a floating second line.
                  active && "underline decoration-1 underline-offset-4",
                  overHero
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
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(navLink, overHero ? "text-paper/55" : "text-muted")}
          >
            Instagram
          </a>
          {/* Renders nothing until a second locale is active (zero change today). */}
          <LanguageSwitcher onDark={overHero} />
        </nav>

        {/* Mobile trigger — opens the full-screen overlay (D038). The hit area is a
            full 48px-tall, padded box (was a bare ~41×43px glyph): a corner target
            below 44px is exactly the kind a real thumb misses, while every automated
            test taps dead-centre and never sees it. `-mr-2 px-2` grows the tappable
            box into the gutter toward the corner without moving the visible word. */}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOpen(true)}
          className={cn(
            "-mr-2 flex h-12 items-center px-2 text-[0.95rem] hover:text-clay sm:hidden",
            overHero ? "text-paper" : "text-ink",
          )}
        >
          Menu
        </button>
      </Container>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isActive={isActive}
      />
    </header>
  );
}
