import type { Metadata } from "next";
import type { ProjectCategory, SkillCategory } from "@/lib/types";

/**
 * Facts about the owner and the site. Every value here is verified
 * (see DESIGN.md §3 in the workspace root); do not add claims that are not.
 */
export const SITE = {
  name: "Ardmst",
  /** Handle is derived from the name: Ard(i) M(u)st(aqim) → ardmst. */
  handle: "ardmst",
  fullName: "Rifkhi Ardi Mustaqim",
  title: "Ardmst: Rifkhi Ardi Mustaqim, web apps and games",
  description:
    "Rifkhi Ardi Mustaqim builds web apps and games in Indonesia. Two of them are live below: open one, play the other.",
  location: "Indonesia",
  email: "contact@ardmst.my.id",
  /** The hub: the door to every site on the domain. */
  hubUrl: "https://ardmst.my.id",
  githubUrl: "https://github.com/Ardmst",
  linkedinUrl: "https://linkedin.com/in/ardmst",
} as const;

/** The existing shield favicon files in `public/` (kept as they are). */
export const SITE_ICONS: Metadata["icons"] = {
  icon: [
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/favicon.png", sizes: "256x256", type: "image/png" },
  ],
  apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
};

/* -------------------------------------------------------------------------- */
/* Admin CMS labels                                                            */
/* -------------------------------------------------------------------------- */

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  game: "Game Dev",
  web_app: "Web & App",
  design: "UI/UX Design",
};

/** `all` is a virtual filter, not a database value. */
export type GalleryFilter = ProjectCategory | "all";

export const GALLERY_FILTERS: { value: GalleryFilter; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: "game", label: "Game Dev" },
  { value: "web_app", label: "Web & App" },
  { value: "design", label: "UI/UX Design" },
];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  programming: "Development",
  game_dev: "Game & Engine",
  design: "Design Tools",
};

export const SKILL_CATEGORY_ORDER: SkillCategory[] = ["programming", "game_dev", "design"];

export const TECH_STACK_SUGGESTIONS = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Supabase",
  "Node.js",
  "Unity",
  "C#",
  "Godot",
  "Blender",
  "Figma",
  "Framer Motion",
  "PostgreSQL",
  "Flutter",
];
