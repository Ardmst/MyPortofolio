import { SITE } from "@/lib/constants";
import { PICTURES, type Picture } from "@/content/pictures";

/**
 * The words of the public page, section by section, as typed data.
 *
 * Every sentence here comes from the copy deck in DESIGN.md §3 (workspace
 * root) and is checked against the projects themselves. Do not add a claim
 * that is not: no clients, users, awards or ratings.
 *
 * The projects, the table rows and the toolbox are in `content/work.ts`.
 */

const MAIL_SUBJECT = "Project inquiry";

export const CONTACT = {
  email: SITE.email,
  mailto: `mailto:${SITE.email}?subject=${encodeURIComponent(MAIL_SUBJECT)}`,
  github: { label: "github.com/Ardmst", href: SITE.githubUrl },
  linkedin: { label: "linkedin.com/in/ardmst", href: SITE.linkedinUrl },
  hub: { label: "ardmst.my.id", href: SITE.hubUrl },
} as const;

/** The bar: wordmark to the hub, three plain links, the theme word. */
export const BAR = {
  mark: { label: SITE.handle, href: SITE.hubUrl },
  links: [
    { label: "Work", href: "/#work" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;

/** One portrait of the hero: the picture, its caption line and the flat ground it brings. */
export interface HeroPortrait {
  picture: Picture;
  caption: string;
  /**
   * CSS colour of the ground and of the ink on it (tokens from theme.css).
   * `null` ground means the page ground itself: the dot-grid sheet.
   */
  ground: string | null;
  ink: string;
  /** Colour of the biro point over this ground, when the accent would be lost on it. */
  biroInk?: string;
}

/**
 * Four sheets: the portrait, then the game twice (its key art, one of its maps), then the
 * scoreboard, in the order the work section follows. The pinned name must be gone within three
 * screens, so a fifth sheet (KicauScore's bird profile, on the sky field) was taken out: the
 * scoreboard is already there, and again in the work below.
 */
export const HERO = {
  /** The monument. It is the page's h1. */
  name: "ARDMST",
  sentence:
    "Rifkhi Ardi Mustaqim builds web apps and games in Indonesia. Two of them are live below: open one, play the other.",
  action: { label: "See the work", href: "#work" },
  portraits: [
    {
      picture: PICTURES.hero.portrait,
      caption: "Rifkhi Ardi Mustaqim",
      ground: null,
      ink: "var(--ink)",
    },
    {
      picture: PICTURES.hero.keyart,
      caption: "Detektif Ekosistem, key art",
      ground: "var(--field-forest)",
      ink: "var(--on-field)",
      biroInk: "#fff",
    },
    {
      picture: PICTURES.hero.burntLand,
      caption: "Detektif Ekosistem, the burnt land of stage two",
      ground: "var(--field-ember)",
      ink: "var(--on-field)",
      biroInk: "#fff",
    },
    {
      picture: PICTURES.hero.standings,
      caption: "KicauScore, a contest page with its venue, date and categories",
      ground: "var(--field-kicau)",
      ink: "var(--on-field)",
      biroInk: "#fff",
    },
  ] satisfies HeroPortrait[],
} as const;

export const WORK_HEADING = "Work you can open";

export const ABOUT = {
  heading: "About",
  /** The first words of the statement are the name, set in full ink. */
  name: SITE.fullName,
  /** Continues the sentence the name starts. */
  statement:
    "writes the back end first. In a team he is the one who draws the tables, decides what happens when two people press the button at once, and gets the thing onto a server that stays up. Then he builds the part you see. The handle is his name with the vowels left out.",
  second:
    "He studies in Indonesia and takes freelance and full-time work: web applications in Laravel or Next.js, small games in Godot, and the servers they run on.",
  facts: [
    { label: "Based in", value: "Indonesia" },
    { label: "Works in", value: "Laravel, Next.js, Godot" },
    { label: "Write to", value: SITE.email, href: CONTACT.mailto },
  ],
  portrait: PICTURES.about.portrait,
} as const;

export const LIST = {
  more: "More work",
  toolbox: "Toolbox",
  /** Read out after a row's name, so a link says where it goes. Never shown. */
  goes: {
    live: "the live site, opens in a new tab",
    repo: "the repository on GitHub, opens in a new tab",
  },
  /** Column names for screen readers; on the page the fixed column starts do the organising. */
  columns: {
    more: ["Project", "What it is", "Built with", "Year"],
    toolbox: ["Tool", "Used for", "Where"],
  },
} as const;

/** One address row of the contact section: the address at display size, a short note at the far end. */
export interface ContactRow {
  label: string;
  href: string;
  /** What is behind the address, in a few words. */
  note: string;
  /** Opens in a new tab: anything that is not one of these two sites or the mail program. */
  newTab?: boolean;
}

export const CONTACT_SECTION = {
  /** The greeting row is the section's heading; its round button writes the mail. */
  greeting: "Say hello",
  /** Accessible name of the round arrow button. */
  write: `Write an email to ${CONTACT.email}`,
  rows: [
    { label: CONTACT.email, href: CONTACT.mailto, note: "Email" },
    { label: CONTACT.github.label, href: CONTACT.github.href, note: "Code and experiments", newTab: true },
    { label: CONTACT.linkedin.label, href: CONTACT.linkedin.href, note: "The professional version", newTab: true },
    { label: CONTACT.hub.label, href: CONTACT.hub.href, note: "Every site I run" },
  ] satisfies ContactRow[],
} as const;

export const CLOSE = {
  invitation: "Have something that needs building?",
  action: { label: "Write to me", href: CONTACT.mailto },
  links: [
    { label: "GitHub", href: SITE.githubUrl, newTab: true },
    { label: "LinkedIn", href: SITE.linkedinUrl, newTab: true },
    { label: "ardmst.my.id", href: SITE.hubUrl, newTab: false },
  ],
  /** What a screen reader says for the derivation line. */
  fullName: "Ardi Mustaqim",
  /**
   * The name with the letters the handle drops. `kept` parts are set in full
   * ink, the others in the soft ink: ARD·I· M·U·ST·AQIM.
   */
  derivation: [
    { text: "ARD", kept: true },
    { text: "I", kept: false },
    { text: " M", kept: true },
    { text: "U", kept: false },
    { text: "ST", kept: true },
    { text: "AQIM", kept: false },
  ],
  legal: {
    left: "© 2026 Rifkhi Ardi Mustaqim",
    right: "Detektif Ekosistem made with Eka · KicauScore by a team of five",
  },
  name: "ARDMST",
} as const;
