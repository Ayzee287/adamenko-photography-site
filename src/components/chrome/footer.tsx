// footer — the site's complete index, identical on every page (server
// component; dictionary-fed; registry-generated links ONLY). Ruled
// composition: paper-deep · Group A identity · Group B pages · Group C
// "suivre" (socials + email) · full-width legal row.

import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale } from "@/lib/request-locale";
import { link, navInventory } from "@/lib/routes";
import { IconLink } from "@/components/actions/icon-link";

export function Footer(props: { showSeances: boolean }) {
  const { showSeances } = props;
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const { ui } = dict;
  const lang = locale === "en" ? "en" : "fr";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-paper-deep">
      <div className="mx-auto max-w-site px-5 py-8 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:gap-8">
          {/* Group A — identity */}
          <div className="max-w-measure md:max-w-none md:basis-1/2">
            <Link href={link(locale, { page: "home" })} className="text-wordmark text-ink">
              {dict.site.brand}
            </Link>
            <p className="mt-2.5 text-body text-ink-secondary">
              {dict.copy.footer.tagline}
            </p>
          </div>

          {/* Group B — pages (two columns on a phone so it doesn't run down the screen) */}
          <nav
            aria-label={ui.nav.footer}
            className="grid grid-cols-2 gap-x-8 gap-y-2.5 md:flex md:flex-col md:gap-2"
          >
            {navInventory
              .filter((item) => !item.gated || showSeances)
              .map((item) => (
                <Link
                  key={item.id}
                  href={link(locale, { page: item.id })}
                  className="ch-foot-link w-fit py-1 text-nav"
                >
                  {item.label[lang]}
                </Link>
              ))}
          </nav>

          {/* Group C — one contact group: Instagram · Facebook · Email.
              The three are the SAME kind of control (a way to reach her), so they are the
              same kind of object: three 44px icon targets in one row. The address used to
              sit beside the group as a visible line of text, which split one group into
              two and made the email look like a caption rather than an action. The glyph
              carries a real mailto and an explicit aria-label, so nothing is lost by
              dropping the visible string — and the contact page still spells it out. */}
          <div className="-ml-2 flex items-center">
            {dict.site.social.instagram && (
              <IconLink
                icon="instagram"
                href={dict.site.social.instagram}
                label={ui.nav.instagram}
              />
            )}
            {dict.site.social.facebook && (
              <IconLink
                icon="facebook"
                href={dict.site.social.facebook}
                label={ui.nav.facebook}
              />
            )}
            {dict.photographer.contact.email && (
              <IconLink
                icon="email"
                href={`mailto:${dict.photographer.contact.email}`}
                label={ui.nav.email}
              />
            )}
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-6 flex flex-col gap-2 border-t border-hairline pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-small text-ink-secondary">
            © {year} {dict.site.brand}. {dict.copy.footer.rights}
          </p>
          <nav aria-label={ui.nav.legal} className="flex gap-6">
            <Link
              href={link(locale, { page: "mentions-legales" })}
              className="ch-foot-link w-fit py-1 text-small"
            >
              {dict.site.legalNav[0].label}
            </Link>
            <Link
              href={link(locale, { page: "confidentialite" })}
              className="ch-foot-link w-fit py-1 text-small"
            >
              {dict.site.legalNav[1].label}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
