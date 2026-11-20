import { NextResponse, type NextRequest } from "next/server";
import { signInAdmin } from "@/lib/auth/admin";
import { RateLimiter, clientAddress } from "@/lib/rate-limit";
import { isEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
/** Failed attempts allowed per client address inside one window. */
const perClient = new RateLimiter(5, WINDOW_MS);
/** Failed attempts allowed in total — holds even when addresses are spoofed. */
const overall = new RateLimiter(40, WINDOW_MS, 1);
const OVERALL_KEY = "all";

function tooManyAttempts(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many sign-in attempts. Try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } },
  );
}

/** POST /api/auth/login — Supabase Auth, or the local sign-in when configured. */
export async function POST(request: NextRequest) {
  const client = clientAddress(request);

  const blockedFor = Math.max(perClient.retryAfter(client), overall.retryAfter(OVERALL_KEY));
  if (blockedFor > 0) return tooManyAttempts(blockedFor);

  let payload: { email?: unknown; password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!isEmail(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Validation failed.", errors: { email: "Enter a valid email address." } },
      { status: 422 },
    );
  }
  if (password.length < 6 || password.length > 1024) {
    return NextResponse.json(
      { error: "Validation failed.", errors: { password: "Password must be at least 6 characters." } },
      { status: 422 },
    );
  }

  const result = await signInAdmin(email, password);

  if (!result.ok) {
    // Every refused attempt counts, whatever the reason.
    perClient.hit(client);
    overall.hit(OVERALL_KEY);

    if (result.reason === "unconfigured") {
      return NextResponse.json(
        { error: "Admin sign-in is not configured on this server." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (result.reason === "unavailable") {
      return NextResponse.json(
        { error: "Sign-in is temporarily unavailable." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  perClient.reset(client);
  return NextResponse.json({ data: { signedIn: true } }, { headers: { "Cache-Control": "no-store" } });
}
