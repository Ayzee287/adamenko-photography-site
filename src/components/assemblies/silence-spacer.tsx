// silence-spacer — the Silence as CONTENT (PBS: named spacers so breath is
// visible and countable): ≥30vh, floored at space/10 mb / space/11 dt
// (--size-silence). Placed ONLY where the law mandates: before first proof,
// around price, around a story peak.

export function SilenceSpacer() {
  return <div aria-hidden data-silence className="h-(--size-silence) w-full" />;
}
