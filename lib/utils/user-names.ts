import type { createClient } from "@/lib/supabase/server";

/** Resolves a set of shared.UserProfile ids to a Map of id -> full_name, for CSV/report display. */
export async function fetchUserNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(ids.filter((id): id is string => !!id))];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data } = await supabase.schema("shared").from("UserProfile").select("id, full_name").in("id", uniqueIds);
  return new Map((data ?? []).map((row) => [row.id as string, row.full_name as string]));
}
