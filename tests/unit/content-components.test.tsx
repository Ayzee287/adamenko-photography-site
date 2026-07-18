// @vitest-environment jsdom
//
// Content-component contracts (Roadmap P9): composition-only assembly of the
// P8 primitives, frozen anatomies, conditional slots absent-clean (∅ law).

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Hero } from "../../src/components/content/hero";
import { Door } from "../../src/components/content/door";
import { StoryPreview } from "../../src/components/content/story-preview";
import { ReviewCard } from "../../src/components/content/review-card";
import { ReviewGroup } from "../../src/components/content/review-group";
import { PricingBlock } from "../../src/components/content/pricing-block";
import { Availability } from "../../src/components/content/availability";
import { FaqItem } from "../../src/components/content/faq-item";
import { ContactReassurance } from "../../src/components/content/contact-reassurance";

afterEach(() => cleanup());

describe("hero", () => {
  it("paper mode: h1 without image; support optional", () => {
    const { container } = render(
      <Hero media="paper" kicker="Prendre contact" heading="Contact" />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Contact");
    expect(container.querySelector("img")).toBeNull();
  });

  it("image mode: priority LCP + surface-dark overlay; skeleton auto-scrims and links", () => {
    const { container } = render(
      <Hero
        media="image"
        image={{ src: "/home/hero.jpg", alt: "Des mariés." }}
        kicker="Photographe · Lyon"
        heading="Vous attendez un enfant."
        skeleton={{
          facts: ["Séance grossesse à Lyon", "1–2 h"],
          link: { href: "/tarifs", label: "tout savoir" },
        }}
      />,
    );
    expect(container.querySelector("img")).not.toBeNull();
    expect(container.querySelector(".surface-dark")).not.toBeNull();
    expect(container.querySelector(".scrim-opening")).not.toBeNull(); // M5: skeleton ⇒ scrim
    const link = screen.getByText("tout savoir").closest("a");
    expect(link?.getAttribute("href")).toBe("/tarifs");
    expect(screen.getByText("Séance grossesse à Lyon")).toBeDefined();
  });

  it("image mode without skeleton has no scrim by default", () => {
    const { container } = render(
      <Hero
        media="image"
        image={{ src: "/home/hero.jpg", alt: "Des mariés." }}
        heading="Des photos qui vous ressemblent."
      />,
    );
    expect(container.querySelector(".scrim-opening")).toBeNull();
  });
});

describe("door + story-preview", () => {
  it("door is ONE link containing image, h3 noun, serif line, optional fact", () => {
    render(
      <Door
        href="/prestations/grossesse"
        image={{ src: "/g.jpg", alt: "Future maman.", ratio: "4:5" }}
        noun="Grossesse"
        line="Les semaines douces."
        fact="à partir de 290 €"
      />,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/prestations/grossesse");
    expect(link.querySelectorAll("a")).toHaveLength(0); // no nested links
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Grossesse");
    expect(screen.getByText("à partir de 290 €")).toBeDefined();
  });

  it("door without fact renders no secondary fact line (∅)", () => {
    render(
      <Door
        href="/galeries/familles"
        image={{ src: "/g.jpg", alt: "Famille.", ratio: "3:2" }}
        noun="Familles"
        line="Le quotidien et les liens."
      />,
    );
    expect(screen.queryByText(/à partir de/)).toBeNull();
  });

  it("story-preview: season kicker, title h3, ONE context line", () => {
    render(
      <StoryPreview
        href="/seances/camille"
        image={{ src: "/s.jpg", alt: "Une famille.", ratio: "3:2" }}
        season="Automne 2026"
        title="Le dernier dimanche calme."
        context="Camille, 34 semaines."
      />,
    );
    expect(screen.getByText("Automne 2026").className).toContain("text-kicker");
    expect(screen.getByRole("heading", { level: 3 }).textContent).toContain(
      "dimanche calme",
    );
  });
});

describe("review-card", () => {
  const long = Array.from({ length: 50 }, (_, i) => `mot${i}`).join(" ");

  it("truncates at 40 words and expands in place", () => {
    render(
      <ReviewCard text={long} name="Jane" date="juillet 2026" readMoreLabel="Lire la suite" />,
    );
    expect(screen.getByText(/mot39…/)).toBeDefined();
    fireEvent.click(screen.getByText("Lire la suite"));
    expect(screen.getByText(new RegExp("mot49"))).toBeDefined();
    expect(screen.queryByText("Lire la suite")).toBeNull();
  });

  it("original toggle swaps text and reports pressed state", () => {
    render(
      <ReviewCard
        text="Version française."
        original={{ text: "Оригинал отзыва.", toggleLabel: "Voir l'original" }}
        name="Алёна"
        date="juillet 2026"
        readMoreLabel="Lire la suite"
      />,
    );
    const toggle = screen.getByText("Voir l'original");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getByText("Оригинал отзыва.")).toBeDefined();
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
  });

  it("compact hides toggles; stars are decorative with one SR rating", () => {
    const { container } = render(
      <ReviewCard compact text={long} name="Laura" date="juin" readMoreLabel="Lire la suite" />,
    );
    expect(screen.queryByText("Lire la suite")).toBeNull();
    expect(container.querySelectorAll("svg[aria-hidden]")).toHaveLength(5);
    expect(screen.getByText("5 / 5").className).toContain("sr-only");
  });
});

describe("review-group", () => {
  const card = (k: string) => (
    <ReviewCard key={k} text={`Avis ${k}.`} name={k} date="2026" readMoreLabel="Lire" />
  );

  it("labeled region; snap-row classes only at ≥3; rating-line below", () => {
    const rating = {
      rating: 5,
      count: 5,
      href: "https://maps.google.com/x",
      summary: "Note Google {rating} / 5 · d'après {count} avis",
      linkLabel: "Voir tous les avis sur Google",
      locale: "fr" as const,
    };
    const { container } = render(
      <ReviewGroup regionLabel="Avis clients Google" rating={rating}>
        {[card("a"), card("b"), card("c")]}
      </ReviewGroup>,
    );
    expect(screen.getByRole("region", { name: "Avis clients Google" })).toBeDefined();
    expect(container.querySelector(".snap-x")).not.toBeNull();
    expect(screen.getByText(/Note Google 5,0/)).toBeDefined();
    cleanup();
    const { container: two } = render(
      <ReviewGroup regionLabel="Avis" showRating={false}>
        {[card("a"), card("b")]}
      </ReviewGroup>,
    );
    expect(two.querySelector(".snap-x")).toBeNull();
    expect(two.textContent).not.toContain("Note Google");
  });
});

describe("pricing-block", () => {
  it("h3 name, formatted price with NNBSP, hairline inclusion rows", () => {
    render(
      <PricingBlock
        name="Séance"
        priceIntro="à partir de"
        priceFrom={290}
        locale="fr"
        description="Famille, grossesse, couple ou portrait."
        inclusions={["1 à 2 heures", "Galerie privée", "Retouches HD"]}
      />,
    );
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Séance");
    expect(screen.getByText("290 €")).toBeDefined(); // U+202F
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});

describe("availability + faq-item + contact-reassurance", () => {
  it("availability maps surface to the frozen roles", () => {
    render(<Availability sentence="Deux week-ends en octobre." surface="paper" />);
    expect(screen.getByText(/octobre/).className).toContain("text-small");
    cleanup();
    render(<Availability sentence="Deux week-ends en octobre." />);
    expect(screen.getByText(/octobre/).className).toContain("text-body");
  });

  it("faq-item: native details/summary with shared group name", () => {
    const { container } = render(
      <FaqItem group="faq" question="Comment réserver ?" answer="Écrivez-moi." />,
    );
    const details = container.querySelector("details")!;
    expect(details.getAttribute("name")).toBe("faq");
    expect(container.querySelector("summary")?.textContent).toContain(
      "Comment réserver ?",
    );
  });

  it("contact-reassurance: complementary, 3 ordered steps, ∅ slots clean", () => {
    render(
      <ContactReassurance
        heading="Ce qui se passe ensuite"
        steps={["Une réponse sous 48 h.", "Un échange.", "Une proposition."]}
        promise="Je réponds sous 48 h."
      />,
    );
    expect(screen.getByRole("complementary")).toBeDefined();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByText(/octobre/)).toBeNull();
  });
});
