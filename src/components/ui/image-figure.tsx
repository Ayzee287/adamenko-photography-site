import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/gallery";

type ImageFigureProps = {
  image: GalleryImage;
  /** Optional plate index for reserved frames, e.g. "01". */
  index?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /**
   * For cards inside a `group`: a slow scale within the frame once a real photo
   * is present. The one sanctioned transform-transition (vault motion-concept);
   * everything else uses the global interaction clock.
   */
  interactive?: boolean;
};

/** French orientation + display ratio parsed from an `aspect-[w/h]` token. */
function describeFrame(ratio?: string): { orientation: string; label: string } | null {
  if (!ratio) return null;
  let w = 0;
  let h = 0;
  const m = ratio.match(/aspect-\[(\d+)\/(\d+)\]/);
  if (m) {
    w = Number(m[1]);
    h = Number(m[2]);
  } else if (ratio.includes("square")) {
    w = 1;
    h = 1;
  } else if (ratio.includes("video")) {
    w = 16;
    h = 9;
  }
  if (!w || !h) return null;
  const orientation = w > h ? "Paysage" : h > w ? "Portrait" : "Carré";
  return { orientation, label: `${w}:${h}` };
}

/**
 * The single way photography is presented — **borderless** (D021): the image is
 * the object, no ring/card around it. With a real export it renders an optimised
 * `next/image` (responsive, lazy, fades in). Without one it renders a *directed*
 * reserved frame — an art-direction board, not a blank beige rectangle (v2): a
 * warm tonal field with a quiet light, captioned with the orientation·ratio it
 * expects, the subject it holds, and a one-line art-direction note. The whole
 * homepage is designed to feel intentional on placeholders alone; the real photo
 * drops into the same aspect-ratio frame with no layout shift (CLS ≈ 0).
 */
export function ImageFigure({
  image,
  index,
  sizes,
  priority,
  className,
  interactive,
}: ImageFigureProps) {
  const ratio = image.ratio ?? "aspect-[4/5]";
  const hasImage = Boolean(image.src);
  const frame = describeFrame(ratio);

  return (
    <figure
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(120%_120%_at_28%_18%,#f6efe4,#e3d6c4)]",
        ratio,
        className,
      )}
    >
      {hasImage ? (
        <Image
          src={image.src as string}
          alt={image.alt}
          fill
          sizes={
            sizes ?? "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          }
          priority={priority}
          className={cn(
            "motion-image-fade object-cover",
            interactive &&
              "transition-transform duration-[650ms] ease-[var(--ease-settle)] group-hover:scale-[1.04]",
          )}
        />
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col p-5 sm:p-6"
        >
          {/* Top caption — orientation · ratio (left), plate index (right). */}
          <span className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.28em] text-ink/40">
            <span>
              {frame ? `${frame.orientation} · ${frame.label}` : " "}
            </span>
            {index ? <span className="tabular-nums">{index}</span> : null}
          </span>

          {/* Subject + art-direction note, anchored to the lower edge. */}
          <span className="mt-auto block">
            {image.label ? (
              <span className="block font-serif text-base uppercase tracking-[0.14em] text-ink/55">
                {image.label}
              </span>
            ) : null}
            {image.hint ? (
              <span className="mt-2 block max-w-[28ch] font-serif text-sm italic leading-snug text-ink/45">
                {image.hint}
              </span>
            ) : null}
          </span>
        </span>
      )}
    </figure>
  );
}
