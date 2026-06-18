import Link from "next/link";
import { Container } from "@/components/layout/container";
import { site, copy } from "@/content/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="flex flex-col gap-6 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/" className="font-serif text-lg text-ink">
            {site.brand}
          </Link>
          <p className="mt-2 max-w-sm text-sm text-muted">{copy.footer.tagline}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted sm:items-end">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-clay"
          >
            {copy.footer.instagram}
          </a>
          <p>
            © {year} {site.brand}. {copy.footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}
