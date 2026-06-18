// Site identity + all UI copy in one place — the content schema (no CMS, D009).
// French is the canonical language (D008); this object is the seam where a second
// locale would later be added (wrap `copy` in a `{ fr, en }` map) without touching
// components. Marketing copy below is a careful DRAFT in the brand voice (warm,
// plain, first person) — confirm every line with the photographer; never invent
// biographical facts (years, awards, stories).

export const site = {
  brand: "Adamenko Photography",
  shortBrand: "Adamenko",
  location: "Lyon, France",
  // Factual service description — doubles as the default meta description.
  tagline:
    "Photographe de famille, portrait, grossesse, couple et mariage à Lyon et au-delà.",
  nav: [
    { href: "/galeries", label: "Galeries" },
    { href: "/a-propos", label: "À propos" },
    { href: "/prestations", label: "Prestations" },
    { href: "/contact", label: "Contact" },
  ],
  social: {
    instagram: "https://www.instagram.com/adamenko_photography/",
  },
  contact: {
    // TODO(operator): real address — kept empty rather than fabricated.
    email: "",
    instagram: "https://www.instagram.com/adamenko_photography/",
  },
} as const;

export const copy = {
  home: {
    heroKicker: "Adamenko Photography",
    heroTitle: "Des images chaleureuses, fidèles à ceux qu'elles montrent.",
    heroSubtitle: "Photographe de famille, de grossesse et de couple à Lyon.",
    heroCta: "Voir les galeries",
    // DRAFT — confirm with the photographer.
    intro:
      "Je photographie les liens : une famille qui se serre, l'attente d'un enfant, deux personnes qui s'aiment. Des images douces et sincères, faites pour durer.",
    featuredTitle: "Explorer par thème",
    contactCta: "Travaillons ensemble",
  },
  galleries: {
    title: "Galeries",
    intro:
      "Une sélection resserrée, par thème. Chaque série est pensée comme un ensemble cohérent.",
  },
  about: {
    title: "À propos",
    // DRAFT placeholders — replace with the photographer's own bio + portrait.
    body: [
      "Je suis photographe à Lyon, et je travaille partout où l'on m'emmène.",
      "Mon approche est simple : vous mettre à l'aise, puis disparaître, pour que les vraies images arrivent d'elles-mêmes.",
    ],
    portraitAlt: "Portrait de la photographe",
  },
  services: {
    title: "Prestations",
    intro:
      "Chaque séance est adaptée à vous : le lieu, le rythme, ce qui compte pour votre famille.",
    // Q2 → inquiry-only at launch: no public prices (D007).
    note: "Les tarifs et formules sont communiqués sur demande.",
    cta: "Demander les tarifs",
  },
  contact: {
    title: "Contact",
    intro:
      "Parlez-moi de votre projet — la date, le lieu, ce que vous imaginez. Je réponds sous quelques jours.",
    form: {
      name: "Votre nom",
      email: "Votre e-mail",
      occasion: "Type de séance",
      message: "Votre message",
      submit: "Envoyer",
      success: "Merci — votre message est bien arrivé. Je vous réponds très vite.",
      // The form is not yet wired to delivery — see contact page note.
      pending: "Le formulaire sera bientôt connecté.",
    },
  },
  footer: {
    tagline: "Photographe à Lyon — familles, couples, grossesse, mariages.",
    instagram: "Instagram",
    rights: "Tous droits réservés.",
  },
} as const;
