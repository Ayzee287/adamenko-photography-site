// footer — the site's complete index, identical on every page (server
// component; dictionary-fed; registry-generated links ONLY). Ruled
// composition: paper-deep · Group A identity · Group B pages · Group C
// "suivre" (socials + email) · full-width legal row.

import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale } from "@/lib/request-locale";
import { link, navInventory, serviceInventory } from "@/lib/routes";
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
      {/* Asymmetric block padding on purpose: the footer needs its opening beat away from
          the page above it, but the legal row already carries its own `pt-5` above a
          hairline, so a matching 32px underneath left the last line of text floating in
          empty space at the very bottom of every page. Top beat unchanged. */}
      <div className="mx-auto max-w-site px-5 pt-8 pb-4 md:px-8">
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

          {/* Group B2 — the four service dossiers. They are the pages the business sells on,
              and until now they were reachable only from /tarifs and from their own genre
              gallery: one or two internal links each, on a site with nothing indexed. This
              column is the footer keeping the promise at the top of this file — the complete
              index — and it is the only place on the site where the four offers are listed
              together on every page. It carries a visible heading because "Mariage · Famille
              · Grossesse · Couple" beside "Galeries · Tarifs" would read as one confused list
              of destinations; the pages column needs no heading, being self-evident. */}
          {/* The heading sits on the same optical line as the first link of the pages column
              beside it, and the four service links then run on that column's rhythm. The
              pages links carry `py-1`, so their text starts 4px below the column top while
              this heading started at the top and pushed its own links 2.5 lower — two
              columns of the same four items, neither aligned to the other. `pt-1` puts the
              heading on the neighbouring links' baseline; `mb-1.5` closes the surplus under
              it so the four categories keep the pages column's step. */}
          <nav aria-label={ui.nav.services}>
            <p className="ch-mono mb-1.5 pt-1">{ui.nav.services}</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 md:flex md:flex-col md:gap-2">
              {serviceInventory.map((item) => (
                <Link
                  key={item.id}
                  href={link(locale, { page: "service", service: item.id })}
                  className="ch-foot-link w-fit py-1 text-nav"
                >
                  {item.label[lang]}
                </Link>
              ))}
            </div>
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
