# portofolio.ardmst.my.id

The portfolio of Rifkhi Ardi Mustaqim (ardmst): the place where the work can be opened. It presents two projects — **Detektif Ekosistem**, a pixel-art detective game that runs in the browser, and **KicauScore**, a contest scoring platform — and links back to the hub at [ardmst.my.id](https://ardmst.my.id).

Next.js 16 (App Router), deployed on Vercel. A small admin CMS lives under `/admin`.

## Two apps in one repository

The app has two root layouts, so neither side loads the other's CSS, fonts or scripts.

| | Public site | Admin CMS |
|---|---|---|
| Routes | `src/app/(site)/**` | `src/app/admin/**` |
| Root layout | `src/app/(site)/layout.tsx` | `src/app/admin/layout.tsx` |
| Styles | `src/styles/theme.css`, then `src/styles/site.css` | `src/app/globals.css` (Tailwind 4, dark) |
| Fonts | Bebas Neue, EB Garamond | Inter, Space Grotesk, JetBrains Mono |
| Indexing | indexed, with canonical, `robots.txt`, `sitemap.xml` | `noindex`, disallowed in `robots.txt` |

`src/styles/theme.css` is a verbatim copy of the theme shared with the hub. Do not edit the copy: site-specific rules go in `src/styles/site.css`.

`/admin/**` is gated by `src/proxy.ts` (the Next.js 16 name for middleware), and again by `getAdminUser()` in the dashboard layout and in every admin API route.

## Where the content lives

- **Projects and toolbox:** `src/lib/data/seed.ts`. It is real content, written from verified facts. `supabase/seed.sql` is generated from it with `node scripts/generate-seed-sql.cjs`.
- **Pictures:** `public/work/<project-slug>/` (real captures, WebP). The portrait is `public/profile.jpg`.
- **Site facts** (name, description, links): `src/lib/constants.ts`.
- **The game:** `public/games/detektif/` — see below.

### Data modes

The data layer (`src/lib/data/repository.ts`) runs in one of two modes, chosen by the environment.

- **Local** (no Supabase variables): reads come from `.local-data/db.json` when it exists, otherwise from the seed in memory. Reading never writes. On a read-only host such as Vercel the seed is the content and every write (CMS edits, uploads, `POST /api/messages`) answers `503` with a plain message.
- **Supabase** (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set): content, uploads and messages are stored in the project. Run `supabase/migrations/01_schema.sql`, `supabase/storage.sql` and `supabase/seed.sql` first; all three can be run again safely.

API routes answer errors with fixed sentences. Raw error messages only go to the server log.

## Environment

Copy `.env.example` to `.env.local` for development. For the public site alone, production needs nothing; `NEXT_PUBLIC_APP_URL=https://portofolio.ardmst.my.id` is recommended, and a production build falls back to that address by itself (it never emits `localhost`).

### Admin sign-in in production

There are **no default credentials and no default signing secret in production**. Until all three variables below are set on the host, `/admin` stays closed: sign-in answers `503` and no session cookie is accepted.

| Variable | Requirement |
|---|---|
| `LOCAL_ADMIN_EMAIL` | Your address. Not `admin@ardmst.local`. |
| `LOCAL_ADMIN_PASSWORD` | At least 12 characters. Not a value from `.env.example`. |
| `AUTH_SECRET` | At least 32 random characters. Not a value from `.env.example`. |

Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

With Supabase configured, the Supabase session is the only credential and the signed cookie is ignored (unless `AUTH_COOKIE_FALLBACK=true`, which also needs a real `AUTH_SECRET`). Note that any user who can sign in to that Supabase project is treated as an admin: disable public sign-ups there.

In development (`next dev`) the values from `.env.example` apply, so the CMS can be tried locally. Sign-in attempts are limited in memory: 5 failures per address and 40 in total per 15 minutes.

## The game build

`public/games/detektif/` holds the Godot 4.7 web export of Detektif Ekosistem: nine files that must stay together, about 75 MB, entry `index.html`. They are served as static files with `Cache-Control: public, max-age=604800` (see `next.config.ts`). The build is single-threaded and needs no COOP/COEP headers. `.gitattributes` keeps the files byte-identical in git.

To update the game, export the Web preset from Godot again and replace all nine files.

## Commands

```bash
npm install
npm run dev         # http://localhost:3000
npm run typecheck
npm run lint
npm run build
npm run start       # serves the production build on port 3000
```

Smoke tests against a running local server:

```bash
node scripts/verify.mjs http://localhost:3000            # public page, API, SEO files, game files, route protection (read-only)
node scripts/verify-admin.mjs http://localhost:3000      # signed-in CMS round trip; creates and deletes its own rows
node scripts/verify-security.mjs http://localhost:4310   # production build without admin variables: defaults and forged cookies are refused
```
