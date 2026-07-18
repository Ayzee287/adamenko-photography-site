// image-frame — the photographic primitive and the ONLY legal image wrapper
// (media law). Ratio-locked box (CLS impossible), blur-up via the photo base,
// radius none (prints are not rounded), optional caption (serif, gap space/3)
// and story link. interactive="lightbox" renders button semantics
// ("Agrandir : {alt}") — consumers in a client boundary pass onOpen.

import { TextLink } from "@/components/actions/text-link";
import { Photo } from "./photo";

export type ImageRatio = "3:2" | "2:3" | "4:5" | "5:4" | "1:1";

const ratioClass: Record<ImageRatio, string> = {
  "3:2": "aspect-3/2",
  "2:3": "aspect-2/3",
  "4:5": "aspect-4/5",
  "5:4": "aspect-5/4",
  "1:1": "aspect-square",
};

export interface ImageFrameProps {
  src: string;
  alt: string;
  ratio: ImageRatio;
  sizes?: string;
  caption?: string;
  storyLink?: { href: string; label: string };
  interactive?: "none" | "lightbox";
  /** Provided by the client gallery boundary when interactive="lightbox". */
  onOpen?: () => void;
  /** Localised "Agrandir" (ui.nav.enlarge) — required when interactive. */
  enlargeLabel?: string;
}

export function ImageFrame(props: ImageFrameProps) {
  const {
    src,
    alt,
    ratio,
    sizes = "(min-width: 1200px) 960px, 100vw",
    caption,
    storyLink,
    interactive = "none",
    onOpen,
    enlargeLabel,
  } = props;

  const box = (
    <div className={`relative w-full overflow-hidden rounded-none ${ratioClass[ratio]}`}>
      <Photo src={src} alt={interactive === "lightbox" ? "" : alt} sizes={sizes} />
    </div>
  );

  return (
    <figure className="w-full">
      {interactive === "lightbox" ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${enlargeLabel ?? "Agrandir"} : ${alt}`}
          className="block w-full cursor-zoom-in active:opacity-(--opacity-press)"
        >
          {box}
        </button>
      ) : (
        box
      )}
      {caption && (
        <figcaption className="mt-3 text-caption text-ink-secondary">
          {caption}
        </figcaption>
      )}
      {storyLink && (
        <p className="mt-2">
          <TextLink href={storyLink.href}>{storyLink.label}</TextLink>
        </p>
      )}
    </figure>
  );
}
