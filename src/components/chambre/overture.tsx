"use client";

// overture — the cold open: a black room, the ember pulsing, the wordmark exposing letter
// by letter, then the curtain lifts to the developed hero.
//
// HARD INVARIANT: the intro may be cinematic but it MUST NEVER trap the visitor. Its removal
// is owned entirely by THIS component's own timers — never by a CSS transitionend/animationend
// (which can be interrupted and never fire), never by image/hydration readiness, and never by a
// module flag that survives its own cleanup. The previous version gated scheduling on a
// module-level `played` flag: on a mount → cleanup → remount (React StrictMode double-invokes
// effects in dev; concurrent rendering can remount in prod) the second mount saw `played === true`,
// scheduled NOTHING, and left the overlay on screen with no way out. That is the reported lock.
//
// This version:
//   • schedules the teardown on EVERY mount (idempotent — StrictMode remount just reschedules);
//   • drives visibility from local state only, so a stale timer can never strand it;
//   • carries an independent FAILSAFE cap — whatever else happens, the overlay is gone by then;
//   • plays once per browsing SESSION (sessionStorage): a same-session refresh or SPA return to /
//     skips it, so repeat visitors are not made to wait every time; a brand-new session plays it.
// The teardown flag is written only as the curtain actually lifts, so StrictMode's throwaway first
// mount can't mark it "seen" and suppress the real play.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const SEEN_KEY = "ap:intro:v2";
const FAILSAFE_MS = 5000; // absolute backstop: the overlay cannot outlive this, ever

function sessionSeen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* private mode / disabled — the timers still tear the overlay down */
  }
}

export function Overture({ wordmark }: { wordmark: string }) {
  // Server + first client render agree on "in" (no sessionStorage on the server), so hydration
  // never mismatches; the effect decides within a frame whether to play or skip.
  const [phase, setPhase] = useState<"in" | "lift" | "gone">("in");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Genuine same-session repeat (refresh, or SPA nav back to /): don't replay. Deferred
    // into a microtask (runs before paint, so no flash) rather than set synchronously in the
    // effect body.
    if (sessionSeen()) {
      queueMicrotask(() => setPhase("gone"));
      return;
    }

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const hold = reduce ? 200 : 1650; // wordmark settles, then the curtain lifts
    const fade = reduce ? 200 : 850; // the lift itself

    const t1 = setTimeout(() => {
      markSeen(); // only now is the intro genuinely "played" for this session
      setPhase("lift");
    }, hold);
    const t2 = setTimeout(() => setPhase("gone"), hold + fade);
    // Independent safety net: even if t1/t2 were somehow lost, the overlay is gone by here.
    const failsafe = setTimeout(() => {
      markSeen();
      setPhase("gone");
    }, FAILSAFE_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(failsafe);
    };
  }, []);

  if (phase === "gone") return null;

  // Studio lockup: the name exposes letter by letter, then the studio line settles in.
  const [name, ...rest] = wordmark.split(" ");
  const studio = rest.join(" ");

  return (
    <div
      ref={ref}
      className={cn("ch-overture", phase === "lift" && "lift")}
      role="status"
      aria-label="Chargement"
    >
      <div>
        <span className="glow" aria-hidden />
        <div className="mark" aria-hidden>
          {name.split("").map((c, i) => (
            <span key={i} style={{ animationDelay: `${0.15 + i * 0.07}s` }}>
              {c}
            </span>
          ))}
        </div>
        {studio && (
          <div className="ch-overture-studio" aria-hidden>
            {studio}
          </div>
        )}
      </div>
    </div>
  );
}
