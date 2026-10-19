import type { Message, Project, Skill } from "@/lib/types";

/**
 * Seed content for the local fallback store.
 * Mirrors `supabase/seed.sql` so both modes show the same demo data.
 */

const now = Date.now();
const iso = (offsetDays: number) => new Date(now - offsetDays * 86_400_000).toISOString();

export const SEED_PROJECTS: Project[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Neon Runner",
    slug: "neon-runner",
    category: "game",
    summary:
      "Endless cyberpunk runner with procedurally generated districts, wall-running and a synthwave soundtrack.",
    description_markdown: `## Overview
**Neon Runner** is a vertical-slice endless runner built in Unity 6. The player sprints through procedurally assembled megacity districts, chaining wall-runs and slides to keep the combo multiplier alive.

### What I built
- Chunk-based level generator with weighted difficulty curves
- Custom character controller (coyote time, air control, wall-run lerp)
- Combo scoring system with server-authoritative daily leaderboard
- Adaptive synthwave OST that layers stems by combo tier

### Hardest problem
Keeping 60 FPS on mid-range Android while streaming chunks. Solved with object pooling, GPU instancing for the district props, and an async addressable load queue that pre-fetches the next two chunks during idle frames.`,
    tech_stack: ["Unity", "C#", "Blender", "Addressables"],
    thumbnail_url: "/placeholders/neon-runner.svg",
    gallery_urls: ["/placeholders/neon-runner.svg", "/placeholders/gameplay.svg"],
    demo_url: "https://example.com/neon-runner",
    github_url: "https://github.com/ardmst/neon-runner",
    featured: true,
    created_at: iso(42),
    updated_at: iso(6),
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Void Protocol",
    slug: "void-protocol",
    category: "game",
    summary:
      "Top-down stealth prototype in Godot 4 — line-of-sight AI, hackable turrets and a diegetic HUD.",
    description_markdown: `## Overview
A stealth prototype where light is the enemy. Guards build a real-time visibility mesh; the player has to break line of sight or hack the network to blind them.

### What I built
- Vision-cone mesh built from raycasts, redrawn every frame
- Behaviour-tree guards with search / alert / patrol states
- Terminal hacking minigame with branching node graph
- Full controller + keyboard remapping

### Hardest problem
Recomputing many vision cones per frame was killing the CPU budget. Moved the visibility polygon into a compute-style batched job and only recalculated cones whose owners moved or whose occluders changed.`,
    tech_stack: ["Godot", "GDScript", "Aseprite"],
    thumbnail_url: "/placeholders/void-protocol.svg",
    gallery_urls: ["/placeholders/void-protocol.svg"],
    demo_url: null,
    github_url: "https://github.com/ardmst/void-protocol",
    featured: false,
    created_at: iso(88),
    updated_at: iso(30),
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Portfolio CMS",
    slug: "portfolio-cms",
    category: "web_app",
    summary:
      "This portfolio — Next.js App Router, Supabase Postgres/Storage/Auth and a protected admin CMS.",
    description_markdown: `## Overview
The site you are looking at. A public showcase plus a full CMS so projects, skills and contact messages are managed without touching code.

### What I built
- Next.js App Router with server components and route handlers
- Supabase Postgres schema with RLS for \`projects\`, \`skills\`, \`messages\`
- Cookie-based admin session + middleware protection for \`/admin/*\`
- Media uploader writing to the \`portfolio-media\` storage bucket
- Dark monochrome design system with an Electric Blue accent

### Hardest problem
Server-rendering a modal-driven gallery without shipping the whole dataset to the client. Solved by rendering only summaries on the server and fetching gallery detail lazily per slug.`,
    tech_stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    thumbnail_url: "/placeholders/portfolio-cms.svg",
    gallery_urls: ["/placeholders/portfolio-cms.svg", "/placeholders/dashboard.svg"],
    demo_url: "https://ardmst.my.id",
    github_url: "https://github.com/Ardmst/MyPortofolio",
    featured: true,
    created_at: iso(20),
    updated_at: iso(1),
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "Koperasi Digital",
    slug: "koperasi-digital",
    category: "web_app",
    summary:
      "Savings & loan platform for a local co-operative: member onboarding, ledgers and repayment schedules.",
    description_markdown: `## Overview
A production web app used by a 1,200-member co-operative. Handles member KYC, deposits, loan origination and amortisation schedules.

### What I built
- Role-based dashboards (member, teller, manager)
- Double-entry ledger with an immutable audit trail
- Loan amortisation engine with flat and effective interest
- CSV/PDF statement export and daily reconciliation job

### Hardest problem
Money must never drift. Every mutation writes a balanced journal entry inside one transaction, and a nightly job asserts that the sum of all postings equals zero.`,
    tech_stack: ["Next.js", "PostgreSQL", "Prisma", "Tailwind CSS"],
    thumbnail_url: "/placeholders/koperasi.svg",
    gallery_urls: ["/placeholders/koperasi.svg"],
    demo_url: null,
    github_url: "https://github.com/ardmst/koperasi-digital",
    featured: false,
    created_at: iso(150),
    updated_at: iso(60),
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    title: "Ardmst Design System",
    slug: "ardmst-design-system",
    category: "design",
    summary:
      "Token-first component library: primitive → semantic → component layers, documented in Figma and shipped to code.",
    description_markdown: `## Overview
A three-layer token architecture that keeps design and code in sync, plus the component specifications built on top of it.

### What I built
- Primitive → semantic → component token tiers
- Figma variables wired to the same JSON the web app imports
- 40+ documented components with states, spacing and a11y notes
- Motion guidelines: durations, easings and reduced-motion fallbacks

### Hardest problem
Naming. Semantic tokens had to survive a full rebrand without touching a single component, which forced strict separation between *what it looks like* and *what it means*.`,
    tech_stack: ["Figma", "Design Tokens", "Storybook"],
    thumbnail_url: "/placeholders/design-system.svg",
    gallery_urls: ["/placeholders/design-system.svg", "/placeholders/tokens.svg"],
    demo_url: "https://example.com/design-system",
    github_url: null,
    featured: true,
    created_at: iso(70),
    updated_at: iso(14),
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    title: "Fintech Dashboard UI",
    slug: "fintech-dashboard-ui",
    category: "design",
    summary:
      "Dark analytics dashboard concept — dense data tables, sparklines and a monochrome shell with one accent.",
    description_markdown: `## Overview
An exploration of how much information a dark dashboard can hold before it becomes noise.

### What I built
- Information architecture for 9 primary screens
- Data-table spec: density modes, sticky columns, bulk actions
- Chart language: one accent colour, everything else greyscale
- Interactive prototype with real transitions

### Hardest problem
Making charts readable without colour. Solved with position, weight and opacity hierarchy instead of hue.`,
    tech_stack: ["Figma", "Framer Motion"],
    thumbnail_url: "/placeholders/fintech-ui.svg",
    gallery_urls: ["/placeholders/fintech-ui.svg"],
    demo_url: null,
    github_url: null,
    featured: false,
    created_at: iso(95),
    updated_at: iso(40),
  },
];

