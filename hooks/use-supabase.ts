"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Returns a memoized Supabase browser client.
 * Use in Client Components that need to interact with Supabase directly
 * (e.g., Realtime subscriptions, file uploads).
 *
 * For data fetching, prefer Server Components + server.ts client.
 */
export function useSupabase() {
  return useMemo(() => createClient(), []);
}
