// @vitest-environment jsdom
//
// Hook contracts (Roadmap P5): the scroll reducer's exact thresholds
// (hide 120 / reveal 8 / always-visible near top / rubber-band clamp),
// reveal() as the focus path, and useReveal's once-only + reduced-motion +
// no-IO behaviors.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, renderHook, waitFor } from "@testing-library/react";

// No vitest globals → no RTL auto-cleanup: without this, revealed probes from
// earlier tests survive in the shared jsdom document and poison queries.
afterEach(() => cleanup());
import {
  HIDE_TRAVEL,
  REVEAL_TRAVEL,
  initialScrollState,
  reduceScroll,
  useScrollDirection,
} from "../../src/hooks/use-scroll-direction";
import { useReveal } from "../../src/hooks/use-reveal";

/* ── Pure reducer contract ── */

describe("reduceScroll — the header state machine", () => {
  const at = (y: number, state = initialScrollState) => reduceScroll(state, y);

  it("visible at the top and within the first 120px", () => {
    expect(at(0).hidden).toBe(false);
    expect(at(HIDE_TRAVEL).hidden).toBe(false);
  });

  it("hides only after 120px of downward travel beyond the top zone", () => {
    let s = at(100);
    s = reduceScroll(s, 180); // +80 down — not yet
    expect(s.hidden).toBe(false);
    s = reduceScroll(s, 260); // +80 more → 160 ≥ 120
    expect(s.hidden).toBe(true);
  });

  it("small downward drifts accumulate to a hide", () => {
    let s = at(130);
    for (let y = 140; s.hidden === false && y < 600; y += 10)
      s = reduceScroll(s, y);
    expect(s.hidden).toBe(true);
  });

  it("reveals on ≥8px upward intent, stays hidden below it", () => {
    let s = at(130);
    s = reduceScroll(s, 400); // hide
    expect(s.hidden).toBe(true);
    s = reduceScroll(s, 396); // −4: below threshold
    expect(s.hidden).toBe(true);
    s = reduceScroll(s, 390); // −6 more: 10 ≥ 8 → reveal
    expect(s.hidden).toBe(false);
  });

  it("returning to the top zone always reveals and resets travel", () => {
    let s = reduceScroll(at(130), 500);
    s = reduceScroll(s, 60);
    expect(s.hidden).toBe(false);
    expect(s.downTravel).toBe(0);
  });

  it("clamps iOS rubber-band negatives", () => {
    expect(at(-80).lastY).toBe(0);
    expect(at(-80).hidden).toBe(false);
  });

  it("thresholds are the frozen values", () => {
    expect(HIDE_TRAVEL).toBe(120);
    expect(REVEAL_TRAVEL).toBe(8);
  });
});

/* ── Hook wiring ── */

function setScrollY(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
}

describe("useScrollDirection — wiring", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    setScrollY(0);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("hides on deep downward scroll, reveals via reveal() (focus path, M4)", () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current.hidden).toBe(false);

    act(() => {
      setScrollY(200);
      window.dispatchEvent(new Event("scroll"));
      setScrollY(400);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current.hidden).toBe(true);

    act(() => result.current.reveal());
    expect(result.current.hidden).toBe(false);
  });
});

/* ── useReveal ── */

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

class MockIO {
  static instances: MockIO[] = [];
  cb: IOCallback;
  observed: Element[] = [];
  disconnected = false;
  constructor(cb: IOCallback) {
    this.cb = cb;
    MockIO.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
  unobserve() {}
}

describe("useReveal — once-only, reduced-motion, no-IO", () => {
  beforeEach(() => {
    MockIO.instances = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false }),
    );
    vi.stubGlobal("IntersectionObserver", MockIO);
  });
  afterEach(() => vi.unstubAllGlobals());

  // A real probe component: JSX attaches the ref BEFORE effects run — exactly
  // how consumers use the hook (a detached-ref harness never fires the effect).
  function Probe() {
    const { ref, revealed } = useReveal<HTMLDivElement>();
    return <div ref={ref} data-testid="probe" data-revealed={String(revealed)} />;
  }
  const revealed = () =>
    document.querySelector('[data-testid="probe"]')!.getAttribute("data-revealed");

  it("reveals on first intersection and NEVER un-reveals", async () => {
    render(<Probe />);
    expect(revealed()).toBe("false");
    const io = MockIO.instances.at(-1)!;

    act(() => io.cb([{ isIntersecting: true }]));
    await waitFor(() => expect(revealed()).toBe("true"));
    expect(io.disconnected).toBe(true);

    act(() => io.cb([{ isIntersecting: false }]));
    expect(revealed()).toBe("true"); // permanent
  });

  it("ignores non-intersecting entries", () => {
    render(<Probe />);
    const io = MockIO.instances.at(-1)!;
    act(() => io.cb([{ isIntersecting: false }]));
    expect(revealed()).toBe("false");
  });

  it("prefers-reduced-motion reveals immediately without an observer", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true }),
    );
    render(<Probe />);
    await waitFor(() => expect(revealed()).toBe("true"));
    expect(MockIO.instances).toHaveLength(0);
  });

  it("missing IntersectionObserver reveals immediately (content never hostage)", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Probe />);
    await waitFor(() => expect(revealed()).toBe("true"));
  });
});
