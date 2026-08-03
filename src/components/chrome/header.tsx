"use client";

// header — the floating navigation: a separate layer that lives ABOVE the world (fixed,
// never in document flow), so content scrolls under it. A persistent soft scrim keeps the
// wordmark + links legible over the bright hero; a frosted fill fades in once the visitor
// leaves the top, so the bar stays readable over the plates below without ever becoming a
// solid band. Light, quiet, premium. Wordmark left (home link), inline destinations ≥1024,
// an editorial menu overlay below. (Interior chapters reserve the bar's height via
// .ch-chapter, so the fixed layer never overlaps their content.)

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { link, refFromPathname } from "@/lib/routes";
import { scrollToTop } from "@/lib/scroll-to-top";
import { cn } from "@/lib/utils/cn";
import { Navigation } from "./navigation";
import { MenuDialog, type MenuDialogLabels } from "./menu-dialog";

export interface HeaderChrome extends MenuDialogLabels {
  openMenu: string;
  menu: string;
}

export function Header(props: {
  locale: Locale;
  /** Retained for API stability; CHAMBRE is uniformly dark, so the bar is always the
   *  floating overlay treatment. */
  tone?: "paper" | "overlay";
  showSeances: boolean;
  chrome: HeaderChrome;
  socials: { instagram?: string; facebook?: string; email?: string };
}) {
  const { locale, showSeances, chrome, socials } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() ?? "/";
  // The wordmark is the home control: on any other page it returns to the homepage of the
  // current locale (the Link href does that, FR→FR / EN→EN); already on the homepage it
  // smoothly returns to the top, reusing the site's one scroll-to-top mechanism.
  const isHome = refFromPathname(pathname)?.page === "home";

  useEffect(() => {
    // A tiny threshold: at the very top the bar floats on scrim alone (over the hero);
    // once the visitor moves, the frosted fill settles in. rAF-coalesced, passive.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 32);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <header className={cn("ch-nav", scrolled && "is-scrolled")}>
        <div className="ch-nav-scrim" aria-hidden />
        <div className="ch-nav-fill" aria-hidden />
        <div className="ch-nav-inner">
          <Link
            href={link(locale, { page: "home" })}
            className="ch-wordmark"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToTop();
              }
            }}
          >
            {chrome.brand}
          </Link>

          <div className="hidden lg:block">
            <Navigation
              locale={locale}
              showSeances={showSeances}
              labels={{ primary: chrome.primary, language: chrome.language }}
            />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="menu-dialog"
            aria-label={chrome.openMenu}
            className="ch-nav-trigger flex items-center lg:hidden"
          >
            {chrome.menu}
          </button>
        </div>
      </header>

      <MenuDialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        locale={locale}
        showSeances={showSeances}
        labels={chrome}
        socials={socials}
      />
    </>
  );
}
