// UI chrome strings (i18n activation). These are the user-facing strings that lived
// as literals inside components — navigation/aria labels, the skip link, gallery and
// lightbox controls, screen-reader announcements. Centralised here so they localise
// through the dictionary like every other string (French is canonical; the English
// values live in content/dictionaries/en.ts). Moving them here does not change the
// French output — the values are identical to the former literals.

export const ui = {
  skipToContent: "Aller au contenu",
  nav: {
    primary: "Navigation principale",
    footer: "Pied de page",
    legal: "Liens légaux",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    menu: "Menu",
    language: "Choix de la langue",
    instagram: "Instagram",
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
