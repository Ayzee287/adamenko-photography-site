// @vitest-environment jsdom
//
// Assembly contracts (Roadmap P11): compositions only — the frozen orders,
// the adjacency law made structural, the dark scope, and the Silence.

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CloseBand } from "../../src/components/assemblies/close-band";
import { PriceChapter } from "../../src/components/assemblies/price-chapter";
import { Arc } from "../../src/components/assemblies/arc";
import { CrossLinks } from "../../src/components/assemblies/cross-links";
import { SilenceSpacer } from "../../src/components/assemblies/silence-spacer";
import { PricingBlock } from "../../src/components/content/pricing-block";

afterEach(() => cleanup());

describe("close-band", () => {
  it("rides the surface-dark scope, left-aligned, frozen anatomy in order", () => {
    const { container } = render(
      <CloseBand
        kicker="Contact"
        heading="Travaillons ensemble."
        cta={{ href: "/contact", label: "Écrivez-moi" }}
        promise="Je réponds sous 48 h."
        availability="Il reste deux week-ends en octobre."
      />,
    );
    const section = container.querySelector("section")!;
    expect(section.className).toContain("surface-dark");
    expect(section.className).not.toContain("text-center");
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Travaillons ensemble.",
    );
    expect(screen.getByText("Écrivez-moi").closest("a")?.getAttribute("href")).toBe(
      "/contact",
    );
    expect(screen.getByText(/48 h/)).toBeDefined();
    expect(screen.getByText(/octobre/)).toBeDefined();
  });

  it("availability absent-clean (∅)", () => {
    render(
      <CloseBand
        kicker="Contact"
        heading="Travaillons ensemble."
        cta={{ href: "/contact", label: "Écrivez-moi" }}
        promise="Je réponds sous 48 h."
      />,
    );
    expect(screen.queryByText(/octobre/)).toBeNull();
  });
});

describe("price-chapter — the adjacency law, structural", () => {
  const block = (
    <PricingBlock
      name="Séance"
      priceIntro="à partir de"
      priceFrom={290}
      locale="fr"
      description="Une séance."
      inclusions={["Galerie privée"]}
    />
  );
  const review = <p data-testid="review">Avis adjacent.</p>;

  it("frozen order: silence → heirloom → blocks → review(≤space/8) → silence", () => {
    const { container } = render(
      <PriceChapter heirloom="Des images faites pour durer." blocks={[block]} review={review} />,
    );
    const silences = container.querySelectorAll("[data-silence]");
    expect(silences).toHaveLength(2);
    const root = container.firstElementChild!;
    const order = [...root.children].map((c) =>
      c.hasAttribute("data-silence")
        ? "silence"
        : c.textContent?.includes("durer")
          ? "heirloom"
          : c.querySelector("[data-testid=review]")
            ? "review"
            : "blocks",
    );
    expect(order).toEqual(["silence", "heirloom", "blocks", "review", "silence"]);
    // The bond: review container is gap space/8 from the blocks (mt-8).
    expect(root.children[3].className).toContain("mt-8");
  });

  it("two blocks go 2-up at md (the tarifs layout)", () => {
    const { container } = render(
      <PriceChapter heirloom="Ligne." blocks={[block, block]} review={review} />,
    );
    expect(container.querySelector(".md\\:grid-cols-2")).not.toBeNull();
  });
});

describe("arc", () => {
  it("h2 + ordered beats with 01–04 numerals and h3 titles", () => {
    render(
      <Arc
        kicker="L'expérience"
        heading="Simple, du premier message aux images."
        beats={[
          { title: "On se rencontre", body: "On échange." },
          { title: "On prépare", body: "On cale tout." },
          { title: "La séance", body: "Je m'efface." },
          { title: "La livraison", body: "Une galerie privée." },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toBeDefined();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("01")).toBeDefined();
    expect(screen.getByText("04")).toBeDefined();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
  });
});

describe("cross-links + silence", () => {
  it("labeled nav of arrowed sibling links", () => {
    render(
      <CrossLinks
        ariaLabel="Séances proches"
        links={[
          { href: "/prestations/famille", label: "Famille" },
          { href: "/prestations/couple", label: "Couple" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Séances proches" });
    expect(nav.querySelectorAll("a")).toHaveLength(2);
  });

  it("silence-spacer: aria-hidden, token-sized, countable", () => {
    const { container } = render(<SilenceSpacer />);
    const el = container.firstElementChild!;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.className).toContain("h-(--size-silence)");
    expect(el.hasAttribute("data-silence")).toBe(true);
  });
});
