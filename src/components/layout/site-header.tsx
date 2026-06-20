"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/layout/container";
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

  useEffect(() => {
    if (!isHome) return;
    return subscribeScroll(() => setScrolled(window.scrollY > 24));
  }, [isHome]);

  // Transparent + light only while floating over the dark hero.
  const overHero = isHome && !scrolled;
  const solid = "border-b border-line bg-paper/90 backdrop-blur";

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
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className={cn(
            "font-serif text-base tracking-tight",
            overHero ? "text-paper/90" : "text-ink",
          )}
        >
          {site.brand}
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-9 sm:flex"
        >
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[0.8rem] hover:text-clay",
                overHero ? "text-paper/75" : "text-ink/80",
              )}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-[0.82rem] hover:text-clay",
              overHero ? "text-paper/65" : "text-muted",
            )}
          >
            Instagram
          </a>
        </nav>

        <details className="relative sm:hidden">
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
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ink hover:text-clay"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-clay"
            >
              Instagram
            </a>
          </nav>
        </details>
      </Container>
    </header>
  );
}
