// door — image-led route to a service or genre: a mirror, not a menu item.
// ONE link surface: ImageFrame (never interactive here) + noun (h3, underline
// reveal) + serif line + optional fact line (Prestations only) + arrow.
// Image→noun space/4, noun→line space/2. Press dim; hover = turn + reveal.

import Link from "next/link";
import { ImageFrame, type ImageRatio } from "@/components/media/image-frame";
import { cn } from "@/lib/utils/cn";

export function Door(props: {
  href: string;
  image: { src: string; alt: string; ratio: ImageRatio; sizes?: string };
  noun: string;
  line: string;
  fact?: string;
}) {
  const { href, image, noun, line, fact } = props;
  return (
    <Link
      href={href}
      className="group block active:opacity-(--opacity-press)"
    >
      <ImageFrame {...image} />
      <h3
        className={cn(
          "mt-4 text-h3 text-ink underline-offset-4 decoration-1",
          "group-hover:underline group-hover:decoration-ink",
        )}
      >
        {noun}
      </h3>
      <p className="mt-2 text-body-letter text-ink">{line}</p>
      {fact && <p className="mt-2 text-body text-ink-secondary">{fact}</p>}
      <span
        aria-hidden
        className="mt-2 inline-block text-button text-ink opacity-0 transition-opacity duration-(--duration-standard) group-hover:opacity-100"
      >
        →
      </span>
    </Link>
  );
}
