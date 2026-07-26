// @vitest-environment jsdom
//
// Chrome contracts (Roadmap P7): frozen nav inventory/order/gating, active
// derivation, registry-only hrefs, dictionary labels, header reveal-on-focus
// (M4), native-dialog menu behavior, footer composition + landmarks.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let pathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  notFound: () => {
    throw new Error("notFound");
  },
}));

import { Navigation } from "../../src/components/chrome/navigation";
import { Header } from "../../src/components/chrome/header";
import { Footer } from "../../src/components/chrome/footer";
import { SkipLink } from "../../src/components/chrome/skip-link";
import { MenuDialog } from "../../src/components/chrome/menu-dialog";
import { refFromPathname } from "../../src/lib/routes";

afterEach(() => cleanup());

const navLabels = { primary: "Navigation principale", language: "Choix de la langue" };
const chrome = {
  brand: "Adamenko Photography",
  primary: "Navigation principale",
  language: "Choix de la langue",
  menu: "Menu",
  openMenu: "Ouvrir le menu",
  closeMenu: "Fermer le menu",
  contactCta: "Travaillons ensemble",
  instagram: "Instagram",
  facebook: "Facebook",
};
const socials = { instagram: "https://instagram.com/x", facebook: "https://facebook.com/x" };

/* ── refFromPathname — the reverse lookup behind the language switch ── */

describe("refFromPathname", () => {
  it("matches FR paths, EN fr-shaped paths (pre-P14) and EN aliases (post-P14)", () => {
    expect(refFromPathname("/")).toEqual({ page: "home" });
    expect(refFromPathname("/en")).toEqual({ page: "home" });
    expect(refFromPathname("/tarifs")).toEqual({ page: "tarifs" });
    expect(refFromPathname("/fr/tarifs")).toEqual({ page: "tarifs" }); // proxy-rewritten form (usePathname reality)
    expect(refFromPathname("/en/tarifs")).toEqual({ page: "tarifs" });
    expect(refFromPathname("/en/pricing")).toEqual({ page: "tarifs" });
    expect(refFromPathname("/prestations/famille")).toEqual({
      page: "service",
      service: "famille",
    });
    expect(refFromPathname("/en/services/family")).toEqual({
      page: "service",
      service: "famille",
    });
    expect(refFromPathname("/en/galleries/weddings")).toEqual({
      page: "genre",
      genre: "mariages",
    });
    expect(refFromPathname("/seances/camille")).toEqual({
      page: "story",
      slug: "camille",
    });
    expect(refFromPathname("/nimporte-quoi")).toBeNull();
  });
});

/* ── Navigation ── */

describe("Navigation", () => {
  beforeEach(() => {
    pathname = "/galeries";
  });

  it("renders the frozen inventory in frozen order, Séances gated off", () => {
    render(<Navigation locale="fr" showSeances={false} labels={navLabels} />);
    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    const items = [...nav.querySelectorAll("a")].map((a) => a.textContent);
    // "Prestations" was removed from the nav (D095) — /tarifs is the single offer+cost hub;
    // per-service pages live on only as SEO landing pages, reached from Tarifs.
    expect(items.slice(0, 4)).toEqual(["Galeries", "Tarifs", "À propos", "Contact"]);
    expect(items).not.toContain("Prestations");
    expect(items).not.toContain("Séances");
  });

  it("shows Séances when the gate opens", () => {
    render(<Navigation locale="fr" showSeances={true} labels={navLabels} />);
    expect(screen.getByText("Séances")).toBeDefined();
  });

  it("active item carries aria-current and derives from the pathname", () => {
    render(<Navigation locale="fr" showSeances={false} labels={navLabels} />);
    expect(screen.getByText("Galeries").getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("Contact").getAttribute("aria-current")).toBeNull();
  });

  it("language switch preserves the page via alternates (final public EN path)", () => {
    pathname = "/tarifs";
    render(<Navigation locale="fr" showSeances={false} labels={navLabels} />);
    expect(screen.getByText("EN").getAttribute("href")).toBe("/en/pricing");
    expect(screen.getByText("FR").getAttribute("href")).toBe("/tarifs");
  });

  it("every href resolves through the registry (EN labels under en)", () => {
    pathname = "/en/galeries";
    render(<Navigation locale="en" showSeances={false} labels={navLabels} />);
    expect(screen.getByText("Pricing").getAttribute("href")).toBe("/en/pricing");
    expect(screen.getByText("Galleries").getAttribute("href")).toBe("/en/galleries");
  });
});

/* ── Header ── */

