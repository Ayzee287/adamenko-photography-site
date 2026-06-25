// English translation DRAFT (2026-06-24) — PREPARED, NOT ACTIVATED.
//
// Why a separate `.draft.ts` and not `en.ts`?
//   The French content modules are declared `as const`, so every string is a LITERAL
//   type. A DeepPartial override in `en.ts` is therefore type-locked to the exact
//   French string and cannot carry a real translation. Activating English will widen
//   those literals (swap `as const` for `satisfies`, see docs/localization-roadmap.md);
//   until then this file holds the finished English so the work is ready to drop in
//   the moment the seam is opened. It is imported by NOTHING — zero runtime impact.
//
// Translation quality: idiomatic, not literal — same warm, plain, first-person voice
// as the French (brand-foundation §4). Banned clichés avoided ("capture memories",
// "timeless", "freeze moments"). These are DRAFTS over draft French copy: re-check
// once the French is final, then have a native English photographer-eye proof it.

export const enDraft = {
  site: {
    tagline:
      "Family, portrait, maternity, couple and wedding photographer — in Lyon and beyond.",
    nav: [
      { href: "/galeries", label: "Galleries" },
      { href: "/a-propos", label: "About" },
      { href: "/prestations", label: "Sessions" },
      { href: "/contact", label: "Contact" },
    ],
    legalNav: [
      { href: "/mentions-legales", label: "Legal notice" },
      { href: "/confidentialite", label: "Privacy" },
    ],
  },
  copy: {
    home: {
      heroKicker: "Adamenko Photography",
      heroTitle: "Warm photographs, true to the people in them.",
      heroSubtitle: "Family, maternity and couple photography in Lyon.",
      heroCta: "View the galleries",
      intro:
        "I photograph the ties between people: a family drawing close, the wait for a child, two people in love. Gentle, honest images, made to last.",
      featuredTitle: "Explore by theme",
      contactCta: "Let's work together",
    },
    galleries: {
      eyebrow: "The work, by theme",
      title: "Galleries",
      intro:
        "A tight selection, by theme. Each series is conceived as one coherent whole.",
      view: "View the series",
    },
    about: {
      title: "About",
      body: [
        "I'm a photographer in Lyon, and I work wherever I'm taken.",
        "My approach is simple: put you at ease, then disappear — so the real images arrive on their own.",
      ],
      portraitAlt: "Portrait of the photographer",
    },
    services: {
      eyebrow: "Working together",
      title: "Sessions",
      intro:
        "Every session is shaped around you: the place, the pace, what matters to your family.",
      note: "Rates and packages are shared on request.",
      cta: "Request the rates",
    },
    contact: {
      eyebrow: "Get in touch",
      title: "Contact",
      intro:
        "Tell me about your project — the date, the place, what you have in mind. I reply within a few days.",
      form: {
        name: "Your name",
        email: "Your email",
        occasion: "Type of session",
        message: "Your message",
        submit: "Send",
        sending: "Sending…",
        success:
          "Thank you — your message has arrived. I'll be in touch very soon.",
        error:
          "Sorry, your message didn't go through. Try again in a moment, or email me directly.",
        errors: {
          name: "Please enter your name.",
          email: "Please enter a valid email address.",
          occasion: "Choose a type of session.",
          message: "Write a few words (at least 10 characters).",
        },
      },
    },
    footer: {
      tagline: "Photographer in Lyon — families, couples, maternity, weddings.",
      instagram: "Instagram",
      rights: "All rights reserved.",
    },
  },
  // Contact-occasion labels (lib/contact.ts CONTACT_OCCASIONS) for the form <select>.
  occasions: ["Family", "Maternity", "Couple", "Portrait", "Wedding", "Other"],
} as const;
