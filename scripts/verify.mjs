/**
 * Local smoke test — the public page, the read-only API, the SEO files, the
 * game build and the admin route protection, against a running server.
 * It only reads: nothing is written to the data store.
 *
 * Usage: node scripts/verify.mjs [baseUrl]
 */

const base = process.argv[2] ?? "http://localhost:3000";

let passed = 0;
let failed = 0;

function check(label, ok, detail = "") {
  if (ok) passed += 1;
  else failed += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

async function get(path, init) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", ...init });
  const text = await response.text();
  return { response, text };
}

console.log(`\n== Ardmst verification @ ${base} ==\n`);

/* ---------------------------------------------------------------- public */
console.log("PUBLIC PAGE");
{
  const { response, text } = await get("/");
  check("GET / returns 200", response.status === 200, `status ${response.status}`);
  check("home has one <h1>", (text.match(/<h1[\s>]/g) ?? []).length === 1);
  check("home names ARDMST", text.includes("ARDMST"));
  check("html lang is en", /<html[^>]*\blang="en"/.test(text));
  check("theme boot script is inline", text.includes("ardmst-theme"));
  check("canonical is set", /<link rel="canonical" href="https?:\/\/[^"]+"/.test(text));
  check("no localhost in production metadata", base.includes("localhost:3000") || !text.includes("http://localhost:3000"));

  const stylesheets = [...text.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((match) => match[1]);
  check("public page links a stylesheet", stylesheets.length > 0, `${stylesheets.length} file(s)`);
  let css = "";
  for (const href of stylesheets) css += await (await fetch(`${base}${href}`)).text();
  check("public CSS carries the shared theme tokens", css.includes("--step-monument") && css.includes("--bloom-1"));
  check("public CSS does not carry the admin's Tailwind tokens", !css.includes("--color-void") && !css.includes("grid-backdrop"));

  check("profile picture served", (await fetch(`${base}/profile.jpg`)).status === 200);
  check("blank resume.pdf is gone", (await fetch(`${base}/resume.pdf`)).status === 404);
}

/* ------------------------------------------------------------------- seo */
console.log("\nSEO FILES");
{
  const robots = await get("/robots.txt");
  check("GET /robots.txt returns 200", robots.response.status === 200);
  check("robots disallows /admin and /api", /Disallow: \/admin/.test(robots.text) && /Disallow: \/api/.test(robots.text));
  check("robots points at the sitemap", /Sitemap: https?:\/\/\S+\/sitemap\.xml/.test(robots.text));

  const sitemap = await get("/sitemap.xml");
  check("GET /sitemap.xml returns 200", sitemap.response.status === 200);
  check("sitemap lists the home page", /<loc>https?:\/\/[^<]+<\/loc>/.test(sitemap.text));
}

/* ------------------------------------------------------------------- api */
console.log("\nPUBLIC API");
{
  const all = JSON.parse((await get("/api/projects")).text);
  const slugs = (all.data ?? []).map((project) => project.slug);
  check("GET /api/projects returns data", Array.isArray(all.data), `${all.count} projects: ${slugs.join(", ")}`);
  check("the two real projects are present", slugs.includes("detektif-ekosistem") && slugs.includes("kicauscore"));
  check(
    "no placeholder content is left",
    !JSON.stringify(all).includes("/placeholders/") && !JSON.stringify(all).includes("example.com"),
  );

  for (const project of all.data ?? []) {
    for (const url of [project.thumbnail_url, ...project.gallery_urls]) {
      if (!url.startsWith("/")) continue;
      const status = (await fetch(`${base}${url}`, { method: "HEAD" })).status;
      check(`picture served: ${url}`, status === 200, `status ${status}`);
    }
  }

  const game = JSON.parse((await get("/api/projects?category=game")).text);
  check(
    "GET /api/projects?category=game filters",
    game.data.length > 0 && game.data.every((project) => project.category === "game"),
    game.data.map((project) => project.title).join(", "),
  );

  const detail = await get("/api/projects/kicauscore");
  check("GET /api/projects/kicauscore returns detail", detail.response.status === 200);

  const missing = await get("/api/projects/does-not-exist-xyz");
  check("GET /api/projects/<unknown> returns 404", missing.response.status === 404);

  const malformed = await get("/api/projects/%25zz");
  check("a malformed identifier is a 400, not a crash", malformed.response.status === 400, `status ${malformed.response.status}`);

  const skills = JSON.parse((await get("/api/skills")).text);
  check("GET /api/skills returns the toolbox", Array.isArray(skills.data) && skills.data.length > 0, `${skills.count} tools`);

  const invalidMessage = await get("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender_name: "A", sender_email: "nope", message: "short" }),
  });
  const invalidBody = JSON.parse(invalidMessage.text);
  check("POST /api/messages rejects invalid input (422)", invalidMessage.response.status === 422);
  check(
    "validation errors are field-scoped",
    Boolean(invalidBody.errors?.sender_email && invalidBody.errors?.message),
    Object.keys(invalidBody.errors ?? {}).join(", "),
  );
}

/* ------------------------------------------------------------------ game */
console.log("\nGAME BUILD (public/games/detektif)");
{
  const expected = {
    "index.html": "text/html",
    "index.js": "javascript",
    "index.wasm": "application/wasm",
    "index.pck": "application/octet-stream",
  };
  for (const [file, type] of Object.entries(expected)) {
    const response = await fetch(`${base}/games/detektif/${file}`, { method: "HEAD" });
    const contentType = response.headers.get("content-type") ?? "";
    check(
      `${file} is served`,
      response.status === 200 && contentType.includes(type),
      `status ${response.status}, ${contentType}, ${response.headers.get("content-length")} bytes, ${response.headers.get("cache-control")}`,
    );
    check(`${file} sends no COOP/COEP`, !response.headers.get("cross-origin-opener-policy") && !response.headers.get("cross-origin-embedder-policy"));
  }
}

/* -------------------------------------------------------- route guarding */
console.log("\nADMIN AUTH / ROUTE PROTECTION");
{
  const dashboard = await get("/admin");
  check(
    "GET /admin redirects anonymous visitors",
    dashboard.response.status === 307 || dashboard.response.status === 302,
    `status ${dashboard.response.status} → ${dashboard.response.headers.get("location") ?? "-"}`,
  );
  check(
    "redirect target is /admin/login with redirectTo",
    (dashboard.response.headers.get("location") ?? "").includes("/admin/login"),
  );

  const projectsPage = await get("/admin/projects");
  check(
    "GET /admin/projects redirects anonymous visitors",
    projectsPage.response.status === 307 || projectsPage.response.status === 302,
  );

  const login = await get("/admin/login");
  check("GET /admin/login is reachable", login.response.status === 200);
  check("login form renders", login.text.includes("Sign in") || login.text.includes("Email"));
  check("admin is noindex", /<meta name="robots" content="noindex/.test(login.text));

  check("GET /api/messages requires auth (401)", (await get("/api/messages")).response.status === 401);

  const create = await get("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Nope" }),
  });
  check("POST /api/projects requires auth (401)", create.response.status === 401);

  const upload = await get("/api/upload", { method: "POST" });
  check("POST /api/upload requires auth (401)", upload.response.status === 401);
}

console.log(`\n== ${passed} passed, ${failed} failed ==\n`);
process.exit(failed === 0 ? 0 : 1);
