import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SESSION_COOKIE, readSessionCookie } from "@/lib/auth/session";
import { dataMode, supabaseAnonKey, supabaseUrl } from "@/lib/env";

const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

/**
 * Gate for every `/admin/*` route (Next.js 16 "proxy", formerly middleware).
 *
 * Supabase mode: refreshes the Supabase Auth session and requires a user.
 *                The signed cookie only counts when AUTH_COOKIE_FALLBACK=true.
 * Local mode   : requires the signed session cookie. In production that cookie
 *                is rejected until a real AUTH_SECRET is configured.
 *
 * The dashboard layout and every admin API route check `getAdminUser()` again,
 * so this is the first layer, not the only one.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const mode = dataMode();

  let response = NextResponse.next({ request });
  let authenticated = false;

  if (mode === "supabase") {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
            response = NextResponse.next({ request });
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      });

      // getUser() revalidates the JWT with Supabase — do not use getSession().
      const { data } = await supabase.auth.getUser();
      authenticated = Boolean(data.user);
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated) {
    const session = await readSessionCookie(request.cookies.get(SESSION_COOKIE)?.value, mode);
    authenticated = Boolean(session);
  }

  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!authenticated && !isPublicAdminRoute) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (authenticated && isPublicAdminRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
