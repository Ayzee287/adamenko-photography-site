import type { Gallery, GalleryImage, GenreSlug } from "@/types/gallery";

// The five genre galleries (D007). Populated 2026-06-25 with the photographer's REAL
// recovered, curated photographs (operator-authorized; EXIF-stripped, optimised, and
// renamed without client identities for privacy/RGPD). Files live under
// public/galleries/<genre>/. Aspect ratios match each frame so there is no crop and
// the masonry reads as a hand-made edit (tall portraits beside wider frames), not a
// uniform tile grid. Alt text is specific, in French, and never names a client.

export const galleries: Gallery[] = [
  {
    slug: "familles",
    title: "Familles",
    intro: "Le quotidien et les liens, à la maison, dehors, ensemble.",
    cover: {
      src: "/galleries/familles/familles-cover.jpg",
      width: 853, height: 1280, ratio: "aspect-[4/5]",
      alt: "Une famille à la maison, un parent soulève son enfant dans la lumière de la fenêtre.",
    },
    images: [
      { src: "/galleries/familles/familles-01.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Une mère et son enfant, front contre front, dans les herbes hautes au soleil couchant." },
      { src: "/galleries/familles/familles-02.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un instant de complicité familiale, en lumière naturelle." },
      { src: "/galleries/familles/familles-03.jpg", width: 1280, height: 868, ratio: "aspect-[3/2]", alt: "Rires partagés en extérieur, au fil de la séance." },
      { src: "/galleries/familles/familles-04.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un moment tendre entre parents et enfant." },
      { src: "/galleries/familles/familles-05.jpg", width: 1280, height: 936, ratio: "aspect-[5/4]", alt: "La douceur du quotidien, en famille." },
      { src: "/galleries/familles/familles-06.jpg", width: 1280, height: 814, ratio: "aspect-[3/2]", alt: "Une promenade ensemble, au naturel." },
      { src: "/galleries/familles/familles-07.jpg", width: 900, height: 1280, ratio: "aspect-[2/3]", alt: "Portrait de famille, lumière douce." },
      { src: "/galleries/familles/familles-08.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Complicité parent-enfant, saisie sur le vif." },
      { src: "/galleries/familles/familles-09.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un éclat de rire en famille." },
    ],
  },
  {
    slug: "grossesse",
    title: "Grossesse",
    intro: "Les semaines douces avant l'arrivée du bébé.",
    cover: {
      src: "/galleries/grossesse/grossesse-cover.jpg",
      width: 853, height: 1280, ratio: "aspect-[4/5]",
      alt: "Future maman en robe blanche dans un champ doré, au coucher du soleil.",
    },
    images: [
      { src: "/galleries/grossesse/grossesse-01.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un couple assis au sol près de la fenêtre, dans l'attente de leur enfant, en noir et blanc." },
      { src: "/galleries/grossesse/grossesse-02.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Future maman, lumière douce d'intérieur." },
      { src: "/galleries/grossesse/grossesse-03.jpg", width: 1280, height: 863, ratio: "aspect-[3/2]", alt: "Tendresse d'un couple avant l'arrivée du bébé." },
      { src: "/galleries/grossesse/grossesse-04.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "L'attente, à la maison." },
      { src: "/galleries/grossesse/grossesse-05.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Portrait de grossesse en lumière naturelle." },
      { src: "/galleries/grossesse/grossesse-06.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "La douceur d'une séance grossesse." },
      { src: "/galleries/grossesse/grossesse-07.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Future maman en lumière douce, avant la naissance." },
      { src: "/galleries/grossesse/grossesse-08.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un couple s'enlace dans un champ au coucher du soleil, une échographie à la main." },
    ],
  },
  {
    slug: "couples",
    title: "Couples",
    intro: "Deux personnes, un lien. Sans poses figées.",
    cover: {
      src: "/galleries/couples/couples-cover.jpg",
      width: 853, height: 1280, ratio: "aspect-[4/5]",
      alt: "Un couple s'embrasse, assis sur une bordure de trottoir parisien.",
    },
    images: [
      { src: "/galleries/couples/couples-01.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un couple complice sous les halles, lumière chaude." },
      { src: "/galleries/couples/couples-02.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Promenade à deux dans la ville." },
      { src: "/galleries/couples/couples-03.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Deux amoureux, un regard partagé." },
      { src: "/galleries/couples/couples-04.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Tendresse d'un couple, sans pose." },
      { src: "/galleries/couples/couples-05.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Un instant d'intimité à deux." },
      { src: "/galleries/couples/couples-06.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "La complicité d'un couple, en lumière naturelle." },
      { src: "/galleries/couples/couples-07.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Deux personnes qui s'aiment, au naturel." },
    ],
  },
  {
    slug: "portraits",
    title: "Portraits",
    intro: "Un portrait simple, à la lumière du jour.",
    cover: {
      src: "/galleries/portraits/portraits-cover.jpg",
      width: 889, height: 1280, ratio: "aspect-[4/5]",
      alt: "Portrait d'une future maman dans un champ doré, au coucher du soleil.",
    },
    images: [
      { src: "/galleries/portraits/portraits-01.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Portrait d'une femme en robe blanche, lumière dorée du soir." },
      { src: "/galleries/portraits/portraits-02.jpg", width: 869, height: 1280, ratio: "aspect-[2/3]", alt: "Future maman regardant son échographie, en noir et blanc." },
      { src: "/galleries/portraits/portraits-03.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Portrait d'une future maman dans les hautes herbes, en noir et blanc." },
      { src: "/galleries/portraits/portraits-04.jpg", width: 1280, height: 855, ratio: "aspect-[3/2]", alt: "Une mère et son bébé, instant tendre en noir et blanc." },
    ],
  },
  {
    slug: "mariages",
    title: "Mariages",
    intro: "Le récit d'une journée : l'émotion plutôt que la mise en scène.",
    cover: {
      src: "/galleries/mariages/mariages-cover.jpg",
      width: 853, height: 1280, ratio: "aspect-[4/5]",
      alt: "Les mariés devant une 2CV bordeaux, à l'entrée d'un château.",
    },
    images: [
      { src: "/galleries/mariages/mariages-01.jpg", width: 1280, height: 972, ratio: "aspect-[5/4]", alt: "Les mariés front contre front, éclat de rire, dans une salle ornée." },
      { src: "/galleries/mariages/mariages-02.jpg", width: 1280, height: 897, ratio: "aspect-[3/2]", alt: "Les mariés dans un jardin botanique, entre les agaves." },
      { src: "/galleries/mariages/mariages-03.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un instant du grand jour, sur le vif." },
      { src: "/galleries/mariages/mariages-04.jpg", width: 874, height: 1280, ratio: "aspect-[2/3]", alt: "Portrait des mariés." },
      { src: "/galleries/mariages/mariages-05.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "La cérémonie, racontée avec discrétion." },
      { src: "/galleries/mariages/mariages-06.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Un détail de la journée de mariage." },
      { src: "/galleries/mariages/mariages-07.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "L'émotion d'un mariage, en lumière naturelle." },
      { src: "/galleries/mariages/mariages-08.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Un moment fort, saisi avec discrétion." },
      { src: "/galleries/mariages/mariages-09.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Les mariés portés par leurs invités, explosion de joie, en noir et blanc." },
    ],
  },
];

/**
 * The homepage reel (HorizontalGallery) — a curated cross-genre exhibition wall.
 * Mixed orientation, colour + black-and-white, sequenced to rise and fall like a
 * hang you walk past. Real photographs (operator-authorized), not placeholders.
 */
export const featured: GalleryImage[] = [
  { src: "/galleries/familles/familles-01.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Une mère et son enfant, front contre front, au soleil couchant." },
  { src: "/galleries/couples/couples-01.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un couple complice sous les halles, lumière chaude." },
  { src: "/galleries/portraits/portraits-cover.jpg", width: 889, height: 1280, ratio: "aspect-[2/3]", alt: "Future maman dans un champ doré, au coucher du soleil." },
  { src: "/galleries/mariages/mariages-09.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Les mariés portés par leurs invités, en noir et blanc." },
  { src: "/galleries/familles/familles-cover.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Une famille à la maison, dans la lumière de la fenêtre." },
  { src: "/galleries/grossesse/grossesse-08.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un couple dans un champ au coucher du soleil, une échographie à la main." },
  { src: "/galleries/mariages/mariages-01.jpg", width: 1280, height: 972, ratio: "aspect-[5/4]", alt: "Les mariés front contre front, éclat de rire." },
  { src: "/galleries/couples/couples-cover.jpg", width: 853, height: 1280, ratio: "aspect-[2/3]", alt: "Un couple s'embrasse sur une bordure de trottoir parisien." },
  { src: "/galleries/grossesse/grossesse-01.jpg", width: 1280, height: 853, ratio: "aspect-[3/2]", alt: "Un couple près de la fenêtre, dans l'attente, en noir et blanc." },
  { src: "/galleries/mariages/mariages-02.jpg", width: 1280, height: 897, ratio: "aspect-[3/2]", alt: "Les mariés dans un jardin botanique." },
];

/** Ordered slugs for nav / static params. */
export const genreSlugs = galleries.map((g) => g.slug) as GenreSlug[];
