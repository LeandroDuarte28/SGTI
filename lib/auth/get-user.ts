import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants/routes";
import type { AuthUser, SystemRole } from "@/types";

/**
 * Returns the currently authenticated user with their SGTI roles.
 * Must be called from Server Components or Server Actions only.
 *
 * @param redirectIfUnauthenticated - If true, redirects to /login when not authenticated.
 *                                    Set to false when you want to handle the null case manually.
 */
export async function getAuthUser(redirectIfUnauthenticated?: true): Promise<AuthUser>;
export async function getAuthUser(redirectIfUnauthenticated: false): Promise<AuthUser | null>;
export async function getAuthUser(
  redirectIfUnauthenticated: boolean = true,
): Promise<AuthUser | null> {
  const supabase = await createClient();

  // Use getUser() (not getSession()) — validates JWT against Supabase Auth server.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (redirectIfUnauthenticated) {
      redirect(ROUTES.LOGIN);
    }
    return null;
  }

  // Fetch profile + roles from the `shared` schema (not `public` — see
  // supabase/migrations/20260609000000_initial_schema.sql, which creates
  // these tables under CREATE SCHEMA shared). `.schema("shared")` is required
  // because the Supabase client defaults to `public` when omitted.
  const { data: profile } = await supabase
    .schema("shared")
    .from("UserProfile")
    .select("id, email, full_name, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: roleRows } = await supabase
    .schema("shared")
    .from("UserRole")
    .select("role")
    .eq("user_id", user.id);

  const roles: SystemRole[] = (roleRows ?? []).map((r) => r.role as SystemRole);

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? user.email ?? "",
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    roles,
  };
}
