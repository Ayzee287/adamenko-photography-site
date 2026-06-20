import Link from "next/link";
import { Container } from "@/components/layout/container";
import { site, copy } from "@/content/site";

/**
 * Footer, made editorial (v2): one wide line, not a cluster of technical groups.
 * The brand reads large in serif; navigation + Instagram sit as a quiet inline
 * row; a single hairline carries a slim copyright. Stronger hierarchy, far less
 * small print.
 *
 * No top margin (v4): the footer begins the instant the section above it ends, so
 * on the homepage it reads as the quiet sign-off of the dark contact band — one
 * closing movement, not a second screen across a paper void. Its own border-t
 * hairline is the only divider needed.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <Container className="border-t border-line py-10 sm:py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="font-serif text-2xl text-ink sm:text-3xl">
              {site.brand}
            </Link>
            <p className="mt-3 max-w-xs text-pretty text-muted">
              {copy.footer.tagline}
            </p>
          </div>

          <nav
            aria-label="Pied de page"
            className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink/80 sm:justify-end"
          >
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-clay">
                {item.label}
              </Link>
            ))}
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-clay"
            >
              {copy.footer.instagram}
            </a>
          </nav>
        </div>

        <p className="mt-10 text-xs tracking-wide text-muted">
          © {year} {site.brand}. {copy.footer.rights}
        </p>
      </Container>
    </footer>
  );
}
