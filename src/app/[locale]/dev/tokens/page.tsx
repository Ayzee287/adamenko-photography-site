// Dev-only token demo (Roadmap P3 acceptance: "token demo page renders both
// surfaces from variables"). Not in the route registry — tooling, not product.
// Prerenders as 404 in production builds; live under `next dev` only.

import { notFound } from "next/navigation";

const spacing = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const widths = [
  "w-1", "w-2", "w-3", "w-4", "w-5", "w-6",
  "w-7", "w-8", "w-9", "w-10", "w-11", "w-12",
] as const;

function Swatches() {
  return (
    <div className="bg-paper text-ink p-6">
      <p>ink on paper</p>
      <p className="text-ink-secondary">ink-secondary on paper</p>
      <p className="text-ink-disabled">ink-disabled (controls only)</p>
      <p className="text-bronze">bronze — accent text, never a fill</p>
      <p className="text-error">error — message text only</p>
      <hr className="border-hairline my-4" />
      <div className="bg-paper-deep p-4">paper-deep chapter surface</div>
    </div>
  );
}

export default function TokensDemo() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main id="main" className="p-8">
      <h1>Tokens — Foundations v1.0.0</h1>

      <h2>Surfaces & content (paper mode)</h2>
      <Swatches />

      <h2>Dark scope — same utilities, remapped (.surface-dark)</h2>
      <div className="surface-dark">
        <Swatches />
      </div>

      <h2>Spacing — the 12 steps</h2>
      <div className="flex flex-col gap-1">
        {spacing.map((step, i) => (
          <div key={step} className="flex items-center gap-4">
            <span className="text-ink-secondary">space/{step}</span>
            <div className={`${widths[i]} h-2 bg-ink`} />
          </div>
        ))}
      </div>

      <h2>Radius trio</h2>
      <div className="flex gap-5 p-4">
        <div className="size-10 border border-hairline rounded-none" />
        <div className="size-10 border border-hairline rounded-field" />
        <div className="h-10 w-12 border border-ink rounded-pill" />
      </div>

      <h2>Scrims — the only gradients</h2>
      <div className="relative bg-paper-deep h-10 w-12">
        <div className="absolute inset-0 scrim-opening" />
      </div>
      <div className="scrim-lightbox h-10 w-12" />

      <h2>Layers</h2>
      <p className="text-ink-secondary">
        z-base 0 · z-header 100 · z-skip 110 · z-dialog 900 · z-lightbox 1000
      </p>

      <h2>Motion tokens</h2>
      <p className="text-ink-secondary">
        press 80 · fast 150 · standard 200 · lightbox 250 · decode 300 · settle
        400 · ease cubic-bezier(0.2, 0, 0, 1)
      </p>
    </main>
  );
}
