/**
 * Local smoke test — exercises the public page, the API routes and the
 * admin route protection against a running dev/prod server.
 *
 * Usage: node scripts/verify.mjs [baseUrl]
 */

const base = process.argv[2] ?? "http://localhost:3000";

let passed = 0;
let failed = 0;

function check(label, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function get(path, init) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", ...init });
  const text = await response.text();
  return { response, text };
}

console.log(`\n== Portototo verification @ ${base} ==\n`);

/* ---------------------------------------------------------------- public */
console.log("PUBLIC PAGE");
{
  const { response, text } = await get("/");
  check("GET / returns 200", response.status === 200, `status ${response.status}`);

  const markers = [
    "Selected Work",
    "Skill Matrix",
    "build something",
    "Neon Runner",
    "Koperasi Digital",
    "profile.jpg",
    "View Projects",
    "Showing",
  ];
  for (const marker of markers) {
    check(`home contains "${marker}"`, text.includes(marker));
  }

  const cssHref = text.match(/href="(\/_next\/static\/[^"]+\.css)"/)?.[1];
  if (cssHref) {
    const css = await (await fetch(`${base}${cssHref}`)).text();
    check("compiled CSS contains --color-accent", css.includes("--color-accent"));
    check("compiled CSS contains grid-backdrop utility", css.includes("grid-backdrop"));
    check("compiled CSS contains terminal scan animation", css.includes("marquee-scan"));
    check("compiled CSS contains caret animation", css.includes("caret"));
  } else {
    check("CSS bundle link found", false);
  }

  check("seed project thumbnail asset served", (await fetch(`${base}/placeholders/neon-runner.svg`)).status === 200);
  check("profile asset served", (await fetch(`${base}/profile.jpg`)).status === 200);
}

/* ------------------------------------------------------------------- api */
console.log("\nPUBLIC API");
{
  const all = JSON.parse((await get("/api/projects")).text);
  check("GET /api/projects returns data", Array.isArray(all.data), `${all.count} projects`);

  const game = JSON.parse((await get("/api/projects?category=game")).text);
  check(
    "GET /api/projects?category=game filters",
    game.data.length > 0 && game.data.every((p) => p.category === "game"),
    game.data.map((p) => p.title).join(", "),
  );

  const design = JSON.parse((await get("/api/projects?category=design")).text);
  check(
    "GET /api/projects?category=design filters",
    design.data.length > 0 && design.data.every((p) => p.category === "design"),
    design.data.map((p) => p.title).join(", "),
  );

  const slug = game.data[0]?.slug;
  const detail = await get(`/api/projects/${slug}`);
  check(`GET /api/projects/${slug} returns detail`, detail.response.status === 200);

  const missing = await get("/api/projects/does-not-exist-xyz");
  check("GET /api/projects/<unknown> returns 404", missing.response.status === 404);

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

  const stamp = Date.now();
  const valid = await get("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender_name: "Verification Bot",
      sender_email: `verify+${stamp}@example.com`,
      subject: "Smoke test",
      message: "This message was inserted by scripts/verify.mjs during local verification.",
    }),
  });
  check("POST /api/messages accepts valid input (201)", valid.response.status === 201);
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
