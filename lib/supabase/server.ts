import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";

/**
 * Creates a Supabase client for use in Server Components, Route Handlers,
 * Server Actions, and Middleware.
 *
 * Reads and writes cookies to manage the user session automatically.
 * Uses the ANON key — RLS policies enforce data isolation per user.
 *
 * NEVER use the Service Role key here unless you need to bypass RLS intentionally
 * (e.g., admin operations). If you need to bypass RLS, use createAdminClient().
 *
 * @example
 * // In a Server Component:
 * const supabase = await createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 */
export async function createClient(): Promise<ReturnType<typeof createServerClient<Database>>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component — cookies cannot be set.
            // This is expected; the middleware handles session refresh.
          }
        },
      },
    },
  );
}

/**
 * Creates a Supabase client with the Service Role key.
 * BYPASSES all RLS policies — use with extreme caution.
 *
 * Permitted uses:
 * - Supabase Edge Functions
 * - Admin-only Server Actions with explicit role check before calling
 *
 * NEVER expose this client or its key to the browser.
 * NEVER use in Client Components.
 */
export function createAdminClient(): ReturnType<typeof createServerClient<Database>> {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
