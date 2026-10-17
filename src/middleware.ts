import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

/**
 * Gate for every `/admin/*` route.
 *
 * Supabase mode: refreshes the Supabase Auth session and requires a user.
 * Local mode   : validates the signed fallback cookie.
 * Both paths also require the signed cookie, keeping one uniform gate.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  let response = NextResponse.next({ request });
  let authenticated = false;

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const supabaseEnabled =
    supabaseUrl.length > 0 &&
    supabaseKey.length > 0 &&
    !supabaseUrl.includes("your-project-id") &&
    !supabaseKey.includes("your-anon-key");

  if (supabaseEnabled) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
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
