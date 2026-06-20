import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { copy } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: copy.about.title,
  path: "/a-propos",
});

export default function AProposPage() {
  return (
    <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:gap-24">
      <div>
        <h1 className="font-serif text-4xl text-ink">{copy.about.title}</h1>
        <div className="mt-6 space-y-4 text-muted">
          {copy.about.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
      <ImageFigure
        image={{ alt: copy.about.portraitAlt, ratio: "aspect-[4/5]" }}
        sizes="(min-width:1024px) 50vw, 100vw"
      />
    </Container>
  );
}
