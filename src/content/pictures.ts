/**
 * Every picture the public page shows, with its real size.
 *
 * The files are written by `scripts/pictures.mjs` and `scripts/clip.mjs` into
 * `public/work/…`; the numbers here are the sizes those scripts print. Keep the
 * two in step when a crop changes: width and height reserve the picture's box,
 * so a wrong number shows as a shifted layout.
 */

export interface Picture {
  /** Site-relative path under `public/`. */
  src: string;
  width: number;
  height: number;
  /** Says what the picture is. */
  alt: string;
  /** Smaller renditions of the same crop, for `srcset`. */
  smaller?: { src: string; width: number }[];
  /** Pixel art that may be enlarged: keep its pixels square. */
  pixel?: boolean;
}

export const PICTURES = {
  hero: {
    portrait: {
      src: "/work/hero/portrait-760.webp",
      width: 760,
      height: 1140,
      alt: "Rifkhi Ardi Mustaqim, a black-and-white portrait under trees",
      smaller: [{ src: "/work/hero/portrait-480.webp", width: 480 }],
    },
    keyart: {
      src: "/work/hero/keyart-800.webp",
      width: 800,
      height: 1200,
      alt: "Detektif Ekosistem key art: two pixel-art detectives at the edge of a burning forest",
      smaller: [{ src: "/work/hero/keyart-480.webp", width: 480 }],
    },
    standings: {
      src: "/work/hero/standings-712.webp",
      width: 712,
      height: 1068,
      alt: "KicauScore on a phone: the live standings of the Murai Batu VIP 36G category, first and second place",
      smaller: [{ src: "/work/hero/standings-480.webp", width: 480 }],
    },
    burntLand: {
      src: "/work/hero/burnt-land-800.webp",
      width: 800,
      height: 1200,
      alt: "The second map of Detektif Ekosistem from above: burnt ground and dead trees around a village",
      smaller: [{ src: "/work/hero/burnt-land-480.webp", width: 480 }],
    },
    birdProfile: {
      src: "/work/hero/bird-profile-780.webp",
      width: 780,
      height: 1170,
      alt: "KicauScore on a phone: the profile page of a bird called Halilintar, with its owner and ring number",
      smaller: [{ src: "/work/hero/bird-profile-480.webp", width: 480 }],
    },
  },

  detektif: {
    /** First frame of the menu loop; the still the game stage rests on. */
    stagePoster: {
      src: "/work/detektif-ekosistem/stage-poster.webp",
      width: 1280,
      height: 720,
      alt: "The menu art of Detektif Ekosistem: two detectives, a forest on fire and the burnt land behind it",
    },
    village: {
      src: "/work/detektif-ekosistem/village-45.webp",
      width: 720,
      height: 900,
      alt: "Detektif Ekosistem, stage one: Detektif Tedy on a village street seen from above, a witness marked nearby",
    },
    analysis: {
      src: "/work/detektif-ekosistem/analysis-1610.webp",
      width: 896,
      height: 560,
      alt: "Detektif Ekosistem, a clue card: thermal drone readings of the burnt area and two conclusions to choose from",
    },
  },

  /** The three stages of Detektif Ekosistem, as played (for /play/detektif). */
  detektifStages: {
    one: {
      src: "/work/detektif-ekosistem/stage-1.webp",
      width: 960,
      height: 540,
      alt: "Stage one of Detektif Ekosistem: a village seen from above, with the clue counter and the minimap",
    },
    two: {
      src: "/work/detektif-ekosistem/stage-2.webp",
      width: 960,
      height: 540,
      alt: "Stage two of Detektif Ekosistem: burnt ground with fires still burning between dead trees",
    },
    three: {
      src: "/work/detektif-ekosistem/stage-3.webp",
      width: 960,
      height: 540,
      alt: "Stage three of Detektif Ekosistem: the burnt west side and the first green trees, in the rain",
    },
  },

  kicauscore: {
    standings: {
      src: "/work/kicauscore/standings-desktop.webp",
      width: 1440,
      height: 960,
      alt: "KicauScore live standings: the Murai Batu VIP 36G category with each bird's slot, owner, sight and sound averages and final score",
    },
    homePhone: {
      src: "/work/kicauscore/home-phone.webp",
      width: 780,
      height: 1360,
      alt: "KicauScore on a phone: a contest page with its venue, date, hours and the button to book a slot",
    },
    home: {
      src: "/work/kicauscore/home-card.webp",
      width: 1000,
      height: 620,
      alt: "KicauScore contest page: the event with its venue, date and hours, and the bird classes being judged",
    },
  },

  more: {
    kusdaGym: {
      src: "/work/more/kusda-gym.webp",
      width: 640,
      height: 400,
      alt: "Kusda Gym home page: the gym floor behind the name, membership plans below",
    },
    logicPro: {
      src: "/work/more/logicpro.webp",
      width: 640,
      height: 400,
      alt: "LogicPro simulation lab: small exercises on sequence, booleans, loops and stacks",
    },
  },

  about: {
    portrait: {
      src: "/work/about/portrait-square.webp",
      width: 480,
      height: 480,
      alt: "Rifkhi Ardi Mustaqim",
    },
  },
} as const satisfies Record<string, Record<string, Picture>>;
