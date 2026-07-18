"use client";

// lightbox — the viewing room. Native <dialog> (the P7-validated pattern:
// focus trap, Escape, top layer, focus-return for free). Warm dark room
// (.surface-dark + scrim-lightbox), stage ≤90vw/85vh, caption + counter
// below, close top-right (44), prev/next mid-edges ≥1024 (touch swipes and
// pinches natively below). Neighbors preloaded. Labels = V1's production
// strings (ui.nav lightbox block).

import { useEffect, useRef } from "react";
import Image from "next/image";
import { blurMap } from "@/lib/image-blur";
import { cn } from "@/lib/utils/cn";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface LightboxLabels {
  dialog: string; // "Aperçu de la photographie"
  close: string; // "Fermer"
  closeLabel: string; // "Fermer ✕"
  prevPhoto: string;
  nextPhoto: string;
  photograph: string; // "Photographie"
  of: string; // "sur"
}

function ControlButton(props: {
  onClick: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { onClick, label, className, children } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-(--size-target-min) w-(--size-target-min) items-center justify-center text-ink transition-colors duration-(--duration-standard) hover:text-ink active:opacity-(--opacity-press)",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Lightbox(props: {
  images: LightboxImage[];
  index: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  labels: LightboxLabels;
}) {
  const { images, index, open, onClose, onNavigate, labels } = props;
  const ref = useRef<HTMLDialogElement>(null);
  const count = images.length;
  const current = images[index];

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Preload neighbors so arrows feel instant.
  useEffect(() => {
    if (!open || count < 2) return;
    for (const n of [index - 1, index + 1]) {
      const neighbor = images[(n + count) % count];
      if (neighbor) new window.Image().src = neighbor.src;
    }
  }, [open, index, count, images]);

  const prev = () => onNavigate((index - 1 + count) % count);
  const next = () => onNavigate((index + 1) % count);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  if (count === 0) return null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onKeyDown={onKeyDown}
      aria-label={labels.dialog}
      className="surface-dark z-lightbox m-0 h-dvh max-h-none w-screen max-w-none scrim-lightbox p-0 backdrop:bg-transparent"
    >
      <div className="relative flex h-full flex-col items-center justify-center gap-3 p-5">
        <ControlButton
          onClick={onClose}
          label={labels.close}
          className="absolute right-5 top-5"
        >
          <svg
            viewBox="0 0 20 20"
            className="h-(--size-icon) w-(--size-icon)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </ControlButton>

        {count > 1 && (
          <>
            <ControlButton
              onClick={prev}
              label={labels.prevPhoto}
              className="absolute left-5 top-1/2 hidden -translate-y-1/2 lg:flex"
            >
              <span aria-hidden>‹</span>
            </ControlButton>
            <ControlButton
              onClick={next}
              label={labels.nextPhoto}
              className="absolute right-5 top-1/2 hidden -translate-y-1/2 lg:flex"
            >
              <span aria-hidden>›</span>
            </ControlButton>
          </>
        )}

        <div className="relative max-h-(--size-lightbox-h) max-w-(--size-lightbox-w) flex-1">
          {current && (
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes="90vw"
              quality={85}
              className="object-contain"
              {...(blurMap[current.src]
                ? { placeholder: "blur" as const, blurDataURL: blurMap[current.src] }
                : {})}
            />
          )}
        </div>

        <div className="text-center">
          {current?.caption && (
            <p className="text-small text-ink-secondary">{current.caption}</p>
          )}
          <p className="text-small text-ink-secondary">
            <span className="sr-only">{labels.photograph} </span>
            {index + 1}
            <span aria-hidden> / </span>
            <span className="sr-only">{labels.of} </span>
            {count}
          </p>
        </div>
      </div>
    </dialog>
  );
}
