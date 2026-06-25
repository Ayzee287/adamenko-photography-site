import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/contact-form";
import { copy, site } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: copy.contact.title,
  description: copy.contact.intro,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Container className="py-10 sm:py-16">
      <Reveal>
        <PageHeader
          eyebrow={copy.contact.eyebrow}
          title={copy.contact.title}
          intro={copy.contact.intro}
        />
      </Reveal>

      <ContactForm />

      <p className="mt-10 text-sm text-muted">
        {site.contact.email ? (
          <>
            Ou écrivez-moi directement à{" "}
            <a
              href={`mailto:${site.contact.email}`}
              className="text-ink underline decoration-clay underline-offset-4 hover:text-clay"
            >
              {site.contact.email}
            </a>
            , ou retrouvez-moi sur{" "}
          </>
        ) : (
          <>Ou retrouvez-moi sur{" "}</>
        )}
        <a
          href={site.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline decoration-clay underline-offset-4 hover:text-clay"
        >
          Instagram
        </a>
        .
      </p>
    </Container>
  );
}
