import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale, localeHref } from "@/lib/request-locale";

// Brought onto the inner-page system (D039): the same PageHeader grammar, Reveal,
// opening rhythm and secondary-link CTA as every other page. Reads the request locale
// (set by the layout) so the 404 localises and its "home" link is locale-correct.
export default function NotFound() {
  const t = getDictionary(getRequestLocale()).ui.notFound;
  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
        <div className="mt-8">
          <ButtonLink href={localeHref("/")} variant="secondary">
            {t.back}
          </ButtonLink>
        </div>
      </Reveal>
    </Container>
  );
}
