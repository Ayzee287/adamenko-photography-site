// Service descriptions (real-content launch pass). One structured entry per
// specialty, written in the brand voice: documentary, calm, first person, editorial.
// No clichés — never "capturing memories", "freezing moments", "timeless". The
// emphasis is on real interactions, natural light, minimal posing, and the emotion
// of the day rather than a perfect pose. Slugs match the gallery genres so a service
// links straight to its gallery. This is DESCRIPTIVE content only — it does not set
// or change pricing (pricing structure is unchanged, see content/pricing.ts).
//
// Launch copy in the brand voice; the structure stays data-driven so a future edit is
// one change. See docs/content-collection/service-descriptions.md for the intake.

import type { GenreSlug } from "@/types/gallery";

export type Service = {
  /** Matches a gallery genre slug (couples → /galeries/couples). */
  slug: GenreSlug;
  /**
   * The page heading — rendered as the `<h1>` AND used as the `<title>` stem (the brand
   * suffix is appended by the metadata template). It names the service and where it
   * happens, because that is what this page is FOR: a dossier is the commercial landing
   * page for someone searching for a photographer, and a bare noun ("Mariage") told
   * neither a reader nor a search engine what was on offer.
   */
  title: string;
  /**
   * The compact label, for surfaces where the full heading neither fits nor belongs —
   * the cover plaque and the cover's alt text. Keeping this separate is what lets the
   * heading carry the offer without a sentence-long caption appearing on a photograph.
   */
  shortTitle: string;
  /** One emotional line — the feeling, not the feature. Rendered as the page lead. */
  tagline: string;
  /**
   * The `<meta name="description">` — deliberately NOT the tagline. The lead is
   * editorial and speaks to someone already on the page; this speaks to someone reading
   * a result list and deciding whether to click, so it states the offer plainly: what,
   * where, how long, how much. Every fact here is sourced from elsewhere in the repo
   * (pricing.ts, locations.ts, the approach lines below) — never invented.
   */
  metaDescription: string;
  /**
   * Anchor text for links INTO this dossier (from /tarifs and from the genre gallery).
   * Named per service rather than a shared "En savoir plus", because a link that says
   * where it goes is better for a reader using a screen reader or skimming a list of
   * links — and an anchor is one of the few honest signals a search engine has about the
   * page it points at. Deliberately short and human: a label, not a keyword string.
   */
  linkLabel: string;
  /** Documentary description, 1–2 short paragraphs. */
  description: string[];
  /** How the session actually runs — the reassurance, in plain words. */
  approach: string[];
  /** Who it's for / typical occasions (kept human, not a spec sheet). */
  idealFor: string;
};

export const services = {
  // Section copy reused on /prestations.
  eyebrow: "Les prestations",
  title: "Ce que je photographie.",
  intro:
    "Une approche documentaire, en lumière naturelle : je vous laisse vivre la scène et je photographie ce qui arrive vraiment. Peu de poses, de vraies interactions, en couleur comme en noir et blanc.",
  items: [
    {
      slug: "familles",
      linkLabel: "La séance famille",
      title: "Photographe de famille à Lyon",
      shortTitle: "Famille",
      tagline: "Votre quotidien, tel qu'il est vraiment.",
      metaDescription:
        "Séance photo de famille à Lyon, chez vous ou en extérieur : une heure, 220 €. Une approche documentaire en lumière naturelle, sans poses figées.",
      description: [
        "Une séance famille n'est pas une séance de poses. On se retrouve chez vous ou dehors, et je vous laisse être ensemble : les jeux, les câlins, le désordre tendre du quotidien.",
        "Je travaille en retrait, à la lumière du jour, pour que les enfants oublient l'appareil et que les vraies interactions reviennent d'elles-mêmes.",
      ],
      approach: [
        "À la maison ou en extérieur, selon ce qui vous ressemble",
        "Peu de consignes, beaucoup de liberté de mouvement",
        "Lumière naturelle, couleur et noir et blanc",
      ],
      idealFor:
        "Familles avec enfants, nouvelles arrivées, retrouvailles, plusieurs générations réunies.",
    },
    {
      slug: "couples",
      linkLabel: "La séance couple",
      title: "Photographe de couple à Lyon",
      shortTitle: "Couple",
      tagline: "Vous deux, au naturel.",
      metaDescription:
        "Séance photo de couple à Lyon, en extérieur : une heure, 220 €. Le mouvement et la complicité plutôt que la pose, souvent en fin de journée.",
      description: [
        "Pas de poses figées ni de regards forcés vers l'objectif. On marche, on parle, on vous laisse vous retrouver. C'est là, dans le mouvement, que les images justes arrivent.",
        "Une séance couple est aussi une bonne manière de se sentir à l'aise avant un mariage, si c'est ce qui vous attend.",
      ],
      approach: [
        "En extérieur, souvent en fin de journée pour la lumière",
        "Des indications légères, jamais une chorégraphie",
        "Le mouvement et la complicité plutôt que la pose",
      ],
      idealFor:
        "Couples, fiançailles, anniversaires de rencontre, séance avant mariage.",
    },
    {
      slug: "grossesse",
      linkLabel: "La séance grossesse",
      title: "Photographe grossesse à Lyon",
      shortTitle: "Grossesse",
      tagline: "Les semaines qui précèdent la naissance.",
      metaDescription:
        "Séance photo de grossesse à Lyon, chez vous ou en extérieur : une heure, 220 €. Un rythme tranquille, en lumière naturelle et en toute pudeur.",
      description: [
        "Une séance grossesse douce et pudique, à la lumière d'une fenêtre ou en extérieur. On prend le temps ; rien n'est précipité.",
        "L'idée n'est pas de mettre en scène, mais de garder une trace sincère de cette période : seule, en couple ou avec les aînés.",
      ],
      approach: [
        "Chez vous ou en extérieur, dans un cadre calme",
        "Un rythme tranquille, adapté à votre confort",
        "Lumière naturelle, tons doux, noir et blanc possible",
      ],
      idealFor:
        "Futurs parents, à partir du septième mois en général.",
    },
    {
      slug: "mariages",
      linkLabel: "Le reportage mariage",
      title: "Photographe de mariage à Lyon",
      shortTitle: "Mariage",
      tagline: "Votre journée, racontée comme vous l'avez vécue.",
      // Lyon is the base, not the limit: the heading anchors the search that actually
      // happens ("photographe mariage Lyon") while the description states the real
      // policy — weddings throughout France (locations.ts, faq.ts).
      metaDescription:
        "Reportage de mariage documentaire, des préparatifs à la fête. Basée à Lyon, je photographie les mariages dans toute la France. Forfaits à partir de 650 €.",
      description: [
        "J'aborde le mariage comme un reportage : je suis là, attentive, et je raconte le fil de la journée, des préparatifs à la fête, sans interrompre ce qui se passe.",
        "Quelques portraits posés à deux si vous le souhaitez, mais l'essentiel se joue dans les vrais moments, en lumière naturelle autant que possible.",
      ],
      approach: [
        "Demi-journée ou journée complète",
        "Un rendez-vous de préparation pour tout caler ensemble",
        "Reportage discret ; portraits du couple en option",
      ],
      idealFor:
        "Mariages civils, cérémonies laïques, élopements et célébrations intimes.",
    },
  ] satisfies Service[],
} as const;
