import type { ProjectCategory, SkillCategory } from "@/lib/types";

export const SITE = {
  name: "Ardmst",
  /** Handle is derived from the first and last name: Ard(i) M(ustaqim) → ardmst. */
  handle: "ardmst",
  fullName: "Rifkhi Ardi Mustaqim",
  role: "Fullstack Developer & Game Creator",
  tagline:
    "I build web applications, ship games, and design interfaces — dark, fast and deliberate.",
  domain: "ardmst.my.id",
  location: "Indonesia",
  email: "hello@ardmst.my.id",
  availability: "Open for freelance & full-time",
} as const;

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  game: "Game Dev",
  web_app: "Web & App",
  design: "UI/UX Design",
};

export const PROJECT_CATEGORY_DESCRIPTIONS: Record<ProjectCategory, string> = {
  game: "Unity / Godot builds, gameplay systems and prototypes.",
  web_app: "Production web apps, APIs and tooling.",
  design: "Interface systems, prototypes and visual identity.",
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

export const SKILL_CATEGORY_DESCRIPTIONS_MAP: Record<SkillCategory, string> = {
  programming: "languages & runtimes",
  game_dev: "engines & systems",
  design: "tools & process",
};

export const SKILL_NAME_ICONS: Record<string, string> = {
  TypeScript: "FileCode2",
  "React / Next.js": "Atom",
  "Node.js": "Server",
  "PostgreSQL / SQL": "Database",
  "C#": "Hash",
  Unity: "Gamepad2",
  Godot: "Boxes",
  "Gameplay Systems": "Cpu",
  Blender: "Box",
  "Shader / VFX": "Sparkles",
  Figma: "Figma",
  "Design Systems": "LayoutGrid",
  "UI Motion": "Wand2",
  Prototyping: "MousePointerClick",
};

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

export const BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET?.trim() || "portfolio-media";

/** Terminal commands advertised in the hero terminal. */
export const TERMINAL_COMMANDS = [
  "cat profile.json",
  "help",
  "skills",
  "projects",
  "contact",
  "clear",
] as const;

export const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
] as const;