export const SEED_SKILLS: Skill[] = [
  { id: "a1000000-0000-4000-8000-000000000001", name: "TypeScript", category: "programming", proficiency: 92, icon_name: "FileCode2", display_order: 1 },
  { id: "a1000000-0000-4000-8000-000000000002", name: "React / Next.js", category: "programming", proficiency: 94, icon_name: "Atom", display_order: 2 },
  { id: "a1000000-0000-4000-8000-000000000003", name: "Node.js", category: "programming", proficiency: 85, icon_name: "Server", display_order: 3 },
  { id: "a1000000-0000-4000-8000-000000000004", name: "PostgreSQL / SQL", category: "programming", proficiency: 80, icon_name: "Database", display_order: 4 },
  { id: "a1000000-0000-4000-8000-000000000005", name: "C#", category: "programming", proficiency: 78, icon_name: "Hash", display_order: 5 },

  { id: "b2000000-0000-4000-8000-000000000001", name: "Unity", category: "game_dev", proficiency: 88, icon_name: "Gamepad2", display_order: 1 },
  { id: "b2000000-0000-4000-8000-000000000002", name: "Godot", category: "game_dev", proficiency: 74, icon_name: "Boxes", display_order: 2 },
  { id: "b2000000-0000-4000-8000-000000000003", name: "Gameplay Systems", category: "game_dev", proficiency: 82, icon_name: "Cpu", display_order: 3 },
  { id: "b2000000-0000-4000-8000-000000000004", name: "Blender", category: "game_dev", proficiency: 66, icon_name: "Box", display_order: 4 },
  { id: "b2000000-0000-4000-8000-000000000005", name: "Shader / VFX", category: "game_dev", proficiency: 61, icon_name: "Sparkles", display_order: 5 },

  { id: "c3000000-0000-4000-8000-000000000001", name: "Figma", category: "design", proficiency: 90, icon_name: "Figma", display_order: 1 },
  { id: "c3000000-0000-4000-8000-000000000002", name: "Design Systems", category: "design", proficiency: 87, icon_name: "LayoutGrid", display_order: 2 },
  { id: "c3000000-0000-4000-8000-000000000003", name: "UI Motion", category: "design", proficiency: 79, icon_name: "Wand2", display_order: 3 },
  { id: "c3000000-0000-4000-8000-000000000004", name: "Prototyping", category: "design", proficiency: 83, icon_name: "MousePointerClick", display_order: 4 },
];

export const SEED_MESSAGES: Message[] = [
  {
    id: "d4000000-0000-4000-8000-000000000001",
    sender_name: "Rina Kusuma",
    sender_email: "rina@techrecruit.io",
    subject: "Fullstack role — remote",
    message:
      "Hi Ardi, we are hiring a senior fullstack engineer for a product team. Your Portfolio CMS work looks close to what we do. Are you open to a chat this week?",
    is_read: false,
    created_at: iso(1),
  },
  {
    id: "d4000000-0000-4000-8000-000000000002",
    sender_name: "Budi Santoso",
    sender_email: "budi@kopdigital.id",
    subject: "Game prototype quote",
    message:
      "Kami butuh prototipe game edukasi 2D untuk anak SD. Bisa minta estimasi timeline dan biaya untuk scope kecil dulu?",
    is_read: false,
    created_at: iso(3),
  },
  {
    id: "d4000000-0000-4000-8000-000000000003",
    sender_name: "Sarah Lim",
    sender_email: "sarah@studioform.co",
    subject: "Design system collaboration",
    message:
      "Loved the token architecture write-up on your design system. Would you be open to a paid consultation for our team?",
    is_read: true,
    created_at: iso(12),
  },
];
