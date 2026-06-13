import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Creates an admin Supabase client for Edge Functions.
 * Uses the Service Role key — bypasses RLS.
 * NEVER expose this client or key outside of Edge Functions.
 */
export function createAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("[Edge Function] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
