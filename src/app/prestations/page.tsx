import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { copy } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: copy.services.title,
  description: copy.services.intro,
  path: "/prestations",
});

export default function PrestationsPage() {
  return (
    <Container className="py-16">
      <h1 className="font-serif text-4xl text-ink">{copy.services.title}</h1>
      <p className="mt-4 max-w-xl text-muted">{copy.services.intro}</p>

      {/* Inquiry-only at launch — no public prices (D007). */}
      <p className="mt-8 text-sm text-ink">{copy.services.note}</p>
      <Link
        href="/contact"
        className="mt-6 inline-block border border-ink px-6 py-2 text-sm text-ink hover:border-clay hover:text-clay"
      >
        {copy.services.cta}
      </Link>
    </Container>
  );
}
