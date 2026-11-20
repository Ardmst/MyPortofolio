import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { dataMode, localAdminCredentials, signedCookieEnabled } from "@/lib/env";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  readSessionCookie,
  type SessionProvider,
} from "@/lib/auth/session";

/**
 * Admin authentication.
 *
 * Two backends, one gate:
 *  - Supabase Auth, when the project env values are real. The Supabase session
 *    is then the only credential; the signed cookie is ignored unless
 *    AUTH_COOKIE_FALLBACK=true.
 *  - the local sign-in, compared against LOCAL_ADMIN_EMAIL/PASSWORD and carried
 *    by the signed session cookie. In production it is refused outright until
 *    LOCAL_ADMIN_EMAIL, LOCAL_ADMIN_PASSWORD and AUTH_SECRET are set to real
 *    values (see `src/lib/env.ts`).
 */

export interface AdminUser {
  email: string;
  /** Which backend vouched for this session. */
  provider: SessionProvider;
  name?: string;
}

export type SignInResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "unconfigured" | "unavailable" };

/** Resolves the signed-in admin, or null. Safe to call from a Server Component. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const mode = dataMode();

  if (mode === "supabase") {
    try {
      const supabase = await createServerSupabaseClient();
      // getUser() revalidates the JWT with Supabase — never trust getSession().
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (email) {
        return withName({ email, provider: "supabase" }, data.user?.user_metadata);
      }
    } catch {
      // Fall through: the signed cookie only counts when explicitly enabled.
    }
  }

  const session = await readSessionCookie(cookieStore.get(SESSION_COOKIE)?.value, mode);
  if (!session) return null;

  return {
    email: session.email,
    provider: session.provider ?? "local",
    ...(session.name ? { name: session.name } : {}),
  };
}

/** Constant-time string comparison (length differences are hidden by hashing). */
function safeEqual(left: string, right: string): boolean {
  const a = createHash("sha256").update(left, "utf8").digest();
  const b = createHash("sha256").update(right, "utf8").digest();
  return timingSafeEqual(a, b);
}

/** Verifies credentials and, on success, establishes the session. */
export async function signInAdmin(email: string, password: string): Promise<SignInResult> {
  const normalizedEmail = email.toLowerCase().trim();

  if (dataMode() === "supabase") {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data.user) return { ok: false, reason: "invalid" };

      // The Supabase cookies are the session. Mirror it into the signed cookie
      // only when the fallback has been switched on explicitly.
      if (signedCookieEnabled("supabase")) {
        await setSessionCookie(
          withName({ email: data.user.email ?? normalizedEmail }, data.user.user_metadata),
        );
      }
      return { ok: true };
    } catch (error) {
      console.error("[auth] Supabase sign-in failed:", error);
      return { ok: false, reason: "unavailable" };
    }
  }

  const credentials = localAdminCredentials();
  if (!credentials || !signedCookieEnabled("local")) {
    // Production without real LOCAL_ADMIN_* / AUTH_SECRET values: no sign-in.
    return { ok: false, reason: "unconfigured" };
  }

  // Evaluate both comparisons so timing does not reveal which one failed.
  const emailMatches = safeEqual(normalizedEmail, credentials.email);
  const passwordMatches = safeEqual(password, credentials.password);
  if (!emailMatches || !passwordMatches) return { ok: false, reason: "invalid" };

  await setSessionCookie({ email: credentials.email, provider: "local" });
  return { ok: true };
}

/** Clears both the Supabase session and the signed cookie. */
export async function signOutAdmin(): Promise<void> {
  if (dataMode() === "supabase") {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // The explicit cookie delete below is the source of truth.
    }
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

function withName(
  identity: { email: string; provider?: SessionProvider },
  metadata: unknown,
): AdminUser {
  const source = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : {};
  const name = ["name", "full_name", "fullName", "display_name", "displayName"]
    .map((key) => source[key])
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);

  return {
    email: identity.email,
    provider: identity.provider ?? "supabase",
    ...(name ? { name } : {}),
  };
}

async function setSessionCookie(identity: AdminUser): Promise<void> {
  const token = await createSessionToken(identity.email, {
    provider: identity.provider,
    name: identity.name,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}
