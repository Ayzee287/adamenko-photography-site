"use client";

// Dev-only behavioral proof for the two Phase 5 hooks (Roadmap P5 acceptance:
// "hooks demo page proves once-only reveal and reduced-motion bypass").

import { useReveal } from "@/hooks/use-reveal";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

function RevealBox({ n }: { n: number }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`border border-hairline p-6 ${revealed ? "bg-paper-deep" : "bg-paper"}`}
    >
      <p className="text-body">
        box {n} — {revealed ? "revealed (permanent: scroll back up, it stays)" : "waiting for viewport…"}
      </p>
    </div>
  );
}

export function HooksDemo() {
  const { hidden, reveal } = useScrollDirection();
  return (
    <div className="p-8">
      <div className="border border-hairline p-4 bg-paper">
        <p className="text-body">
          header state: <strong>{hidden ? "hidden" : "visible"}</strong> — scroll
          down &gt;120px to hide, up ≥8px to reveal
        </p>
        <button type="button" className="text-button underline" onClick={reveal}>
          reveal() (the focus-entry path, M4)
        </button>
      </div>

      <p className="text-body-letter mt-8">
        Scroll down — each box settles once, on first viewport entry, and never
        un-reveals. Under prefers-reduced-motion every box is revealed
        immediately.
      </p>

      <div className="mt-8 flex flex-col gap-11">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <RevealBox key={n} n={n} />
        ))}
      </div>
    </div>
  );
}
