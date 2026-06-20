import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { GalleryView } from "@/components/gallery/gallery-view";
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
    <Container className="py-18 sm:py-24">
      <h1 className="font-serif text-4xl text-ink">{gallery.title}</h1>
      <p className="mt-4 max-w-xl text-muted">{gallery.intro}</p>
      <div className="mt-12">
        <GalleryView images={gallery.images} />
      </div>
    </Container>
  );
}
