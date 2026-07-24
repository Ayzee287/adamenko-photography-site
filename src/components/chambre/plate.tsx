// plate — how a photograph is presented in CHAMBRE: a lit museum print on a dark
// wall. A dark mat + hand-painted vignette + film grain frame the image; a mono
// plaque names it like a cartel; an optional serif caption whispers underneath.
// The image is the ONLY thing in the product that holds light and colour.
//
// Server component. Wraps the repo's <Photo> (the single next/image call — blur-up,
// fill/cover, CLS-safe because the ratio box is reserved here). When `href` is set the
// whole plate is one link surface (a door), with the exposure-lift reserved for links.

import Link from "next/link";
import { Photo } from "@/components/media/photo";
import { cn } from "@/lib/utils/cn";

export type PlateRatio = "cine" | "frame" | "tall" | "sq";

const ratioClass: Record<PlateRatio, string> = {
  cine: "ch-ar-cine",
  frame: "ch-ar-frame",
  tall: "ch-ar-tall",
  sq: "ch-ar-sq",
};

export function Plate(props: {
  src: string;
  alt: string;
  ratio?: PlateRatio;
  /** Mono cartel, e.g. "N° 014 — FAMILLES". */
  plaque?: string;
  /** Serif whisper under the plaque. */
  caption?: string;
  href?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const {
    src,
    alt,
    ratio = "frame",
    plaque,
    caption,
    href,
    priority = false,
    sizes = "(min-width: 82rem) 1312px, 100vw",
    className,
  } = props;

  const inner = (
    <>
      <div className="ch-plate-img">
        {/* The whole plate carries the accessible name via aria-label (link) or the
            plaque/caption; the raster itself stays decorative to avoid double-announce
            when it is a link. Non-link plates keep the real alt. */}
        <Photo src={src} alt={href ? "" : alt} sizes={sizes} priority={priority} />
      </div>
      <div className="ch-plate-vig" aria-hidden />
      <div className="ch-plate-grain" aria-hidden />
      {plaque && (
        <p className="ch-plaque">
          <span className="ch-dot" aria-hidden />
          {plaque}
        </p>
      )}
      {caption && <p className="ch-caption">{caption}</p>}
    </>
  );

  const cls = cn("ch-plate", ratioClass[ratio], className);

  if (href) {
    return (
      <Link href={href} aria-label={alt} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <figure className={cls}>
      {inner}
    </figure>
  );
}
