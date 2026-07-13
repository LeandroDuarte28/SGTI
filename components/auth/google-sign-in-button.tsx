"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * "Sign in with Google" button. Client Component because it needs to call
 * the browser Supabase client and read window.location.origin.
 */
export function GoogleSignInButton(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignIn(): Promise<void> {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
    // On success, Supabase redirects the browser to Google — no further
    // action needed here; the page will navigate away.
  }

  return (
    <div>
      <Button
        className="w-full"
        disabled={isLoading}
        type="button"
        variant="outline"
        onClick={handleSignIn}
      >
        <svg aria-hidden="true" className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {isLoading ? "Redirecionando..." : "Entrar com Google"}
      </Button>

      {errorMessage && (
        <p className="mt-3 text-center text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
