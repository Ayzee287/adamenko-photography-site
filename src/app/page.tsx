import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Hero } from "@/components/ui/hero";
import { copy } from "@/content/site";
import { galleries } from "@/content/galleries";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />

      <Container className="py-16">
        <p className="max-w-2xl font-serif text-2xl leading-snug text-ink">
          {copy.home.intro}
        </p>
      </Container>

      <Container className="pb-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">
          {copy.home.featuredTitle}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/galeries/${g.slug}`}
                className="block h-full border border-line p-6 hover:border-clay"
              >
                <span className="font-serif text-xl text-ink">{g.title}</span>
                <span className="mt-2 block text-sm text-muted">{g.intro}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="py-16">
        <Link
          href="/contact"
          className="border-b border-clay pb-1 text-lg text-ink hover:text-clay"
        >
          {copy.home.contactCta} →
        </Link>
      </Container>
    </>
  );
}
