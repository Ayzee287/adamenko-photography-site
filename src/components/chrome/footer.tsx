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
      <div className="mx-auto max-w-site px-5 py-9 md:px-8">
        <div className="flex flex-col gap-7 md:flex-row md:justify-between md:gap-8">
          {/* Group A — identity */}
          <div className="max-w-measure md:max-w-none md:basis-1/2">
            <Link href={link(locale, { page: "home" })} className="text-wordmark text-ink">
              {dict.site.brand}
            </Link>
            <p className="mt-3 text-body text-ink-secondary">
              {dict.copy.footer.tagline}
            </p>
          </div>

          {/* Group B — pages */}
          <nav aria-label={ui.nav.footer} className="flex flex-col gap-2">
            {navInventory
              .filter((item) => !item.gated || showSeances)
              .map((item) => (
                <Link
                  key={item.id}
                  href={link(locale, { page: item.id })}
                  className="text-nav text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
                >
                  {item.label[lang]}
                </Link>
              ))}
          </nav>

          {/* Group C — suivre */}
          <div className="flex flex-col gap-2">
            <div className="flex">
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
            </div>
            <a
              href={`mailto:${dict.photographer.contact.email}`}
              className="text-small text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
            >
              {dict.photographer.contact.email}
            </a>
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-8 flex flex-col gap-2 border-t border-hairline pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-small text-ink-secondary">
            © {year} {dict.site.brand}. {dict.copy.footer.rights}
          </p>
          <nav aria-label={ui.nav.legal} className="flex gap-6">
            <Link
              href={link(locale, { page: "mentions-legales" })}
              className="text-small text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
            >
              {dict.site.legalNav[0].label}
            </Link>
            <Link
              href={link(locale, { page: "confidentialite" })}
              className="text-small text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
            >
              {dict.site.legalNav[1].label}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
