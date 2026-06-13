import { NextResponse, type NextRequest } from "next/server";

import { createMiddlewareClient } from "@/lib/supabase/middleware";

/**
 * SGTI Authentication Middleware
 *
 * Responsibilities:
 * 1. Refreshes the Supabase session cookie on every request (keeps JWT fresh).
 * 2. Redirects unauthenticated users to /login when accessing protected routes.
 * 3. Redirects authenticated users away from /login to the dashboard.
 *
 * Routes:
 * - Public (no auth required): /login, /auth/callback, /api/health, /api/version
 * - Protected (auth required): everything else under /(dashboard)
 */

/** Routes that do not require authentication */
const PUBLIC_ROUTES = ["/login", "/auth/callback", "/api/health", "/api/version"];

/** Routes that are only accessible to unauthenticated users */
const AUTH_ONLY_ROUTES = ["/login"];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { supabase, response: supabaseResponse } = createMiddlewareClient(request, response);

  // ── Refresh the session ──────────────────────────────────────────────────
  // IMPORTANT: getUser() is used here (not getSession()) to validate the JWT
  // against Supabase Auth server — prevents session token forgery.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Allow public routes unconditionally ─────────────────────────────────
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    // If authenticated user hits /login → redirect to dashboard
    if (user && AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/incidents", request.url));
    }
    return supabaseResponse;
  }

  // ── Require authentication for all other routes ──────────────────────────
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (png, jpg, svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)).*)",
  ],
};
