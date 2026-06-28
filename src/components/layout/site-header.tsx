"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  nav: readonly { href: string; label: string }[];
  ui: Dictionary["ui"];
  contactCta: string;
};

/**
 * Slim, persistent header. On the homepage it floats transparent over the dark hero
 * (light text) and settles to solid warm paper once scrolled past it. On every other
 * route it is a sticky, solid bar. Locale-aware: all internal links are prefixed for
 * the active locale, and the strings are passed in (the content graph never enters the
 * client bundle). Mobile (D038): a full-screen editorial overlay (`MobileMenu`).
 */
export function SiteHeader({ lang, chrome }: { lang: Locale; chrome: ChromeStrings }) {
  const pathname = usePathname();
  // Normalise the pathname (strip any locale prefix) so SSR (generated at "/fr/…") and
  // the hydrated client (served at "/…") compute identical state — no hydration
  // mismatch on the FR home header or the active nav state (I1).
  const path = canonicalPathname(pathname);
  const homePath = localizedPath(lang, "/");
  const isHome = path === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    return subscribeScroll(() => setScrolled(window.scrollY > 24));
  }, [isHome]);

  // Close the overlay whenever the route changes (React's "adjust state during render").
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
  }

  const overHero = isHome && !scrolled;
  const solid = "border-b border-line bg-paper";

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
      className={cn(
        "isolate top-0 z-50 transition-colors duration-300 ease-[var(--ease-settle)]",
        isHome ? "fixed inset-x-0" : `sticky ${solid}`,
        isHome && (scrolled ? solid : "border-b border-transparent bg-transparent"),
        overHero && "dark-surface",
      )}
    >
      {overHero ? (
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
            overHero ? "text-paper" : "text-ink",
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
            href={chrome.instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(navLink, overHero ? "text-paper/55" : "text-muted")}
          >
            {chrome.ui.nav.instagram}
          </a>
          <LanguageSwitcher onDark={overHero} label={chrome.ui.nav.language} />
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
            overHero ? "text-paper" : "text-ink",
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
