// @vitest-environment jsdom
//
// Layout contracts (Roadmap P6): the base metadata builder (V1-mined), the
// preview-noindex gate, and the error page's voice + reset wiring.

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("buildBaseMetadata — the V1-mined scaffold", () => {
  it("carries brand title template, description, og locale per locale", async () => {
    const { buildBaseMetadata } = await import("../../src/lib/seo/metadata");
    const fr = buildBaseMetadata("fr");
    const en = buildBaseMetadata("en");

    expect((fr.title as { template: string }).template).toContain(
      "Adamenko Photography",
    );
    expect((fr.title as { default: string }).default).toBeTruthy();
    expect(fr.description).toBeTruthy();
    expect(fr.metadataBase).toBeInstanceOf(URL);
    expect(fr.openGraph?.locale).toBe("fr_FR");
    expect(en.openGraph?.locale).toBe("en_US");
  });

  it("non-production deploys are noindexed (belt-and-braces, V1 SEO5)", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const { buildBaseMetadata } = await import("../../src/lib/seo/metadata");
    expect(buildBaseMetadata("fr").robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("production deploys drop the meta noindex", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const { buildBaseMetadata } = await import("../../src/lib/seo/metadata");
    expect(buildBaseMetadata("fr").robots).toBeUndefined();
  });
});

describe("error.tsx — voice-compliant failure page", () => {
  async function renderError(pathname: string) {
    vi.doMock("next/navigation", () => ({ usePathname: () => pathname }));
    const { default: ErrorPage } = await import(
      "../../src/app/[locale]/error"
    );
    const reset = vi.fn();
    render(<ErrorPage error={new Error("boom")} reset={reset} />);
    return reset;
  }

  it("french at french paths, calm copy, retry wired to reset()", async () => {
    const reset = await renderError("/contact");
    expect(
      screen.getByText("Quelque chose n'a pas fonctionné."),
    ).toBeDefined();
    fireEvent.click(screen.getByText("Réessayer"));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("english under /en, home link resolves through the registry", async () => {
    await renderError("/en/galleries");
    expect(screen.getByText("Something didn't work.")).toBeDefined();
    const home = screen.getByText(/Back to home/).closest("a");
    expect(home?.getAttribute("href")).toBe("/en");
  });

  it("never blames the visitor and never shows raw error internals", async () => {
    await renderError("/contact");
    expect(document.body.textContent).not.toContain("boom");
    expect(document.body.textContent).toContain("c'est nous");
  });
});
