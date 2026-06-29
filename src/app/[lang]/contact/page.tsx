import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/contact-form";
import { CONTACT_OCCASIONS } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const t = getDictionary(locale);
  return buildMetadata({
    title: t.copy.contact.title,
    description: t.copy.contact.intro,
    path: "/contact",
    locale,
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  setRequestLocale(locale);
  const t = getDictionary(locale);
  const c = t.copy.contact;

  // The select DISPLAYS localized labels but SUBMITS the canonical French value, so the
  // server enum (lib/contact) and the operator's inbox categorisation never change.
  const occasions = CONTACT_OCCASIONS.map((value, i) => ({
    value,
    label: t.photographer.specialties[i] ?? value,
  }));

  const email = t.site.contact.email;
  const instagram = t.site.social.instagram;

  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
      </Reveal>

      {/* Two columns on desktop: the form (left) and reassurance in the formerly
          empty right half (C1). On mobile the reassurance follows the form. */}
      <div className="grid gap-14 lg:grid-cols-[minmax(0,34rem)_1fr] lg:gap-20">
        <div>
          <ContactForm
            t={c.form}
            occasions={occasions}
            locale={locale}
            fallbackEmail={email}
            instagramHref={instagram}
            instagramLabel={t.ui.nav.instagram}
          />

          <p className="mt-10 text-sm text-muted">
            {email ? (
              <>
                {t.ui.contact.orEmailDirect}{" "}
                <a
                  href={`mailto:${email}`}
                  className="text-ink underline decoration-clay underline-offset-4 hover:text-clay"
                >
                  {email}
                </a>
                , {t.ui.contact.andFindMeOn}{" "}
              </>
            ) : (
              <>{t.ui.contact.orFindMeOn}{" "}</>
            )}
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-clay underline-offset-4 hover:text-clay"
            >
              {t.ui.nav.instagram}
            </a>
            .
          </p>
        </div>

        <Reveal delay={120} className="lg:mt-10">
          <aside className="border-t border-line pt-10 lg:border-0 lg:pt-0">
            <h2 className="font-serif text-2xl text-ink">
              {c.reassurance.title}
            </h2>
            <ol className="mt-6 space-y-5">
              {c.reassurance.steps.map((step, i) => (
                <li key={i} className="flex gap-4 text-sm text-muted">
                  <span
                    aria-hidden
                    className="font-serif text-base leading-6 text-clay"
                  >
                    {i + 1}
                  </span>
                  <span className="text-pretty">{step}</span>
                </li>
              ))}
            </ol>
          </aside>
        </Reveal>
      </div>
    </Container>
  );
}
