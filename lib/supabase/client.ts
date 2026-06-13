import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";

/**
 * Creates a Supabase client for use in Client Components (browser).
 *
 * USAGE: Call inside a Client Component or a custom hook.
 * Do NOT use this in Server Components or Server Actions — use server.ts instead.
 *
 * The client uses the ANON key and relies on RLS for security.
 * The Service Role key is NEVER exposed to the browser.
 *
 * @example
 * const supabase = createClient();
 * const { data, error } = await supabase.from('incidents').select('*');
 */
export function createClient(): ReturnType<typeof createBrowserClient<Database>> {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
