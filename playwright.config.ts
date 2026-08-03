import { defineConfig, devices } from "@playwright/test";

// E2E harness (Frontend Architecture §16): three frozen viewports — the same
// widths the Figma pages are designed at. Runs against the production build
// (`next start`), never the dev server, so what's tested is what ships.

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // ONE worker on CI. Not a slow-test workaround — it removes a real resource conflict.
  //
  // The three projects are three viewports, and a viewport is exactly what decides which
  // image widths a page asks for (`sizes` differs per breakpoint). So two projects running
  // concurrently do not share a single optimised image: they make `next start` encode two
  // independent width-sets of the same photographs, with sharp, at the same time. On a
  // 2-core GitHub runner against a story page carrying 20–43 frames, that saturates both
  // cores and the server stops answering — a `domcontentloaded` navigation, which is only
  // the HTML, times out at 30s.
  //
  // Observed exactly that way: runs #51 and #53 failed with every failure on `tb-768`, the
  // project scheduled alongside `dt-1440`, while `mb-390` (running later, mostly alone)
  // passed; `four-categories.spec.ts:72` took 5.8s on dt-1440 and >30s on tb-768 in the SAME
  // run; and run #53's application code was byte-identical to run #52, which passed — the
  // only difference between them was four markdown files under `docs/`.
  //
  // Retries stayed on and did not help, because contention lasts longer than a retry.
  // Local runs never saw it: more cores, no starvation.
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "dt-1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "tb-768",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "mb-390",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
