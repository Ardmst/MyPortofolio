import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, localAdminEmail, localAdminPassword } from "@/lib/env";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionProvider,
} from "@/lib/auth/session";

/**
 * Admin authentication.
 *
 * Two backends feed ONE gate:
 *  - Supabase Auth, when the project env values are real.
 *  - the local fallback, compared against LOCAL_ADMIN_EMAIL/PASSWORD.
 *
 * Either way the result is mirrored into the signed session cookie so the
 * Edge middleware has a single, uniform thing to check.
 */

export interface AdminUser {
  email: string;
  /** Which backend vouched for this session. */
  provider: SessionProvider;
  name?: string;
}

/** Resolves the signed-in admin, or null. Safe to call from a Server Component. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      // getUser() revalidates the JWT with Supabase — never trust getSession().
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (email) {
        return withName({ email, provider: "supabase" }, data.user?.user_metadata);
      }
    } catch {
      // Fall through to the signed cookie below.
    }
  }

  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  return {
    email: session.email,
    provider: session.provider ?? "local",
    ...(session.name ? { name: session.name } : {}),
  };
}

/** Verifies credentials and, on success, mints the signed session cookie. */
export async function signInAdmin(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data.user) {
        return { ok: false, error: error?.message ?? "Invalid email or password." };
      }

      await setSessionCookie(withName({ email: data.user.email ?? normalizedEmail }, data.user.user_metadata));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Supabase sign-in failed.",
      };
    }
  }

  if (normalizedEmail !== localAdminEmail.toLowerCase().trim() || password !== localAdminPassword) {
    return { ok: false, error: "Invalid email or password." };
  }

  await setSessionCookie({ email: normalizedEmail, provider: "local" });
  return { ok: true };
}

/** Clears both the Supabase session and the signed cookie. */
export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured()) {
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
