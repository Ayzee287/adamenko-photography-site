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
  /** Display title, French. */
  title: string;
  /** One emotional line — the feeling, not the feature. */
  tagline: string;
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
      title: "Famille",
      tagline: "Votre quotidien, tel qu'il est vraiment.",
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
      title: "Couple",
      tagline: "Vous deux, au naturel.",
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
      title: "Grossesse",
      tagline: "Les semaines qui précèdent la naissance.",
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
      title: "Mariage",
      tagline: "Votre journée, racontée comme vous l'avez vécue.",
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
    {
      slug: "portraits",
      title: "Portrait",
      tagline: "Un portrait simple, à la lumière du jour.",
      description: [
        "Un portrait franc, sans artifice : un échange plus qu'une pose. On cherche votre expression la plus naturelle, à la lumière du jour.",
        "Pour un usage personnel comme professionnel, en couleur ou en noir et blanc.",
      ],
      approach: [
        "En studio improvisé, chez vous ou en extérieur",
        "Une mise en confiance avant tout",
        "Noir et blanc ou couleur, selon l'intention",
      ],
      idealFor:
        "Portraits personnels, artistiques ou professionnels.",
    },
  ] satisfies Service[],
} as const;
