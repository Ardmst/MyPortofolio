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
      picture: PICTURES.hero.standings,
      caption: "KicauScore, live standings (demo data)",
      ground: "var(--field-kicau)",
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
      picture: PICTURES.hero.birdProfile,
      caption: "KicauScore, a bird's profile (demo data)",
      ground: "var(--sky)",
      ink: "var(--sky-ink)",
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
} as const;

export const CONTACT_SECTION = {
  /** The greeting row is the section's heading; its round button writes the mail. */
  greeting: "Say hello",
  rows: [
    { label: CONTACT.email, href: CONTACT.mailto },
    { label: CONTACT.github.label, href: CONTACT.github.href },
    { label: CONTACT.linkedin.label, href: CONTACT.linkedin.href },
    { label: CONTACT.hub.label, href: CONTACT.hub.href },
  ],
} as const;

export const CLOSE = {
  invitation: "Have something that needs building?",
  action: { label: "Write to me", href: CONTACT.mailto },
  links: [
    { label: "GitHub", href: SITE.githubUrl },
    { label: "LinkedIn", href: SITE.linkedinUrl },
    { label: "ardmst.my.id", href: SITE.hubUrl },
  ],
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
