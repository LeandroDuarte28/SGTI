import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import type { Database } from "./database.types";

/**
 * Creates a Supabase client scoped for Next.js Middleware.
 * Middleware cannot use cookies() from 'next/headers' — it must
 * read/write cookies from the Request/Response directly.
 *
 * Returns both the client and the updated response (with refreshed session cookies).
 *
 * @param request - The incoming NextRequest
 * @param response - The NextResponse to attach cookies to
 */
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
): { supabase: ReturnType<typeof createServerClient<Database>>; response: NextResponse } {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on both request and response to propagate the session.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  return { supabase, response };
}
