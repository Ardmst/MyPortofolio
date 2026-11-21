import { PICTURES, type Picture } from "@/content/pictures";

/**
 * The work, as data. The page is built from this file: adding a project is one
 * new entry in FEATURED (with its pictures in `content/pictures.ts`), never a
 * layout change. The work section holds two featured blocks today and is laid
 * out to hold three to five.
 *
 * Facts and wording: DESIGN.md §3 in the workspace root. Team work is always
 * named as team work.
 */

/** How a featured project is opened from its block. */
export type ProjectLive =
  | {
      /** A web build that runs on the page itself, in an iframe that loads on a click. */
      kind: "game";
      /** The build's own HTML page, same origin. */
      src: string;
      /** The page of this site that shows the game on its own. */
      page: string;
      /** Accessible name of the running game's frame. */
      frameTitle: string;
      /** A muted loop of the game's own art, shown until the game starts. */
      clip?: { webm: string; mp4: string };
      play: string;
      full: string;
      /** Shown instead of the play button where there is no keyboard. */
      phoneNote: string;
      /** Shown instead of the play button when script is off. */
      noScript: string;
      /** While the build downloads. */
      loading: string;
      /** The controls, once it runs. */
      controls: string;
      restart: string;
    }
  | {
      /** A live site, opened in a new tab. */
      kind: "site";
      href: string;
      label: string;
      /** A short line under the button, when something must be said about what opens. */
      caption?: string;
      /** Optional: the site's public standings, read on the server (see `components/site/Standings.tsx`). */
      standings?: { api: string; caption: string };
    };

export interface FeaturedProject {
  slug: string;
  title: string;
  /** What it is · when · with whom. */
  kind: string;
  year: string;
  team: string;
  description: string;
  facts: string;
  /** The project's own flat ground (a token from theme.css) and the biro's colour on it. */
  field: string;
  biroInk?: string;
  /** The oversized visual. */
  visual: {
    /** `flush`: the picture fills the box. `field`: an interface capture set into the project's colour field. */
    frame: "flush" | "field";
    /** Proportion of the box on a wide screen, as CSS (`16 / 9`). */
    ratio: string;
    /** Proportion of the box on a phone/touch screen, as CSS (`4 / 5`). */
    tallRatio?: string;
    wide: Picture;
    /** One line under the wide picture saying what it shows. */
    wideCaption: string;
    /** The upright picture a phone shows instead, and its line. */
    tall: Picture;
    tallCaption: string;
  };
  /** The small landscape picture of the cluster, 16:10. */
  cluster: Picture;
  /**
   * Set when the small picture is an interface capture too: the flat ground it hangs in
   * (a token from theme.css). Without it the picture simply fills its frame.
   */
  clusterField?: string;
  live: ProjectLive;
}

