import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SocialLinks } from "@/components/layout/social-links";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale, localeHref } from "@/lib/request-locale";

/**
 * Footer — one wide editorial line (brand serif + a quiet inline nav row + a slim
 * copyright). No top margin (v4): it begins the instant the section above it ends.
 * A server component (the JS-free nav fallback), so it reads the request locale
 * directly and prefixes every internal link for the active locale.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const { site, copy, ui } = getDictionary(getRequestLocale());

  return (
    <footer>
      <Container className="border-t border-line py-10 sm:py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={localeHref("/")}
              className="font-serif text-2xl text-ink sm:text-3xl"
            >
              {site.brand}
            </Link>
            <p className="mt-3 max-w-xs text-pretty text-muted">
              {copy.footer.tagline}
            </p>
            {/* Persistent social — elegant icons rather than a heavy text item, so
                every page carries the channels without cluttering the chrome. */}
            <SocialLinks
              instagram={site.social.instagram}
              facebook={site.social.facebook}
              instagramLabel={ui.nav.instagram}
              facebookLabel={ui.nav.facebook}
              size={19}
              className="mt-5"
            />
          </div>

          <nav
            aria-label={ui.nav.footer}
            className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink/80 sm:justify-end"
          >
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={localeHref(item.href)}
                className="hover:text-clay"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 text-xs tracking-wide text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.brand}. {copy.footer.rights}
          </p>
          <nav aria-label={ui.nav.legal} className="flex flex-wrap gap-x-6 gap-y-2">
            {site.legalNav.map((item) => (
              <Link
                key={item.href}
                href={localeHref(item.href)}
                className="hover:text-clay"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