describe("Header", () => {
  beforeEach(() => {
    pathname = "/";
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("renders banner, wordmark home link, menu trigger with dialog wiring", () => {
    render(
      <Header locale="fr" showSeances={false} chrome={chrome} socials={socials} />,
    );
    expect(screen.getByRole("banner")).toBeDefined();
    const wordmark = screen.getByText("Adamenko Photography", { selector: "a" });
    expect(wordmark.getAttribute("href")).toBe("/");
    const trigger = screen.getByRole("button", { name: "Ouvrir le menu" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-controls")).toBe("menu-dialog");
  });

  it("gains the scrolled state once the visitor leaves the top (frosted fill settles in)", () => {
    // CHAMBRE's header is a floating overlay that never hides — it does not translate away
    // on scroll (the old V1/M4 hide-on-scroll was retired). At the very top it floats on the
    // scrim; past a small threshold it gains `is-scrolled` so the frosted fill fades in.
    render(
      <Header locale="fr" showSeances={false} chrome={chrome} socials={socials} />,
    );
    const banner = screen.getByRole("banner");
    expect(banner.className).toContain("ch-nav");
    expect(banner.className).not.toContain("is-scrolled");

    Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
    fireEvent.scroll(window);
    expect(banner.className).toContain("is-scrolled");
  });

  it("is the floating overlay treatment (ch-nav) — CHAMBRE is uniformly dark, no tone switch", () => {
    render(
      <Header
        locale="fr"
        tone="overlay"
        showSeances={false}
        chrome={chrome}
        socials={socials}
      />,
    );
    // `tone` is retained for API stability; the bar is always the ch-nav overlay (scrim + fill),
    // never a paper/surface-dark switch.
    expect(screen.getByRole("banner").className).toContain("ch-nav");
  });
});

/* ── MenuDialog ── */

describe("MenuDialog", () => {
  beforeEach(() => {
    pathname = "/";
    // jsdom's <dialog> may lack showModal — provide the minimal contract.
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

  it("opens as a native dialog, locks body scroll, closes via the labeled button", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <MenuDialog
        open={false}
        onClose={onClose}
        locale="fr"
        showSeances={false}
        labels={chrome}
        socials={socials}
      />,
    );
    expect(document.body.style.overflow).toBe("");

    rerender(
      <MenuDialog
        open={true}
        onClose={onClose}
        locale="fr"
        showSeances={false}
        labels={chrome}
        socials={socials}
      />,
    );
    expect(document.querySelector("dialog")?.hasAttribute("open")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Fermer le menu" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("carries the frozen anatomy: serif nav items, contact pill, socials, FR·EN", () => {
    render(
      <MenuDialog
        open={true}
        onClose={() => {}}
        locale="fr"
        showSeances={false}
        labels={chrome}
        socials={socials}
      />,
    );
    const dialog = document.querySelector("dialog")!;
    expect(dialog.querySelectorAll("nav a")).toHaveLength(4); // gated inventory (Prestations removed, D095)
    expect(screen.getByText("Travaillons ensemble").closest("a")?.getAttribute("href")).toBe(
      "/contact",
    );
    expect(screen.getByLabelText("Instagram")).toBeDefined();
    expect(screen.getByLabelText("Facebook")).toBeDefined();
    expect(screen.getByText("EN").getAttribute("href")).toBe("/en");
  });
});

/* ── Footer + SkipLink ── */

describe("Footer", () => {
  it("contentinfo with ruled composition: identity, pages, suivre, legal", () => {
    render(<Footer showSeances={false} />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.textContent).toContain("Adamenko Photography");
    // Identity line = the dictionary tagline. Lyon reads as an identity/SEO signal here (the one
    // surface the charter keeps it on), not the old "Photographe à Lyon" stamp.
    expect(footer.textContent).toContain("Lyon");
    const pages = screen.getByRole("navigation", { name: "Pied de page" });
    expect(pages.querySelectorAll("a")).toHaveLength(4); // Prestations removed from nav (D095)
    const legal = screen.getByRole("navigation", { name: "Liens légaux" });
    const legalHrefs = [...legal.querySelectorAll("a")].map((a) =>
      a.getAttribute("href"),
    );
    expect(legalHrefs).toEqual(["/mentions-legales", "/confidentialite"]);
    // Instagram · Facebook · Email are ONE contact group of icon-only controls. The address
    // is deliberately not printed here (it split the group in two and read as a caption);
    // it still lives on the contact page. Icon-only means the accessible name is load-bearing,
    // so each control is found BY that name, not by a visible string.
    const email = screen.getByRole("link", { name: "Envoyer un e-mail" });
    expect(email.getAttribute("href")).toBe("mailto:adamenkoiu@gmail.com");
    // a mailto hands off to a mail client — a new tab would strand a blank window
    expect(email.getAttribute("target")).toBeNull();
    expect(footer.textContent).not.toContain("adamenkoiu@gmail.com");
    for (const name of ["Instagram", "Facebook"]) {
      expect(screen.getByRole("link", { name })).toBeTruthy();
    }
  });
});

describe("SkipLink", () => {
  it("targets #main with the dictionary label, hidden until focus", () => {
    render(<SkipLink />);
    const link = screen.getByText("Aller au contenu");
    expect(link.getAttribute("href")).toBe("#main");
    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
  });
});
