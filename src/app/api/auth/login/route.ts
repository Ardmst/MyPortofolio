import { NextResponse, type NextRequest } from "next/server";
import { signInAdmin } from "@/lib/auth/admin";
import { dataMode, localAdminEmail } from "@/lib/env";
import { isEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** POST /api/auth/login — Supabase Auth (or the local fallback) sign-in. */
export async function POST(request: NextRequest) {
  let payload: { email?: unknown; password?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "Validation failed.", errors: { email: "Enter a valid email address." } },
      { status: 422 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Validation failed.", errors: { password: "Password must be at least 6 characters." } },
      { status: 422 },
    );
  }

  const result = await signInAdmin(email, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return NextResponse.json({
    data: { email },
    mode: dataMode(),
    // Surfaced in the UI so the local fallback is never mistaken for Supabase.
    hint: dataMode() === "local" ? `Local dev credentials: ${localAdminEmail}` : null,
  });
}
