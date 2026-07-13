import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Handles the OAuth redirect from Google via Supabase Auth.
 * Exchanges the authorization code for a session and redirects the user.
 *
 * Flow:
 * 1. Google → Supabase Auth → /auth/callback?code=...
 * 2. Exchange code for session (sets HttpOnly cookies)
 * 3. Redirect to: ?redirectTo param, or /incidents (default dashboard)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") ?? "/incidents";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // ─── OAuth error returned by Google ─────────────────────────────────────
  if (error) {
    console.error("[auth/callback] OAuth error:", error, errorDescription);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", error);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Exchange code for session ──────────────────────────────────────────
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[auth/callback] Code exchange error:", exchangeError.message);
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", "auth_failed");
      return NextResponse.redirect(loginUrl);
    }

    // ─── Redirect to intended destination ─────────────────────────────────
    // Sanitize redirectTo to prevent open redirect attacks.
    // Only allow relative paths (no external URLs).
    const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/incidents";
    return NextResponse.redirect(new URL(safeRedirect, origin));
  }

  // ─── No code or error — redirect to login ───────────────────────────────
  return NextResponse.redirect(new URL("/login", origin));
}
