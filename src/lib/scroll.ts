// One scroll subscription for the whole page. Parallax / hero-scale consumers
// register here rather than each adding their own listener — a single passive
// listener + one rAF batch keeps scroll work cheap and throttled in one place.

type Sub = () => void;

const subs = new Set<Sub>();
let ticking = false;
let y = 0;

function flush() {
  ticking = false;
  for (const fn of subs) fn();
}

function onScroll() {
  y = window.scrollY;
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(flush);
  }
}

/** Subscribe to scroll/resize; the callback runs once immediately. Returns an unsubscribe. */
export function subscribeScroll(fn: Sub): () => void {
  if (subs.size === 0) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }
  subs.add(fn);
  y = window.scrollY;
  fn();
  return () => {
    subs.delete(fn);
    if (subs.size === 0) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  };
}

/** Last sampled scrollY (updated by the shared listener). */
export function getScrollY(): number {
  return y;
}
