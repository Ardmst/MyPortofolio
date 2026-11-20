import type { Message, Project, Skill } from "@/lib/types";

/**
 * Seed content for the local store, mirrored by `supabase/seed.sql`.
 *
 * This is real content, not demo filler: the two projects the portfolio
 * presents, written from verified facts (DESIGN.md §3 in the workspace root).
 * On a read-only deployment without Supabase this file IS the content source,
 * so keep every sentence true: no invented clients, users, awards or links.
 *
 * Pictures live in `public/work/<slug>/` and are real captures of each project.
 */

/** When these rows were written into the seed (not when the projects were made). */
const SEEDED_AT = "2026-11-20T00:00:00.000Z";
/** One second later, so Detektif Ekosistem sorts first, as on the public page. */
const SEEDED_AT_FIRST = "2026-11-20T00:00:01.000Z";

export const SEED_PROJECTS: Project[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Detektif Ekosistem",
    slug: "detektif-ekosistem",
    category: "game",
    summary:
      "A top-down pixel-art detective game about the forest and peatland fires of Kalimantan. You walk three hand-laid maps as Detektif Tedy, question a witness, read the data on each clue and decide what it means. Made with Eka.",
    description_markdown: `## What it is
A 2D top-down pixel-art detective game about forest and peatland fires in Kalimantan. You play Detektif Tedy and walk three hand-laid maps: a village and forest, the burnt land with fires still active, and the burnt west side giving way to a river village in the rain. On each map you question a witness and examine clues, read the data on each one and choose what to conclude.

Every choice quietly feeds Kolb's learning cycle, and the final report card shows your learning style.

## Who made it
Two people, Ardi and Eka, for a multimedia course (Praktikum Multimedia) in 2026.

## How it is built
- Godot 4.7 and GDScript: about 7,000 lines in 28 scripts
- Five autoload managers: game state, Kolb scoring, settings, audio and save
- Autosave with continue, a minimap and a hint system
- A footprint trail, drawn with A*, that leads to the exit
- Footsteps that change with the ground under you
- Weather overlays: haze, smoke, embers and rain

Three stages with four clues each, about 20–30 minutes. The game is in Indonesian.

## Playing it
The web build runs in the browser (WebGL 2) on a desktop with a keyboard: WASD or the arrow keys to move, E to interact, Space to advance dialogue, Esc to pause, the mouse for menus. The first load downloads about 48 MB.`,
    tech_stack: ["Godot 4.7", "GDScript"],
    thumbnail_url: "/work/detektif-ekosistem/keyart.webp",
    gallery_urls: [
      "/work/detektif-ekosistem/stage2-analysis-drone.webp",
      "/work/detektif-ekosistem/stage2-burnt-forest.webp",
      "/work/detektif-ekosistem/stage3-rain.webp",
      "/work/detektif-ekosistem/report-card.webp",
    ],
    // The page that hosts the web build on this site (files in public/games/detektif/).
    demo_url: "/play/detektif",
    github_url: null,
    featured: true,
    created_at: SEEDED_AT_FIRST,
    updated_at: SEEDED_AT_FIRST,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "KicauScore",
    slug: "kicauscore",
    category: "web_app",
    summary:
      "A web platform that runs songbird-singing contests: owners book a numbered slot, each judge scores sight and sound from a phone, and the standings rank themselves in front of everyone. Built by a team of five; I led the architecture and ran the server.",
    description_markdown: `## What it is
A web platform that runs songbird-singing contests (lomba burung berkicau). Participants register their birds and get a numbered hanging slot (gantangan), a panel of judges scores each bird from their phones, the system averages the judges and ranks the birds, and anyone can watch the live standings.

## Who made it
A team of five built it as the final project for a programming course in 2026. My role was project manager, lead architect and DevOps: the MVC and service-layer architecture, the database migrations, the concurrency-safe slot allocation service, the VPS deployment, hardening and releases.

## Engineering worth naming
- Multi-judge scores are averaged in SQL inside a transaction
- A four-level tie-breaker: total, then audio, then visual, then slot number
- Scores lock once a category is validated, and every revision is written to an audit log with its reason
- Slot allocation uses a row lock (\`lockForUpdate\`) backed by a unique constraint, so two payments can never get the same slot
- Role-based access for admin, judge and participant
- Standings refresh by 10-second polling
- 17 automated tests (Pest)

## Stack
Laravel 13, PHP 8.4, SQLite, Blade, Tailwind CSS and vanilla JavaScript, served by Nginx and PHP-FPM on an Azure Ubuntu VM behind Cloudflare.

The names and scores on the live site are seeded demo data.`,
    tech_stack: ["Laravel 13", "PHP 8.4", "SQLite", "Blade", "Tailwind CSS", "JavaScript", "Nginx", "Cloudflare"],
    thumbnail_url: "/work/kicauscore/scoreboard-live.webp",
    gallery_urls: [
      "/work/kicauscore/scoreboard-live-full.webp",
      "/work/kicauscore/home.webp",
      "/work/kicauscore/bird-profile.webp",
    ],
    // An ongoing category with ranked entries on the live site (demo data).
    demo_url: "https://kicaumania.ardmst.my.id/scoreboard/murai-batu-vip-36g",
    // Deliberately not linked: the owner reviews the repository first.
    github_url: null,
    featured: true,
    created_at: SEEDED_AT,
    updated_at: SEEDED_AT,
  },
];

/**
 * The schema requires a proficiency number, but nobody can measure "82% at
 * SQL". Every tool gets the same neutral value (the CMS form's own default)
 * and the public site never shows it: tools are listed by what they were
 * used for.
 */
export const NEUTRAL_PROFICIENCY = 50;

export const SEED_SKILLS: Skill[] = [
  { id: "a1000000-0000-4000-8000-000000000001", name: "Laravel & PHP", category: "programming", proficiency: NEUTRAL_PROFICIENCY, icon_name: null, display_order: 1 },
  { id: "a1000000-0000-4000-8000-000000000002", name: "Godot & GDScript", category: "game_dev", proficiency: NEUTRAL_PROFICIENCY, icon_name: null, display_order: 2 },
  { id: "a1000000-0000-4000-8000-000000000003", name: "Next.js, React & TypeScript", category: "programming", proficiency: NEUTRAL_PROFICIENCY, icon_name: null, display_order: 3 },
  { id: "a1000000-0000-4000-8000-000000000004", name: "SQL (SQLite, PostgreSQL)", category: "programming", proficiency: NEUTRAL_PROFICIENCY, icon_name: null, display_order: 4 },
  { id: "a1000000-0000-4000-8000-000000000005", name: "Linux, Nginx & Cloudflare", category: "programming", proficiency: NEUTRAL_PROFICIENCY, icon_name: null, display_order: 5 },
];

/** The inbox starts empty: there are no demo messages. */
export const SEED_MESSAGES: Message[] = [];