export const FEATURED: FeaturedProject[] = [
  {
    slug: "detektif-ekosistem",
    title: "Detektif Ekosistem",
    kind: "Pixel-art detective game",
    year: "2026",
    team: "made with Eka",
    description:
      "A top-down detective game about the forest fires of Kalimantan. You walk three hand-laid maps as Detektif Tedy, question a witness, read the data on each clue and decide what it means. Every choice feeds Kolb's learning cycle, and the last screen is a report card of how you learn.",
    facts: "Godot 4.7 and GDScript, about 7,000 lines. Autosave, minimap, weather, a footprint trail that finds the exit.",
    field: "var(--field-ember)",
    biroInk: "#fff",
    visual: {
      frame: "flush",
      ratio: "16 / 9",
      wide: PICTURES.detektif.stagePoster,
      wideCaption: "The menu art of the game.",
      tall: PICTURES.detektif.village,
      tallCaption: "Stage one: the village, seen from above.",
    },
    cluster: PICTURES.detektif.analysis,
    live: {
      kind: "game",
      src: "/games/detektif/index.html",
      page: "/play/detektif",
      frameTitle: "Detektif Ekosistem, the game",
      clip: {
        webm: "/work/detektif-ekosistem/menu-loop.webm",
        mp4: "/work/detektif-ekosistem/menu-loop.mp4",
      },
      play: "Play it here",
      full: "Open full screen",
      phoneNote: "It needs a keyboard. Open this page on a computer to play.",
      noScript: "The game needs JavaScript.",
      loading: "Loading about 48 MB. WASD to move, E to interact, Space to continue, Esc to pause.",
      controls: "WASD to move, E to interact, Space to continue, Esc to pause.",
      restart: "Restart",
    },
  },
  {
    slug: "kicauscore",
    title: "KicauScore",
    kind: "Contest scoring platform",
    year: "2026",
    team: "team of five",
    description:
      "Songbird contests are judged by ear, on paper, in a crowd. KicauScore puts it on phones: owners book a numbered slot, each judge scores sight and sound, and the standings rank themselves in front of everyone. I led the architecture and ran the server.",
    facts:
      "Laravel 13 on PHP 8.4. Judges are averaged in SQL, ties break four ways, scores lock after validation, and a row lock keeps two birds off one slot.",
    field: "var(--field-kicau)",
    biroInk: "#fff",
    visual: {
      frame: "flush",
      ratio: "1240 / 880",
      tallRatio: "1240 / 880",
      wide: PICTURES.kicauscore.home,
      wideCaption: "A contest page: venue, date, hours and the bird classes.",
      tall: PICTURES.kicauscore.home,
      tallCaption: "A contest page: venue, date, hours and the bird classes.",
    },
    cluster: PICTURES.kicauscore.standings,
    clusterField: "var(--field-mint)",
    live: {
      kind: "site",
      href: "https://kicaumania.ardmst.my.id",
      label: "Open KicauScore",
    },
  },
];

/** A row of the "More work" part of the table. All are the owner's public repositories. */
export interface WorkRow {
  name: string;
  kind: string;
  builtWith: string;
  year: string;
  /** Where the row goes: the live page when there is one, otherwise the repository. */
  href: string;
  linkKind: "live" | "repo";
  /** The picture the biro holds over the row (640 wide or less), when there is one. */
  preview?: Picture;
}

export const MORE_WORK: WorkRow[] = [
  {
    name: "Sistem Wisuda",
    kind: "Graduation registration system",
    builtWith: "Laravel 12, Breeze, Alpine.js, DomPDF",
    year: "2026",
    href: "https://github.com/Ardmst/Project_Wisuda",
    linkKind: "repo",
  },
  {
    name: "HotelEase",
    kind: "Hotel booking and back office",
    builtWith: "React 19, Vite, Laravel API",
    year: "2026",
    href: "https://github.com/Ardmst/Hotel-Ease",
    linkKind: "repo",
  },
  {
    name: "Kusda Gym",
    kind: "Multi-page gym website",
    builtWith: "HTML, CSS, JavaScript, Bootstrap, Leaflet",
    year: "2025",
    href: "https://ardmst.github.io/kusda-gym/",
    linkKind: "live",
    preview: PICTURES.more.kusdaGym,
  },
  {
    name: "LogicPro",
    kind: "Interactive lessons in programming logic",
    builtWith: "HTML, CSS, JavaScript",
    year: "2025",
    href: "https://ardmst.github.io/LogicPro/",
    linkKind: "live",
    preview: PICTURES.more.logicPro,
  },
];

/** A row of the "Toolbox" part: the tool, what it was used for, and where. No percentages. */
export interface ToolRow {
  tool: string;
  usedFor: string;
  where: string;
}

export const TOOLBOX: ToolRow[] = [
  { tool: "Laravel & PHP", usedFor: "scoring engine, role-based access, transactions", where: "KicauScore, Sistem Wisuda" },
  { tool: "Godot & GDScript", usedFor: "gameplay, save system, audio, web export", where: "Detektif Ekosistem" },
  { tool: "Next.js, React & TypeScript", usedFor: "these two sites", where: "ardmst.my.id" },
  { tool: "SQL (SQLite, PostgreSQL)", usedFor: "schemas, constraints, row locks", where: "KicauScore" },
  { tool: "Linux, Nginx & Cloudflare", usedFor: "running the VPS that serves KicauScore", where: "kicaumania.ardmst.my.id" },
];
