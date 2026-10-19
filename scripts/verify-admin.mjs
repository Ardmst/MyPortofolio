/**
 * Authenticated end-to-end check of the admin CMS.
 * Requires a running server and the local fallback credentials (or real
 * Supabase credentials) from .env.local.
 *
 * Usage: node scripts/verify-admin.mjs [baseUrl]
 */

const base = process.argv[2] ?? "http://localhost:3000";
const email = process.env.LOCAL_ADMIN_EMAIL ?? "admin@ardmst.local";
const password = process.env.LOCAL_ADMIN_PASSWORD ?? "ardmst";

let cookie = "";
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

async function call(path, init = {}) {
  const headers = new Headers(init.headers);
  if (cookie) headers.set("cookie", cookie);
  if (init.body && !headers.has("content-type") && typeof init.body === "string") {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${base}${path}`, { redirect: "manual", ...init, headers });

  for (const value of response.headers.getSetCookie?.() ?? []) {
    const pair = value.split(";")[0];
    if (pair.startsWith("pt_admin_session=")) cookie = pair;
  }

  return response;
}

async function json(path, init) {
  const response = await call(path, init);
  const text = await response.text();
  let body = {};
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  return { response, body };
}

console.log(`\n== Ardmst admin verification @ ${base} ==\n`);

/* ------------------------------------------------------------------ login */
console.log("AUTHENTICATION");
{
  const bad = await json("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: "definitely-wrong" }),
  });
  check("wrong password is rejected (401)", bad.response.status === 401);

  const invalid = await json("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "not-an-email", password: "x" }),
  });
  check("invalid payload rejected (422)", invalid.response.status === 422, JSON.stringify(invalid.body.errors ?? {}));

  const good = await json("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  check("valid credentials accepted (200)", good.response.status === 200, `mode=${good.body.mode}`);
  check("session cookie issued", cookie.startsWith("pt_admin_session="));
}

/* -------------------------------------------------------------- dashboard */
console.log("\nDASHBOARD (authenticated)");
{
  const overview = await call("/admin");
  const html = await overview.text();
  check("GET /admin returns 200", overview.status === 200, `status ${overview.status}`);
  check("overview renders stats", html.includes("Total projects") && html.includes("Unread messages"));
  check("overview has Add New Project action", html.includes("Add New Project"));

  for (const path of ["/admin/projects", "/admin/messages", "/admin/projects/new"]) {
    const response = await call(path);
    check(`GET ${path} returns 200`, response.status === 200, `status ${response.status}`);
  }

  const inbox = await call("/api/messages");
  const inboxBody = await inbox.json();
  check("GET /api/messages authorised", inbox.status === 200, `${inboxBody.count} messages`);
}

/* ------------------------------------------------------- project CRUD ---- */
console.log("\nPROJECT CRUD");
const stamp = Date.now();
let projectId = "";
let projectSlug = "";
{
  const create = await json("/api/projects", {
    method: "POST",
    body: JSON.stringify({
      title: `Verification Project ${stamp}`,
      slug: `verification-project-${stamp}`,
      category: "web_app",
      summary: "Temporary project created by scripts/verify-admin.mjs to exercise the CRUD path.",
      description_markdown:
        "## Smoke test\nThis row is created, updated and deleted by the verification script.",
      tech_stack: ["Next.js", "Supabase"],
      thumbnail_url: "/placeholders/portfolio-cms.svg",
      gallery_urls: ["/placeholders/portfolio-cms.svg"],
      demo_url: "https://example.com",
      github_url: null,
      featured: false,
    }),
  });

  check("POST /api/projects creates (201)", create.response.status === 201, create.body.error ?? "");
  projectId = create.body.data?.id ?? "";
  projectSlug = create.body.data?.slug ?? "";
  check("created project has an id", Boolean(projectId));

  const duplicate = await json("/api/projects", {
    method: "POST",
    body: JSON.stringify({
      title: `Duplicate ${stamp}`,
      slug: projectSlug,
      category: "web_app",
      summary: "Should be rejected because the slug is already taken.",
      description_markdown: "## Duplicate slug test row for the repository layer.",
      tech_stack: ["Next.js"],
      thumbnail_url: "/placeholders/portfolio-cms.svg",
    }),
  });
  check("duplicate slug rejected (409)", duplicate.response.status === 409, duplicate.body.error ?? "");

  const invalid = await json("/api/projects", {
    method: "POST",
    body: JSON.stringify({ title: "x", category: "nope" }),
  });
  check("invalid project rejected (422)", invalid.response.status === 422);

  const list = await json("/api/projects?category=web_app");
  check(
    "new project appears in the category listing",
    list.body.data?.some((p) => p.id === projectId),
    `${list.body.count} web_app projects`,
  );

  const update = await json(`/api/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify({
      title: `Verification Project ${stamp} (edited)`,
      slug: projectSlug,
      category: "design",
      summary: "Updated by the verification script to prove the PUT handler persists changes.",
      description_markdown:
        "## Smoke test\nThis row was updated, then deleted, by scripts/verify-admin.mjs.",
      tech_stack: ["Next.js", "Figma"],
      thumbnail_url: "/placeholders/design-system.svg",
      gallery_urls: [],
      demo_url: null,
      github_url: null,
      featured: true,
    }),
  });
  check("PUT /api/projects/[id] updates (200)", update.response.status === 200, update.body.error ?? "");
  check("update persisted the new category", update.body.data?.category === "design");
  check("update persisted featured flag", update.body.data?.featured === true);

  const detail = await json(`/api/projects/${projectSlug}`);
  check("GET /api/projects/[slug] reflects the update", detail.body.data?.title?.includes("(edited)"));
}

