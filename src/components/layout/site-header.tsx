"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { site } from "@/content/site";
import { subscribeScroll } from "@/lib/scroll";
import { cn } from "@/lib/utils";

/**
 * Slim, persistent header. On the homepage it floats transparent over the dark
 * hero (light text) and settles to solid warm paper once scrolled past it — the
 * cinematic chrome. On every other route it behaves exactly as before: a sticky,
 * solid, in-flow bar (no layout change to inner pages). The mobile menu stays a
 * no-JS `<details>` disclosure on a solid panel.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    if (!isHome) return;
    return subscribeScroll(() => setScrolled(window.scrollY > 24));
  }, [isHome]);

  // Close the mobile disclosure after navigating, so the panel never lingers open
  // on the next page (keyboard + touch).
  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false;
  }, [pathname]);

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
                  "text-sm hover:text-clay",
                  // offset-4 (was offset-8) — attaches the active underline to the word
                  // and matches the mobile menu, so it never reads as a floating 2nd line.
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
            className={cn(
              "text-sm hover:text-clay",
              overHero ? "text-paper/55" : "text-muted",
            )}
          >
            Instagram
          </a>
          {/* Renders nothing until a second locale is active (zero change today). */}
          <LanguageSwitcher onDark={overHero} />
        </nav>

        <details ref={menuRef} className="relative sm:hidden">
          <summary
            className={cn(
              "cursor-pointer list-none text-sm [&::-webkit-details-marker]:hidden",
              overHero ? "text-paper" : "text-ink",
            )}
          >
            Menu
          </summary>
          <nav
            aria-label="Navigation principale"
            className="absolute right-0 top-9 z-50 flex w-44 flex-col gap-3 border border-line bg-paper p-4"
          >
            {site.nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm hover:text-clay",
                    active
                      ? "text-ink underline decoration-1 decoration-clay underline-offset-4"
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
              className="text-sm text-muted hover:text-clay"
            >
              Instagram
            </a>
            {/* Renders nothing until a second locale is active (zero change today). */}
            <LanguageSwitcher className="pt-1" />
          </nav>
        </details>
      </Container>
    </header>
  );
}
