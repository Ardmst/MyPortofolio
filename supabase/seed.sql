-- ===========================================================================
-- Portototo — seed.sql
-- Demo content so the public site is never empty while developing.
-- Mirrors src/lib/data/seed.ts (the local fallback store).
--
-- Run AFTER 01_schema.sql.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
insert into public.projects
  (title, slug, category, summary, description_markdown, tech_stack, thumbnail_url, gallery_urls, demo_url, github_url, featured)
values
  (
    'Neon Runner',
    'neon-runner',
    'game',
    'Endless cyberpunk runner with procedurally generated districts, wall-running and a synthwave soundtrack.',
    E'## Overview\n**Neon Runner** is a vertical-slice endless runner built in Unity 6. The player sprints through procedurally assembled megacity districts, chaining wall-runs and slides to keep the combo multiplier alive.\n\n### What I built\n- Chunk-based level generator with weighted difficulty curves\n- Custom character controller (coyote time, air control, wall-run lerp)\n- Combo scoring system with server-authoritative daily leaderboard\n- Adaptive synthwave OST that layers stems by combo tier\n\n### Hardest problem\nKeeping 60 FPS on mid-range Android while streaming chunks. Solved with object pooling, GPU instancing for the district props, and an async addressable load queue that pre-fetches the next two chunks during idle frames.',
    array['Unity', 'C#', 'Blender', 'Addressables'],
    '/placeholders/neon-runner.svg',
    array['/placeholders/neon-runner.svg', '/placeholders/gameplay.svg'],
    'https://example.com/neon-runner',
    'https://github.com/ardmst/neon-runner',
    true
  ),
  (
    'Void Protocol',
    'void-protocol',
    'game',
    'Top-down stealth prototype in Godot 4 — line-of-sight AI, hackable turrets and a diegetic HUD.',
    E'## Overview\nA stealth prototype where light is the enemy. Guards build a real-time visibility mesh; the player has to break line of sight or hack the network to blind them.\n\n### What I built\n- Vision-cone mesh built from raycasts, redrawn every frame\n- Behaviour-tree guards with search / alert / patrol states\n- Terminal hacking minigame with branching node graph\n\n### Hardest problem\nRecomputing many vision cones per frame was killing the CPU budget, so the visibility polygon now only recalculates when an owner moves or an occluder changes.',
    array['Godot', 'GDScript', 'Aseprite'],
    '/placeholders/void-protocol.svg',
    array['/placeholders/void-protocol.svg'],
    null,
    'https://github.com/ardmst/void-protocol',
    false
  ),
  (
    'Portototo CMS',
    'portototo-cms',
    'web_app',
    'This portfolio — Next.js App Router, Supabase Postgres/Storage/Auth and a protected admin CMS.',
    E'## Overview\nThe site you are looking at: a public showcase plus a full CMS so projects, skills and contact messages are managed without touching code.\n\n### What I built\n- Next.js App Router with server components and route handlers\n- Supabase Postgres schema with RLS for `projects`, `skills`, `messages`\n- Cookie-based admin session + middleware protection for `/admin/*`\n- Media uploader writing to the `portfolio-media` storage bucket',
    array['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    '/placeholders/portototo-cms.svg',
    array['/placeholders/portototo-cms.svg', '/placeholders/dashboard.svg'],
    'https://ardmst.my.id',
    'https://github.com/ardmst/portototo',
    true
  ),
  (
    'Koperasi Digital',
    'koperasi-digital',
    'web_app',
    'Savings & loan platform for a local co-operative: member onboarding, ledgers and repayment schedules.',
    E'## Overview\nA production web app used by a 1,200-member co-operative. Handles member KYC, deposits, loan origination and amortisation schedules.\n\n### What I built\n- Role-based dashboards (member, teller, manager)\n- Double-entry ledger with an immutable audit trail\n- Loan amortisation engine with flat and effective interest\n\n### Hardest problem\nMoney must never drift: every mutation writes a balanced journal entry inside one transaction, and a nightly job asserts the postings sum to zero.',
    array['Next.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS'],
    '/placeholders/koperasi.svg',
    array['/placeholders/koperasi.svg'],
    null,
    'https://github.com/ardmst/koperasi-digital',
    false
  ),
  (
    'Ardmst Design System',
    'ardmst-design-system',
    'design',
    'Token-first component library: primitive → semantic → component layers, documented in Figma and shipped to code.',
    E'## Overview\nA three-layer token architecture that keeps design and code in sync, plus the component specifications built on top of it.\n\n### What I built\n- Primitive → semantic → component token tiers\n- Figma variables wired to the same JSON the web app imports\n- 40+ documented components with states, spacing and a11y notes\n\n### Hardest problem\nNaming. Semantic tokens had to survive a full rebrand without touching a component.',
    array['Figma', 'Design Tokens', 'Storybook'],
    '/placeholders/design-system.svg',
    array['/placeholders/design-system.svg', '/placeholders/tokens.svg'],
    'https://example.com/design-system',
    null,
    true
  ),
  (
    'Fintech Dashboard UI',
    'fintech-dashboard-ui',
    'design',
    'Dark analytics dashboard concept — dense data tables, sparklines and a monochrome shell with one accent.',
    E'## Overview\nAn exploration of how much information a dark dashboard can hold before it becomes noise.\n\n### What I built\n- Information architecture for 9 primary screens\n- Data-table spec: density modes, sticky columns, bulk actions\n- Chart language: one accent colour, everything else greyscale',
    array['Figma', 'Framer Motion'],
    '/placeholders/fintech-ui.svg',
    array['/placeholders/fintech-ui.svg'],
    null,
    null,
    false
  )
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------------
insert into public.skills (name, category, proficiency, icon_name, display_order)
values
  ('TypeScript',          'programming', 92, 'FileCode2',          1),
  ('React / Next.js',     'programming', 94, 'Atom',               2),
  ('Node.js',             'programming', 85, 'Server',             3),
  ('PostgreSQL / SQL',    'programming', 80, 'Database',           4),
  ('C#',                  'programming', 78, 'Hash',               5),

  ('Unity',               'game_dev',    88, 'Gamepad2',           1),
  ('Godot',               'game_dev',    74, 'Boxes',              2),
  ('Gameplay Systems',    'game_dev',    82, 'Cpu',                3),
  ('Blender',             'game_dev',    66, 'Box',                4),
  ('Shader / VFX',        'game_dev',    61, 'Sparkles',           5),

  ('Figma',               'design',      90, 'Figma',              1),
  ('Design Systems',      'design',      87, 'LayoutGrid',         2),
  ('UI Motion',           'design',      79, 'Wand2',              3),
  ('Prototyping',         'design',      83, 'MousePointerClick',  4);

-- ---------------------------------------------------------------------------
-- messages (demo inbox)
-- ---------------------------------------------------------------------------
insert into public.messages (sender_name, sender_email, subject, message, is_read)
values
  (
    'Rina Kusuma', 'rina@techrecruit.io', 'Fullstack role — remote',
    'Hi Ardi, we are hiring a senior fullstack engineer for a product team. Your Portototo CMS work looks close to what we do. Are you open to a chat this week?',
    false
  ),
  (
    'Budi Santoso', 'budi@kopdigital.id', 'Game prototype quote',
    'Kami butuh prototipe game edukasi 2D untuk anak SD. Bisa minta estimasi timeline dan biaya untuk scope kecil dulu?',
    false
  ),
  (
    'Sarah Lim', 'sarah@studioform.co', 'Design system collaboration',
    'Loved the token architecture write-up on your design system. Would you be open to a paid consultation for our team?',
    true
  );
