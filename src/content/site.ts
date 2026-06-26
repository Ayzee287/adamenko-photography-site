// Site identity + all UI copy in one place — the content schema (no CMS, D009).
// French is the canonical language (D008); this object is the seam where a second
// locale would later be added (wrap `copy` in a `{ fr, en }` map) without touching
// components. Copy is written in the brand voice (warm, plain, first person);
// biographical facts are never invented (years, awards, stories).
//
// Identity (brand, location, contact) is NOT duplicated here — it is sourced from
// the single photographer identity model so a name/contact change is one edit.

import { photographer } from "@/content/photographer";

export const site = {
  brand: photographer.brand,
  shortBrand: photographer.shortBrand,
  location: photographer.location.label,
  // Factual service description — doubles as the default meta description.
  tagline:
    "Photographe de famille, portrait, grossesse, couple et mariage à Lyon et au-delà.",
  nav: [
    { href: "/galeries", label: "Galeries" },
    { href: "/a-propos", label: "À propos" },
    { href: "/prestations", label: "Prestations" },
    { href: "/contact", label: "Contact" },
  ],
  // Legal routes — surfaced in the footer (mandatory in France: LCEN + RGPD).
  legalNav: [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/confidentialite", label: "Confidentialité" },
  ],
  social: {
    instagram: photographer.contact.instagram,
  },
  contact: {
    // Sourced from the identity model; empty until the operator sets a real inbox.
    email: photographer.contact.email,
    instagram: photographer.contact.instagram,
  },
} as const;

export const copy = {
  home: {
    // The homepage narrative lives in content/home.ts; the only shared home string
    // used elsewhere is the contact CTA (mobile menu's pill).
    contactCta: "Travaillons ensemble",
  },
  galleries: {
    eyebrow: "Le travail, par thème",
    title: "Galeries",
    intro:
      "Une sélection resserrée, par thème. Chaque série est pensée comme un ensemble cohérent.",
    /** Secondary affordance shown under each genre cover on the index. */
    view: "Voir la série",
  },
  about: {
    title: "À propos",
    // The bio + portrait render from the photographer identity model
    // (content/photographer.ts); only the page title + portrait alt come from here.
    portraitAlt: "Portrait de la photographe",
  },
  services: {
    eyebrow: "Travailler ensemble",
    title: "Prestations",
    intro:
      "Chaque séance est adaptée à vous : le lieu, le rythme, ce qui compte pour votre famille.",
    // Q2 → inquiry-only at launch: no public prices (D007).
    note: "Les tarifs et formules sont communiqués sur demande.",
    cta: "Demander les tarifs",
  },
  contact: {
    eyebrow: "Prendre contact",
    title: "Contact",
    intro:
      "Parlez-moi de votre projet : la date, le lieu, ce que vous imaginez. Je réponds sous quelques jours.",
    form: {
      name: "Votre nom",
      email: "Votre e-mail",
      occasion: "Type de séance",
      message: "Votre message",
      submit: "Envoyer",
      sending: "Envoi…",
      success: "Merci, votre message est bien arrivé. Je vous réponds très vite.",
      error:
        "Désolée, l'envoi n'a pas abouti. Réessayez dans un instant, ou écrivez-moi directement.",
      // Per-field hints shown when server-side validation rejects a field.
      errors: {
        name: "Indiquez votre nom.",
        email: "Indiquez une adresse e-mail valide.",
        occasion: "Choisissez un type de séance.",
        message: "Écrivez quelques mots (au moins 10 caractères).",
      },
    },
  },
  footer: {
    tagline: "Photographe à Lyon : familles, couples, grossesse, mariages.",
    instagram: "Instagram",
    rights: "Tous droits réservés.",
  },
} as const;
