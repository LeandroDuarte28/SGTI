import type { Metadata } from "next";
import Image from "next/image";
import { Ticket, Laptop, Clock, Lock } from "lucide-react";

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

const BRAND_HIGHLIGHTS = [
  {
    icon: Ticket,
    iconClassName: "bg-red-400/15 text-red-300",
    label: "Abertura e acompanhamento de chamados em tempo real",
  },
  {
    icon: Laptop,
    iconClassName: "bg-amber-400/15 text-amber-300",
    label: "Inventário completo de ativos e equipamentos",
  },
  {
    icon: Clock,
    iconClassName: "bg-primary/15 text-primary",
    label: "Indicadores de SLA sempre visíveis",
  },
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}): Promise<React.JSX.Element> {
  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? "Ocorreu um erro ao tentar entrar.")
    : null;

  return (
    <main className="flex min-h-screen">
      {/* Painel de marca */}
      <div className="bg-sidebar relative hidden overflow-hidden lg:flex lg:w-[560px] lg:shrink-0 lg:flex-col lg:justify-between lg:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full border border-red-400/30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-16 h-36 w-36 rotate-12 rounded-3xl border border-amber-400/30"
        />

        <div className="relative z-10 flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5">
          <Image
            alt="PinPag"
            className="h-7 w-auto"
            height={28}
            src="/branding/pinpag-logo.jpg"
            width={110}
          />
        </div>

        <div className="relative z-10 flex flex-col gap-12">
          <div className="flex max-w-md flex-col gap-4">
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-white">
              Portal de Tecnologia da Informação
            </h1>
            <p className="text-sidebar-foreground/70 text-base leading-relaxed">
              Acesso centralizado a chamados, ativos e à base de conhecimento da equipe de TI da
              PinPag.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {BRAND_HIGHLIGHTS.map(({ icon: Icon, iconClassName, label }) => (
              <div className="flex items-center gap-3.5" key={label}>
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <span className="text-sidebar-foreground/80 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sidebar-foreground/40 relative z-10 text-xs">
          © 2026 PinPag · Sistema de Gestão de TI
        </p>
      </div>

      {/* Painel de acesso */}
      <div className="bg-background flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">SGTI</span>
            <h2 className="text-foreground text-2xl font-semibold">Bem-vindo de volta</h2>
            <p className="text-muted-foreground text-sm">
              Entre com sua conta Google corporativa para acessar o painel de TI.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
              {errorMessage}
            </div>
          )}

          <GoogleSignInButton />

          <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
            <Lock className="h-3.5 w-3.5" />
            <span>
              Acesso restrito a contas{" "}
              <span className="text-foreground font-semibold">@pinpag.com.br</span>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
