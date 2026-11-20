/**
 * Security smoke test for a PRODUCTION build that has no admin configuration.
 *
 * It proves the fail-closed rules of src/lib/env.ts: with LOCAL_ADMIN_EMAIL,
 * LOCAL_ADMIN_PASSWORD and AUTH_SECRET unset, nobody can sign in with the
 * development defaults and no forged cookie opens /admin.
 *
 * Run it against a local server only — never against the live site:
 *
 *   npm run build
 *   npx next start -p 4310        (with the three variables unset)
 *   node scripts/verify-security.mjs http://localhost:4310
 */
import { createHmac } from "node:crypto";

const base = process.argv[2] ?? "http://localhost:4310";

if (!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(base)) {
  console.error("Refusing to run: this script is for a local server only.");
  process.exit(2);
}

let passed = 0;
let failed = 0;

function check(label, ok, detail = "") {
  if (ok) passed += 1;
  else failed += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

/** Values that were public in this repository before the hardening. */
const OLD_EMAIL = "admin@ardmst.local";
const OLD_PASSWORD = "ardmst";
const OLD_SECRETS = {
  "old derived default": `ardmst-dev-secret::${OLD_PASSWORD}`,
  ".env.example value": "change-me-in-production-3f9a1c7b5e2d4a86",
};

function base64Url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function forge(secret, provider) {
  const body = base64Url(
    JSON.stringify({ email: OLD_EMAIL, exp: Date.now() + 8 * 60 * 60 * 1000, provider }),
  );
  const signature = base64Url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${signature}`;
}

async function login(email, password) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    redirect: "manual",
  });
  return { response, text: await response.text() };
}

console.log(`\n== Security verification @ ${base} ==\n`);

console.log("LOGIN PAGE");
{
  const response = await fetch(`${base}/admin/login`, { redirect: "manual" });
  const html = await response.text();
  check("GET /admin/login returns 200", response.status === 200, `status ${response.status}`);
  check("page does not contain the old default e-mail", !html.includes(OLD_EMAIL));
  check("page does not mention LOCAL_ADMIN_PASSWORD", !html.includes("LOCAL_ADMIN_PASSWORD"));
}

console.log("\nDEFAULT CREDENTIALS");
{
  const { response, text } = await login(OLD_EMAIL, OLD_PASSWORD);
  check(
    "POST /api/auth/login with the old defaults is refused",
    response.status !== 200,
    `status ${response.status} ${text}`,
  );
  check("no session cookie is issued", (response.headers.getSetCookie?.() ?? []).length === 0);
  check("response carries no credential hint", !text.includes(OLD_EMAIL) && !text.includes("hint"));
}

console.log("\nFORGED COOKIES");
for (const [label, secret] of Object.entries(OLD_SECRETS)) {
  for (const provider of ["local", "supabase"]) {
    const cookie = `pt_admin_session=${forge(secret, provider)}`;

    const page = await fetch(`${base}/admin`, { headers: { cookie }, redirect: "manual" });
    const location = page.headers.get("location") ?? "";
    check(
      `/admin rejects a cookie signed with the ${label} (${provider})`,
      (page.status === 307 || page.status === 302) && location.includes("/admin/login"),
      `status ${page.status} → ${location || "-"}`,
    );

    const api = await fetch(`${base}/api/messages`, { headers: { cookie }, redirect: "manual" });
    check(
      `/api/messages rejects it too (${provider})`,
      api.status === 401,
      `status ${api.status}`,
    );
  }
}

console.log("\nATTEMPT LIMITER");
{
  const statuses = [];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { response } = await login(OLD_EMAIL, `wrong-password-${attempt}`);
    statuses.push(response.status);
    if (response.status === 429) {
      check("limiter answers 429 with Retry-After", Boolean(response.headers.get("retry-after")),
        `retry-after ${response.headers.get("retry-after")}s`);
      break;
    }
  }
  check("repeated failures are cut off", statuses.includes(429), `statuses ${statuses.join(", ")}`);
  check("no attempt ever succeeded", !statuses.includes(200));
}

console.log(`\n== ${passed} passed, ${failed} failed ==\n`);
process.exit(failed === 0 ? 0 : 1);
