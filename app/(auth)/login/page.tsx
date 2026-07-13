import type { Metadata } from "next";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export const metadata: Metadata = { title: "Login" };

/**
 * Maps error codes set by app/(auth)/auth/callback/route.ts and
 * middleware.ts into user-friendly Portuguese messages.
 */
const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "Não foi possível concluir o login. Tente novamente.",
  access_denied: "Acesso negado pelo Google. Verifique se você está usando uma conta autorizada.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}): Promise<React.JSX.Element> {
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Ocorreu um erro ao tentar entrar.") : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">SGTI</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Sistema de Gestão de Tecnologia da Informação
        </p>

        {errorMessage && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <GoogleSignInButton />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Acesso restrito a contas @pinpag.com.br
        </p>
      </div>
    </main>
  );
}
