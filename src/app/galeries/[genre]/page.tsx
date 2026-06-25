import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { GalleryView } from "@/components/gallery/gallery-view";
import { copy } from "@/content/site";
import { genreSlugs, getGallery } from "@/content/galleries";
import { buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ genre: string }> };

// Fully static: the only valid routes are the five genres. Any other slug is a
// static 404 — the routable set is closed by the galleries collection.
export const dynamicParams = false;

export function generateStaticParams() {
  return genreSlugs.map((genre) => ({ genre }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { genre } = await params;
  const gallery = getGallery(genre);
  if (!gallery) return {};
  return buildMetadata({
    title: gallery.title,
    description: gallery.intro,
    path: `/galeries/${gallery.slug}`,
  });
}

export default async function GenrePage({ params }: PageProps) {
  const { genre } = await params;
  const gallery = getGallery(genre);
  if (!gallery) notFound();

  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader
          eyebrow={copy.galleries.title}
          title={gallery.title}
          intro={gallery.intro}
        />
      </Reveal>
      <div className="mt-10 sm:mt-16">
        <GalleryView images={gallery.images} />
      </div>
    </Container>
  );
}
