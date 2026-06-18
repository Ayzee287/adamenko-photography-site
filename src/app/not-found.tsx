import Link from "next/link";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-serif text-5xl text-ink">404</p>
      <p className="mt-4 text-muted">Cette page n&apos;existe pas.</p>
      <Link
        href="/"
        className="mt-8 inline-block border-b border-clay pb-1 text-ink hover:text-clay"
      >
        Retour à l&apos;accueil →
      </Link>
    </Container>
  );
}
