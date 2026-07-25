// ambient — the darkroom's rendering layer, mounted ONCE in the root layout (behind
// everything). Not a background and not decoration: it is the room. It composes, back
// to front:
//   • .ch-ambient        — the depth of the room: a warm back-wall glow (a light source
//                          lives here), receding walls, deep peripheral vignette;
//   • .ch-ambient::after  — the safelight: a soft warm lamp high in a corner that breathes
//                          and drifts (volumetric);
//   • .ch-beam           — a slow diagonal shaft of light crossing the room (god-ray),
//                          so light visibly exists INSIDE the space and has direction;
//   • .ch-ambient-light  — the KEY LIGHT: a large warm pool that answers the visitor's
//                          presence, drifting toward the cursor with heavy inertia
//                          (<AmbientCursor/>), or wandering on its own on touch;
//   • .ch-motes          — dust in the light, in three depth tiers (near/mid/far) so the
//                          air has volume; drifts even when the visitor is idle;
//   • .ch-grain          — film grain over the whole frame, gently boiling.
// Everything is aria-hidden, pointer-events:none, GPU-cheap (gradients + transforms, no
// blur() on always-on layers), gated to CHAMBRE routes and frozen under reduced-motion by
// chambre.css. Single source of truth: no page renders its own atmosphere.

import type { CSSProperties } from "react";
import { AmbientCursor } from "./ambient-cursor";

const MOTE_COUNT = 30;

// Deterministic pseudo-random from the index (identical on server + client → SSR-safe,
// no hydration mismatch, no Math.random at render).
function moteStyle(i: number): CSSProperties {
  const h = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  // Three depth tiers: far (small, dim, slow) → near (larger, brighter, quicker, blurred).
  const tier = i % 3; // 0 far · 1 mid · 2 near
  const size = [1.6, 2.6, 4][tier];
  const baseOpacity = [0.05, 0.09, 0.14][tier];
  const blur = [0.4, 0, 0.6][tier];
  const dur = [46, 34, 24][tier] + h(4) * 16;
  return {
    left: `${(4 + h(1) * 92).toFixed(2)}%`,
    top: `${(6 + h(2) * 88).toFixed(2)}%`,
    width: `${size}px`,
    height: `${size}px`,
    filter: blur ? `blur(${blur}px)` : undefined,
    "--m-o": (baseOpacity + h(3) * 0.05).toFixed(3),
    "--m-dur": `${dur.toFixed(1)}s`,
    "--m-del": `${(-h(5) * dur).toFixed(1)}s`,
    "--m-x": `${((h(6) - 0.5) * 90).toFixed(0)}px`,
    "--m-y": `${(-(70 + h(7) * 150)).toFixed(0)}px`,
    "--m-sway": `${((h(8) - 0.5) * 40).toFixed(0)}px`,
  } as CSSProperties;
}

export function Ambient() {
  return (
    <>
      <div className="ch-ambient" aria-hidden />
      <div className="ch-beam" aria-hidden />
      {/* The key light: outer element carries the cursor-reactive offset (--ch-lx/ly),
          inner element owns the autonomous CSS wander — so the room breathes even idle. */}
      <div className="ch-keylight" aria-hidden>
        <div className="ch-ambient-light" />
      </div>
      <div className="ch-motes" aria-hidden>
        {Array.from({ length: MOTE_COUNT }, (_, i) => (
          <span key={i} className="ch-mote" style={moteStyle(i)} />
        ))}
      </div>
      <div className="ch-grain" aria-hidden />
      <AmbientCursor />
    </>
  );
}
