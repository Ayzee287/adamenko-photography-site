import Link from "next/link";
import { Container } from "@/components/layout/container";
import { site } from "@/content/site";

/**
 * Slim, quiet, persistent header. The logo returns home; the nav is minimal
 * (Galeries · À propos · Prestations · Contact) plus a quiet Instagram link.
 * The mobile menu is a no-JS `<details>` disclosure — no client bundle for chrome.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-lg tracking-tight text-ink">
          {site.brand}
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-8 sm:flex"
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

        <details className="relative sm:hidden">
          <summary className="cursor-pointer list-none text-sm text-ink [&::-webkit-details-marker]:hidden">
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
