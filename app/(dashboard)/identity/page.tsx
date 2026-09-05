import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";

import { approveAccessRequest, rejectAccessRequest } from "./actions";

export const metadata: Metadata = { title: "Identidade e Acesso" };

const REQUEST_STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando aprovação",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
  REVOKED: "Revogada",
};

const REQUEST_STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-status-open/10 text-status-open",
  APPROVED: "bg-status-resolved/10 text-status-resolved",
  REJECTED: "bg-destructive/10 text-destructive",
  REVOKED: "bg-muted text-muted-foreground",
};

export default async function IdentityPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  const isItStaff = hasRole(user.roles, IT_STAFF_ROLES);

  const supabase = await createClient();

  // RLS: a user sees only their own access grants/requests; IT staff sees
  // everyone's (see supabase/migrations/20260712000400_identity_schema.sql).
  const [accessResult, requestsResult, profilesResult] = await Promise.all([
    supabase
      .schema("identity")
      .from("SystemAccess")
      .select("id, user_id, system_name, access_level, granted_at, revoked_at")
      .order("system_name"),
    supabase
      .schema("identity")
      .from("AccessRequest")
      .select("id, requester_id, system_name, access_level, justification, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.schema("shared").from("UserProfile").select("id, full_name"),
  ]);

  const error = accessResult.error ?? requestsResult.error ?? profilesResult.error;
  const accessGrants = accessResult.data ?? [];
  const accessRequests = requestsResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  function nameFor(userId: string): string {
    return profiles.find((p) => p.id === userId)?.full_name ?? "Usuário desconhecido";
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Identidade e Acesso</h1>
          <p className="text-muted-foreground text-sm">
            Acessos concedidos a sistemas internos e externos.
          </p>
        </div>
        <Button asChild>
          <Link href="/identity/new">
            <Plus className="mr-2 h-4 w-4" />
            Solicitar Acesso
          </Link>
        </Button>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
          Não foi possível carregar os acessos: {error.message}
        </div>
      )}

      {!error && accessGrants.length === 0 && (
        <div className="border-border rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">Nenhum acesso concedido encontrado.</p>
        </div>
      )}

      {!error && accessGrants.length > 0 && (
        <ul className="space-y-3">
          {accessGrants.map((grant) => {
            const owner = profiles.find((profile) => profile.id === grant.user_id);
            const isRevoked = grant.revoked_at !== null;
            return (
              <li className="border-border bg-card rounded-lg border p-4 shadow-sm" key={grant.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-foreground font-medium">{grant.system_name}</h2>
                    <p className="text-muted-foreground text-xs">
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
                <p className="text-muted-foreground mt-2 text-xs">
                  Concedido em {new Date(grant.granted_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-8">
        <h2 className="text-foreground mb-3 font-medium">Solicitações de Acesso</h2>

        {accessRequests.length === 0 && (
          <div className="border-border rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">Nenhuma solicitação encontrada.</p>
          </div>
        )}

        {accessRequests.length > 0 && (
          <ul className="space-y-3">
            {accessRequests.map((request) => (
              <li
                className="border-border bg-card rounded-lg border p-4 shadow-sm"
                key={request.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-foreground font-medium">
                      {request.system_name} · {request.access_level}
                    </h3>
                    {isItStaff && (
                      <p className="text-muted-foreground text-xs">
                        Solicitado por {nameFor(request.requester_id)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      REQUEST_STATUS_CLASS[request.status] ?? ""
                    }`}
                  >
                    {REQUEST_STATUS_LABEL[request.status] ?? request.status}
                  </span>
                </div>
                <p className="text-foreground mt-1 text-sm">{request.justification}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Solicitado em {new Date(request.created_at).toLocaleDateString("pt-BR")}
                </p>

                {isItStaff && request.status === "PENDING" && (
                  <div className="mt-3 flex gap-2">
                    <form action={approveAccessRequest}>
                      <input name="request_id" type="hidden" value={request.id} />
                      <Button size="sm" type="submit">
                        Aprovar
                      </Button>
                    </form>
                    <form action={rejectAccessRequest}>
                      <input name="request_id" type="hidden" value={request.id} />
                      <Button size="sm" type="submit" variant="outline">
                        Rejeitar
                      </Button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
