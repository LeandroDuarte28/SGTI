import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Identidade e Acesso" };

export default async function IdentityPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: a user sees only their own access grants; IT staff sees everyone's
  // (see supabase/migrations/20260712000400_identity_schema.sql policies).
  const [accessResult, profilesResult] = await Promise.all([
    supabase
      .schema("identity")
      .from("SystemAccess")
      .select("id, user_id, system_name, access_level, granted_at, revoked_at")
      .order("system_name"),
    supabase.schema("shared").from("UserProfile").select("id, full_name"),
  ]);

  const error = accessResult.error ?? profilesResult.error;
  const accessGrants = accessResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Identidade e Acesso</h1>
        <p className="text-sm text-muted-foreground">
          Acessos concedidos a sistemas internos e externos.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os acessos: {error.message}
        </div>
      )}

      {!error && accessGrants.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum acesso concedido encontrado.
          </p>
        </div>
      )}

      {!error && accessGrants.length > 0 && (
        <ul className="space-y-3">
          {accessGrants.map((grant) => {
            const owner = profiles.find((profile) => profile.id === grant.user_id);
            const isRevoked = grant.revoked_at !== null;
            return (
              <li
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                key={grant.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-medium text-foreground">{grant.system_name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {grant.access_level}
                      {owner && ` · ${owner.full_name}`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isRevoked
                        ? "bg-muted text-muted-foreground"
                        : "bg-status-resolved/10 text-status-resolved"
                    }`}
                  >
                    {isRevoked ? "Revogado" : "Ativo"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Concedido em {new Date(grant.granted_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
