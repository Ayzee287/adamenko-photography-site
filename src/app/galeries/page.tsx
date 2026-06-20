import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { copy } from "@/content/site";
import { galleries } from "@/content/galleries";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: copy.galleries.title,
  description: copy.galleries.intro,
  path: "/galeries",
});

export default function GaleriesPage() {
  return (
    <Container className="py-16 sm:py-24">
      <h1 className="font-serif text-4xl text-ink">{copy.galleries.title}</h1>
      <p className="mt-4 max-w-xl text-muted">{copy.galleries.intro}</p>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/galeries/${g.slug}`}
              className="block h-full border border-line p-6 hover:border-clay"
            >
              <span className="font-serif text-2xl text-ink">{g.title}</span>
              <span className="mt-2 block text-sm text-muted">{g.intro}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