/* ------------------------------------------------------------- uploads --- */
console.log("\nMEDIA UPLOAD");
{
  // 1x1 transparent PNG
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  );

  const form = new FormData();
  form.append("files", new Blob([png], { type: "image/png" }), "verification-pixel.png");

  const response = await call("/api/upload", { method: "POST", body: form });
  const body = await response.json().catch(() => ({}));
  check("POST /api/upload accepts an image (201)", response.status === 201, body.error ?? "");
  check("upload returned a public URL", Boolean(body.data?.[0]?.url), body.data?.[0]?.url ?? "");

  const url = body.data?.[0]?.url;
  if (url) {
    const served = await fetch(`${base}${url}`);
    check("uploaded file is served back", served.status === 200, `status ${served.status}`);
  }

  const badForm = new FormData();
  badForm.append("files", new Blob([Buffer.from("nope")], { type: "text/plain" }), "nope.txt");
  const bad = await call("/api/upload", { method: "POST", body: badForm });
  check("unsupported mime type rejected (415)", bad.status === 415);
}

/* ------------------------------------------------------------- cleanup --- */
console.log("\nCLEANUP / DELETE");
{
  const removed = await json(`/api/projects/${projectId}`, { method: "DELETE" });
  check("DELETE /api/projects/[id] succeeds (200)", removed.response.status === 200, removed.body.error ?? "");
  check("delete returned the project title", Boolean(removed.body.data?.title));

  const gone = await call(`/api/projects/${projectSlug}`);
  check("deleted project is no longer readable (404)", gone.status === 404);
}

/* ------------------------------------------------------ message actions -- */
console.log("\nMESSAGE INBOX ACTIONS");
{
  const created = await json("/api/messages", {
    method: "POST",
    body: JSON.stringify({
      sender_name: "Verification Bot",
      sender_email: `verify+${stamp}@example.com`,
      subject: "Admin action test",
      message: "Created by scripts/verify-admin.mjs to test the read/unread and delete actions.",
    }),
  });
  check("message created via public endpoint (201)", created.response.status === 201);
  const messageId = created.body.data?.id;

  const markRead = await json(`/api/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_read: true }),
  });
  check("PATCH /api/messages/[id] marks read (200)", markRead.response.status === 200, markRead.body.error ?? "");
  check("message is_read persisted", markRead.body.data?.is_read === true);

  const markUnread = await json(`/api/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_read: false }),
  });
  check("marking unread works too", markUnread.body.data?.is_read === false);

  const removed = await json(`/api/messages/${messageId}`, { method: "DELETE" });
  check("DELETE /api/messages/[id] succeeds (200)", removed.response.status === 200, removed.body.error ?? "");
}

/* ------------------------------------------------------------- sign out -- */
console.log("\nSIGN OUT");
{
  const out = await call("/api/auth/logout", { method: "POST" });
  check("POST /api/auth/logout succeeds", out.status === 200);

  const cleared = (out.headers.getSetCookie?.() ?? []).join(";");
  check("session cookie cleared", cleared.includes("pt_admin_session="));

  const after = await fetch(`${base}/api/messages`, { redirect: "manual" });
  check("admin API rejects the anonymous caller again (401)", after.status === 401);
}

console.log(`\n== ${passed} passed, ${failed} failed ==\n`);
process.exit(failed === 0 ? 0 : 1);
