// @vitest-environment jsdom
//
// Primitive contracts (Roadmap P8): typography semantics + voices, actions,
// and the media law (ImageFrame everywhere, ratio-reserved boxes, lightbox
// keyed to the flat sequence, native-dialog behavior).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Kicker } from "../../src/components/typography/kicker";
import { HeadingGroup } from "../../src/components/typography/heading-group";
import { RichText } from "../../src/components/typography/rich-text";
import { Quote } from "../../src/components/typography/quote";
import { Metadata } from "../../src/components/typography/metadata";
import { RatingLine } from "../../src/components/typography/rating-line";
import { TextLink } from "../../src/components/actions/text-link";
import { ImageFrame } from "../../src/components/media/image-frame";
import { GalleryPair } from "../../src/components/media/gallery-pair";
import { GalleryGrid } from "../../src/components/media/gallery-grid";
import { Lightbox, type LightboxLabels } from "../../src/components/media/lightbox";

afterEach(() => cleanup());

const lightboxLabels: LightboxLabels & { enlarge: string } = {
  enlarge: "Agrandir",
  dialog: "Aperçu de la photographie",
  close: "Fermer",
  closeLabel: "Fermer ✕",
  prevPhoto: "Photographie précédente",
  nextPhoto: "Photographie suivante",
  photograph: "Photographie",
  of: "sur",
};

describe("typography primitives", () => {
  it("kicker renders a paragraph (never a heading) with tone classes", () => {
    render(<Kicker tone="bronze">Investissement</Kicker>);
    const el = screen.getByText("Investissement");
    expect(el.tagName).toBe("P");
    expect(el.className).toContain("text-bronze");
  });

  it("heading-group maps levels to h1/h2/h3 and gaps to space tokens", () => {
    render(
      <HeadingGroup
        level="display"
        kicker="Photographe · Lyon"
        heading="Des photos qui vous ressemblent."
        support="Familles, couples, grossesse."
      />,
    );
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.className).toContain("text-display");
    expect(h1.className).toContain("mt-3"); // kicker→heading space/3
    const support = screen.getByText("Familles, couples, grossesse.");
    expect(support.className).toContain("mt-4"); // heading→support space/4
  });

  it("heading-group h3 without kicker/support renders bare", () => {
    render(<HeadingGroup level="h3" heading="Grossesse" />);
    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3.className).not.toContain("mt-3");
    expect(screen.queryByText("text-kicker")).toBeNull();
  });

  it("rich-text owns paragraph rhythm per voice (space/5 letter, space/4 body)", () => {
    const { container: letter } = render(
      <RichText voice="body-letter" paragraphs={["Un.", "Deux."]} />,
    );
    expect(letter.firstElementChild?.className).toContain("gap-5");
    expect(letter.querySelectorAll("p")).toHaveLength(2);
    cleanup();
    const { container: body } = render(<RichText paragraphs={["Fait."]} />);
    expect(body.firstElementChild?.className).toContain("gap-4");
  });

  it("quote uses blockquote + cite semantics", () => {
    render(<Quote attribution="Taïna F">Sublimes.</Quote>);
    expect(screen.getByText("Sublimes.").closest("blockquote")).not.toBeNull();
    expect(screen.getByText("Taïna F").tagName).toBe("CITE");
  });

  it("metadata joins segments with n−1 interpuncts", () => {
    const { container } = render(
      <Metadata segments={["Automne 2026", "Lyon", "Famille"]} />,
    );
    expect(container.textContent?.match(/·/g)).toHaveLength(2);
  });

  it("rating-line formats fr rating with a comma and fills the template", () => {
    render(
      <RatingLine
        rating={5}
        count={5}
        href="https://maps.google.com/x"
        summary="Note Google {rating} / 5 · d'après {count} avis"
        linkLabel="Voir tous les avis sur Google"
        locale="fr"
      />,
    );
    expect(screen.getByText(/Note Google 5,0 \/ 5/)).toBeDefined();
    const link = screen.getByText("Voir tous les avis sur Google").closest("a");
    expect(link?.getAttribute("target")).toBe("_blank");
  });
});

describe("text-link", () => {
  it("internal href renders a Next link; mailto renders a plain anchor", () => {
    render(<TextLink href="/galeries">Galeries</TextLink>);
    expect(screen.getByText("Galeries").closest("a")?.getAttribute("target")).toBeNull();
    render(<TextLink href="mailto:x@y.z">Écrire</TextLink>);
    const mail = screen.getByText("Écrire").closest("a");
    expect(mail?.getAttribute("href")).toBe("mailto:x@y.z");
    expect(mail?.getAttribute("target")).toBeNull();
  });

  it("https hrefs open in a new tab with rel protection; arrow is aria-hidden", () => {
    render(
      <TextLink href="https://example.com" showArrow>
        Externe
      </TextLink>,
    );
    const a = screen.getByText("Externe").closest("a")!;
    expect(a.getAttribute("rel")).toContain("noreferrer");
    expect(a.querySelector("[aria-hidden]")?.textContent).toBe("→");
  });
});

