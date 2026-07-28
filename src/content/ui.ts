// UI chrome strings (i18n activation). These are the user-facing strings that lived
// as literals inside components — navigation/aria labels, the skip link, gallery and
// lightbox controls, screen-reader announcements. Centralised here so they localise
// through the dictionary like every other string (French is canonical; the English
// values live in content/dictionaries/en.ts). Moving them here does not change the
// French output — the values are identical to the former literals.

export const ui = {
  skipToContent: "Aller au contenu",
  nav: {
    /** Breadcrumb label for the home page — structured data only, never rendered. */
    home: "Accueil",
    primary: "Navigation principale",
    footer: "Pied de page",
    /** Heads the footer's service column — rendered, unlike the aria-only labels here. */
    services: "Prestations",
    legal: "Liens légaux",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    menu: "Menu",
    language: "Choix de la langue",
    instagram: "Instagram",
    facebook: "Facebook",
    email: "Envoyer un e-mail",
    backToTop: "Revenir en haut",
  },
  // Reusable action / cross-link labels shared across pages (kept out of per-page copy
  // so /en never falls back to French on a secondary CTA).
  actions: {
    viewGallery: "Voir la galerie",
    pricing: "Les tarifs",
    contactMe: "Me contacter",
    more: "Suite",
    howItWorks: "Comment ça se passe",
    requestDate: "Demander une date",
    requestQuote: "Demander un devis",
    manifesto: "Manifeste",
  },
  gallery: {
    /** Prefix for the grid thumbnail's accessible name: `${enlarge} : ${alt}`. */
    enlarge: "Agrandir",
    /** The reel region's accessible name. */
    reel: "Aperçu des galeries : faites glisser, faites défiler ou utilisez les flèches pour explorer",
    prevImage: "Image précédente",
    nextImage: "Image suivante",
    /** Lightbox dialog label + controls. */
    lightbox: "Aperçu de la photographie",
    close: "Fermer",
    closeLabel: "Fermer ✕",
    prevPhoto: "Photographie précédente",
    nextPhoto: "Photographie suivante",
    /** Screen-reader frame announcement: `${photograph} ${n} ${of} ${count}`. */
    photograph: "Photographie",
    of: "sur",
    /** "View the gallery" link under each service on /prestations. */
    viewGallery: "Voir la galerie",
  },
  testimonials: {
    prev: "Témoignage précédent",
    next: "Témoignage suivant",
  },
  contact: {
    /** Fallback line under the form. */
    orEmailDirect: "Ou écrivez-moi directement à",
    andFindMeOn: "ou retrouvez-moi sur",
    orFindMeOn: "Ou retrouvez-moi sur",
  },
  notFound: {
    eyebrow: "Erreur 404",
    title: "Cette page n'existe pas.",
    intro:
      "La page que vous cherchez a peut-être été déplacée, ou n'existe plus.",
    back: "Retour à l'accueil",
  },
} as const;
