// The two transactional emails. These are the only messages the business sends, they are
// assembled from untrusted form input, and they are impossible to spot-check once live —
// so the contract is asserted rather than eyeballed.

import { describe, expect, it } from "vitest";
import { buildOwnerNotification, buildVisitorConfirmation } from "@/lib/email/templates";
import type { ValidContact } from "@/lib/contact";

const base: ValidContact = {
  name: "Camille Durand",
  email: "camille@example.com",
  occasion: "Mariage",
  message: "Bonjour,\nNous nous marions en juin.\nMerci !",
};

const both = () => [
  buildOwnerNotification(base),
  buildVisitorConfirmation(base, "fr"),
  buildVisitorConfirmation(base, "en"),
];

describe("every message is deliverable", () => {
  it("carries a subject, a plain-text part and an HTML part", () => {
    for (const m of both()) {
      expect(m.subject.trim().length).toBeGreaterThan(0);
      expect(m.text.trim().length).toBeGreaterThan(0);
      expect(m.html).toMatch(/^<!DOCTYPE html>/);
    }
  });

  it("keeps the plain-text part genuinely readable, not a stripped-tag fallback", () => {
    // A text part that still contains markup is the classic sign it was generated from the
    // HTML rather than written — it is what a plain-text-only client actually shows.
    for (const m of both()) {
      expect(m.text).not.toMatch(/<[a-z/]/i);
      expect(m.text).not.toContain("&nbsp;");
      expect(m.text).toContain("Adamenko Photography");
    }
    // the owner must be able to act on the inquiry from text alone
    const owner = buildOwnerNotification(base);
    expect(owner.text).toContain(base.email);
    expect(owner.text).toContain("Nous nous marions en juin.");
  });
});

describe("untrusted input cannot escape its slot", () => {
  const hostile: ValidContact = {
    name: '<script>alert(1)</script> "Bobby" & co',
    email: "x@example.com",
    occasion: "Mariage",
    message: "<img src=x onerror=alert(2)> & <b>bold</b>",
  };

  it("escapes markup in the HTML body", () => {
    const html = buildOwnerNotification(hostile).html;
    // The invariant is that no user value can OPEN A TAG. The escaped text may still read
    // "onerror=" — as literal words inside a text node, which is inert and correct.
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img");
    expect(html).toContain("&amp;");
  });

  it("strips control characters from anything that reaches a header", () => {
    // A raw CR/LF in a subject is how a header injection starts.
    const injected = buildOwnerNotification({
      ...base,
      name: "Eve\r\nBcc: attacker@example.com",
    });
    // The line break IS the attack: without CR/LF the text cannot begin a new header, so
    // "Bcc:" surviving as literal words in the subject line is inert and expected.
    expect(injected.subject).not.toMatch(/[\r\n]/);
    expect(injected.subject).toContain("Eve Bcc:"); // collapsed to one line, not two headers
    // No control character of any kind survives. Asserted by CHAR CODE rather than a regex
    // range: writing that range as literal bytes is what turned this file into a binary blob.
    expect([...injected.subject].some((c) => c.charCodeAt(0) < 32)).toBe(false);
  });
});

describe("rendering across mail clients", () => {
  it("declares a dark colour scheme so dark-mode clients do not invert the palette", () => {
    // These messages are DESIGNED dark (CHAMBRE, the live site's art direction). A client
    // that is not told so will "helpfully" invert them into an unreadable hybrid.
    for (const m of both()) {
      expect(m.html).toContain('name="color-scheme" content="dark"');
      expect(m.html).toContain('name="supported-color-schemes" content="dark"');
    }
  });

  it("gives Outlook a ghost table and bgcolor attributes to hold the design", () => {
    for (const m of both()) {
      // Word-engine Outlook ignores max-width: without this the card spans the window.
      expect(m.html).toContain("<!--[if mso]><table");
      expect(m.html).toContain("<![endif]-->");
      // …and it ignores background-color on anything but a bgcolor attribute, which on a
      // dark design is the difference between the type being legible and being invisible.
      expect(m.html).toMatch(/bgcolor="#0a0908"/i);
      expect(m.html).toMatch(/bgcolor="#0e0c0b"/i);
    }
  });

  it("lays out with presentation tables and inline styles only", () => {
    for (const m of both()) {
      expect(m.html).toContain('role="presentation"');
      // <style> blocks and classes are stripped by Gmail/Outlook; nothing may depend on them
      expect(m.html).not.toMatch(/<style[\s>]/i);
      expect(m.html).not.toMatch(/\sclass=/);
      // CSS custom properties do not resolve in email
      expect(m.html).not.toContain("var(--");
    }
  });

  it("opens with a preheader so the inbox preview is not the brand line", () => {
    for (const m of both()) expect(m.html).toMatch(/mso-hide:all/);
  });

  it("lets a long unbroken word break instead of widening the card", () => {
    // A visitor pasting a URL with no hyphens, or a long hashtag, gives the renderer no
    // break opportunity. Measured before this was set: a 62-character word pushed the
    // layout viewport from 360px to 607px, so the card no longer fitted a phone.
    const html = buildOwnerNotification({
      ...base,
      message: "Voici: " + "a".repeat(80),
    }).html;
    const quote = html.match(/<div style="border-left[^"]*"/)?.[0] ?? "";
    expect(quote, "message block must allow breaking").toMatch(/overflow-wrap:\s*anywhere/);
    // word-wrap is the legacy spelling Outlook honours; both are required for coverage
    expect(quote).toMatch(/word-wrap:\s*break-word/);
  });
});