describe("image-frame — the media law", () => {
  it("reserves its ratio box (CLS structurally impossible)", () => {
    const { container } = render(
      <ImageFrame src="/galleries/couples/couples-01.jpg" alt="Un couple." ratio="4:5" />,
    );
    expect(container.querySelector(".aspect-4\\/5")).not.toBeNull();
    expect(container.querySelector("figure")).not.toBeNull();
  });

  it("caption and story link are optional slots in order", () => {
    render(
      <ImageFrame
        src="/galleries/couples/couples-01.jpg"
        alt="Un couple."
        ratio="3:2"
        caption="Lumière chaude."
        storyLink={{ href: "/seances", label: "voir cette séance" }}
      />,
    );
    expect(screen.getByText("Lumière chaude.").tagName).toBe("FIGCAPTION");
    expect(screen.getByText("voir cette séance").closest("a")?.getAttribute("href")).toBe(
      "/seances",
    );
  });

  it("interactive=lightbox renders button semantics with the Agrandir label", () => {
    const onOpen = vi.fn();
    render(
      <ImageFrame
        src="/galleries/couples/couples-01.jpg"
        alt="Un couple complice."
        ratio="3:2"
        interactive="lightbox"
        enlargeLabel="Agrandir"
        onOpen={onOpen}
      />,
    );
    const btn = screen.getByRole("button", { name: "Agrandir : Un couple complice." });
    fireEvent.click(btn);
    expect(onOpen).toHaveBeenCalledOnce();
    // The alt lives on the button; the img inside must not duplicate it.
    expect(btn.querySelector("img")?.getAttribute("alt")).toBe("");
  });
});

describe("gallery-pair", () => {
  it("keeps edit order and applies the sanctioned offset (space/8)", () => {
    const { container } = render(
      <GalleryPair
        loud={{ src: "/galleries/couples/couples-01.jpg", alt: "A", ratio: "3:2" }}
        quiet={{ src: "/galleries/couples/couples-02.jpg", alt: "B", ratio: "4:5" }}
        offset
      />,
    );
    const imgs = [...container.querySelectorAll("img")].map((i) => i.getAttribute("alt"));
    expect(imgs).toEqual(["A", "B"]);
    expect(container.querySelector(".md\\:pt-8")).not.toBeNull();
  });
});

describe("gallery-grid + lightbox", () => {
  beforeEach(() => {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function () {
        this.setAttribute("open", "");
      };
      HTMLDialogElement.prototype.close = function () {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
      };
    }
  });

  const items = [
    {
      kind: "single" as const,
      image: { src: "/galleries/couples/couples-01.jpg", alt: "Un.", ratio: "3:2" as const },
    },
    {
      kind: "pair" as const,
      loud: { src: "/galleries/couples/couples-02.jpg", alt: "Deux.", ratio: "3:2" as const },
      quiet: { src: "/galleries/couples/couples-03.jpg", alt: "Trois.", ratio: "4:5" as const },
    },
  ];

  it("non-interactive renders no buttons and no dialog (server-shaped)", () => {
    const { container } = render(<GalleryGrid items={items} />);
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("interactive opens the lightbox at the FLAT index of the clicked frame", () => {
    render(<GalleryGrid items={items} interactive labels={lightboxLabels} />);
    fireEvent.click(screen.getByRole("button", { name: "Agrandir : Trois." }));
    const dialog = document.querySelector("dialog")!;
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(dialog.textContent).toContain("3");
    expect(dialog.textContent).toContain("/");
  });

  it("lightbox arrows wrap around and Escape path closes", () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();
    render(
      <Lightbox
        images={[
          { src: "/a.jpg", alt: "A" },
          { src: "/b.jpg", alt: "B", caption: "Légende." },
          { src: "/c.jpg", alt: "C" },
        ]}
        index={2}
        open
        onClose={onClose}
        onNavigate={onNavigate}
        labels={lightboxLabels}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Photographie suivante" }));
    expect(onNavigate).toHaveBeenCalledWith(0); // wraparound 3→1
    fireEvent.click(screen.getByRole("button", { name: "Photographie précédente" }));
    expect(onNavigate).toHaveBeenCalledWith(1);

    const dialog = document.querySelector("dialog")!;
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(onNavigate).toHaveBeenCalledWith(1);

    dialog.dispatchEvent(new Event("close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("single image hides the arrows; counter reads n / count with SR words", () => {
    render(
      <Lightbox
        images={[{ src: "/a.jpg", alt: "A" }]}
        index={0}
        open
        onClose={() => {}}
        onNavigate={() => {}}
        labels={lightboxLabels}
      />,
    );
    expect(screen.queryByRole("button", { name: "Photographie suivante" })).toBeNull();
    const dialog = document.querySelector("dialog")!;
    expect(dialog.getAttribute("aria-label")).toBe("Aperçu de la photographie");
    expect(dialog.textContent).toContain("Photographie");
    expect(dialog.textContent).toContain("sur");
  });
});
