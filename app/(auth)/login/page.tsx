/**
 * SGTI — Login Page
 * Sprint 0: Structure placeholder.
 * Full implementation in Phase 03 (Authentication) — 80_IMPLEMENTATION_ORDER.md
 */

export const metadata = { title: "Login" };

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">SGTI</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Sistema de Gestão de Tecnologia da Informação
        </p>
        {/* Phase 03: Add Google OAuth SignIn button here */}
        <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
          Implementação da autenticação prevista para a Fase 03.
        </div>
      </div>
    </main>
  );
}