describe("the art direction is the live site's", () => {
  // CHAMBRE, read off body:has([data-chambre]) + :root in src/styles/chambre.css.
  const CHAMBRE = {
    page: "#0a0908",
    card: "#0e0c0b",
    bone: "#ede6da",
    ash: "#8b837a",
    ember: "#c86b3c",
  };

  it("paints with the site's tokens", () => {
    for (const m of both()) {
      for (const [name, hex] of Object.entries(CHAMBRE)) {
        expect(m.html.toLowerCase(), `${name} (${hex}) must appear`).toContain(hex);
      }
    }
  });

  it("keeps no colour from the retired V1 palette", () => {
    // These emails used to mirror globals.css — a stylesheet tokens.css marks inert
    // ("V1's globals.css/motion.css are inert (superseded, unimported)"). A single one of
    // these hexes surviving is the whole bug this redesign fixed.
    const V1 = ["#faf6f0", "#f3ece1", "#2a2420", "#6f655c", "#e7ddd0", "#b07159", "#96543d"];
    for (const m of both()) {
      for (const hex of V1) {
        expect(m.html.toLowerCase(), `${hex} is V1 and must not survive`).not.toContain(hex);
      }
    }
  });
});

describe("accessibility", () => {
  /** WCAG 2.x relative luminance + contrast ratio, so the claim is measured, not asserted. */
  const contrast = (a: string, b: string) => {
    const lum = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
    };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi! + 0.05) / (lo! + 0.05);
  };

  it("reads at AA or better for every colour it sets type in", () => {
    const card = "#0e0c0b";
    // Bone body, ash secondary, and the ember — which on obsidian is 5.2:1 and may
    // therefore carry text, unlike V1's clay (3.64:1 on cream, which is why that design
    // needed a separate darkened variant for anything readable).
    expect(contrast("#ede6da", card)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#8b837a", card)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#c86b3c", card)).toBeGreaterThanOrEqual(4.5);
  });

  it("never sets type in the disabled token", () => {
    // --content-disabled is 2.03:1 here. It exists for rules and edges, never for reading.
    for (const m of both()) expect(m.html.toLowerCase()).not.toMatch(/color:#4a443e/);
  });

  it("declares the document language of the copy it actually contains", () => {
    expect(buildVisitorConfirmation(base, "fr").html).toContain('<html lang="fr">');
    expect(buildVisitorConfirmation(base, "en").html).toContain('<html lang="en">');
    // the owner notification is always written in French
    expect(buildOwnerNotification(base).html).toContain('<html lang="fr">');
  });
});

describe("links and calls to action", () => {
  it("never ships a localhost or otherwise dead link", () => {
    // NEXT_PUBLIC_SITE_URL is unset under test, exactly as it is on a machine with no
    // deployment config. A transactional email must drop the link rather than send one
    // that resolves to the recipient's own machine.
    for (const m of both()) {
      expect(m.html).not.toMatch(/localhost|127\.0\.0\.1/);
      expect(m.text).not.toMatch(/localhost|127\.0\.0\.1/);
    }
  });

  it("keeps the reply CTA short enough to stay a button", () => {
    // Mono, uppercase and letterspaced at the site's CTA scale: the full name blew the
    // control apart onto three lines. The first word is what someone is called.
    const html = buildOwnerNotification({
      ...base,
      name: 'Jean-Éric <script>alert(1)</script> "Bob" & fils',
    }).html;
    const label = html.match(/>Répondre à ([^&<]*)/)?.[1] ?? "";
    expect(label.trim()).toBe("Jean-Éric");
  });

  it("points the reply CTA at the visitor, and the visitor CTA nowhere unsafe", () => {
    expect(buildOwnerNotification(base).html).toContain(`mailto:${base.email}`);
  });
});

describe("the inbox preview earns its line", () => {
  it("does not simply restate the subject", () => {
    for (const m of both()) {
      const preheader = m.html.match(/mso-hide:all;">([^<]*)</)?.[1] ?? "";
      const strip = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();
      expect(strip(preheader).length).toBeGreaterThan(0);
      expect(strip(preheader)).not.toBe(strip(m.subject));
    }
  });

  it("shows the owner what the inquiry actually says", () => {
    // Her subject already carries the name and the occasion; the preview line is the only
    // place the message itself can appear before she opens it.
    const m = buildOwnerNotification(base);
    const preheader = m.html.match(/mso-hide:all;">([^<]*)</)?.[1] ?? "";
    expect(preheader).toContain("Nous nous marions en juin");
  });
});

describe("the visitor confirmation is written, not translated", () => {
  it("says different words in each locale rather than the same string twice", () => {
    const fr = buildVisitorConfirmation(base, "fr");
    const en = buildVisitorConfirmation(base, "en");
    expect(fr.subject).not.toBe(en.subject);
    expect(fr.text).not.toBe(en.text);
    expect(fr.text).toContain("Bonjour Camille Durand");
    expect(en.text).toContain("Hello Camille Durand");
  });

  it("names the sender and explains why the message arrived", () => {
    for (const locale of ["fr", "en"] as const) {
      const m = buildVisitorConfirmation(base, locale);
      expect(m.text).toContain("Irina");
      expect(m.text.toLowerCase()).toMatch(/formulaire|contact form/);
    }
  });
});
