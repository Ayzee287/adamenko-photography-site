import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { GalleryView } from "@/components/gallery/gallery-view";
import { genreSlugs } from "@/content/galleries";
import { buildMetadata } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ lang: string; genre: string }> };

// Fully static: the only valid routes are the five genres (× active locales). Any other
// slug is a static 404 — the routable set is closed by the galleries collection.
export const dynamicParams = false;

export function generateStaticParams() {
  return genreSlugs.map((genre) => ({ genre }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, genre } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const gallery = getDictionary(locale).galleries.find((g) => g.slug === genre);
  if (!gallery) return {};
  return buildMetadata({
    title: gallery.title,
    description: gallery.intro,
    path: `/galeries/${gallery.slug}`,
    locale,
  });
}

export default async function GenrePage({ params }: PageProps) {
  const { lang, genre } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  setRequestLocale(locale);
  const t = getDictionary(locale);
  const gallery = t.galleries.find((g) => g.slug === genre);
  if (!gallery) notFound();

  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader
          eyebrow={t.copy.galleries.title}
          title={gallery.title}
          intro={gallery.intro}
        />
      </Reveal>
      <div className="mt-10 sm:mt-16">
        <GalleryView images={gallery.images} t={t.ui.gallery} />
      </div>
    </Container>
  );
}
