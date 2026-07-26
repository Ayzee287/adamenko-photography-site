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
  it("declares a light colour scheme so dark-mode clients do not invert the palette", () => {
    for (const m of both()) {
      expect(m.html).toContain('name="color-scheme" content="light"');
      expect(m.html).toContain('name="supported-color-schemes" content="light"');
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
});

describe("accessibility", () => {
  it("uses the accessible clay for text and reserves the light clay for decoration", () => {
    // #b07159 is 3.64:1 on the cream card — below AA for normal text. It may draw a rule or
    // an underline, but must never BE the text.
    for (const m of both()) {
      // Anchored so it cannot match the tail of `text-decoration-color:`, which is a
      // legitimate decorative use of the light clay.
      expect(m.html).not.toMatch(/[;"']color:#b07159/);
    }
  });

  it("declares the document language of the copy it actually contains", () => {
    expect(buildVisitorConfirmation(base, "fr").html).toContain('<html lang="fr">');
    expect(buildVisitorConfirmation(base, "en").html).toContain('<html lang="en">');
    // the owner notification is always written in French
    expect(buildOwnerNotification(base).html).toContain('<html lang="fr">');
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
