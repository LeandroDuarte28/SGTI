"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useSupabase } from "./use-supabase";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

/**
 * Client-side auth state hook.
 * For most cases, prefer reading auth state from Server Components.
 * Use this hook only when you need reactive auth state in a Client Component.
 */
export function useAuth(): UseAuthReturn {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return { user, isLoading, signOut };
}
