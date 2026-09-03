import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";

import { approveRequest, rejectRequest } from "./actions";

export const metadata: Metadata = { title: "Requisições de Serviço" };

/** Labels the request lifecycle, distinguishing a rejected request (CLOSED, never approved) from one closed after being fulfilled. */
function statusLabel(status: string, approvedAt: string | null): string {
  if (status === "OPEN") {
    return "Aguardando aprovação";
  }
  if (status === "CLOSED" && !approvedAt) {
    return "Rejeitada";
  }
  return (
    { IN_PROGRESS: "Em Andamento", PENDING: "Pendente", RESOLVED: "Concluída", CLOSED: "Fechada" }[
      status
    ] ?? status
  );
}

function statusClass(status: string, approvedAt: string | null): string {
  if (status === "OPEN") {
    return "bg-status-open/10 text-status-open";
  }
  if (status === "CLOSED" && !approvedAt) {
    return "bg-destructive/10 text-destructive";
  }
  return (
    {
      IN_PROGRESS: "bg-status-in-progress/10 text-status-in-progress",
      PENDING: "bg-status-pending/10 text-status-pending",
      RESOLVED: "bg-status-resolved/10 text-status-resolved",
      CLOSED: "bg-status-closed/10 text-status-closed",
    }[status] ?? ""
  );
}

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function RequestsPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  const isItStaff = hasRole(user.roles, IT_STAFF_ROLES);

  const supabase = await createClient();

  // RLS: the requester sees only their own requests; IT staff sees all
  // (see supabase/migrations/20260712000200_ticket_schema.sql policies).
  const [requestsResult, itemsResult] = await Promise.all([
    supabase
      .schema("ticket")
      .from("ServiceRequest")
      .select("id, catalog_item_id, status, approved_at, created_at")
      .order("created_at", { ascending: false }),
    supabase.schema("catalog").from("ServiceCatalogItem").select("id, name"),
  ]);

  const error = requestsResult.error ?? itemsResult.error;
  const requests = requestsResult.data ?? [];
  const items = itemsResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Requisições de Serviço</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe suas solicitações feitas a partir do Catálogo.
          </p>
        </div>
        <div className="flex gap-2">
          {isItStaff && (
            <Button asChild size="sm" variant="outline">
              <a href="/api/reports/requests">Exportar CSV</a>
            </Button>
          )}
          <Button asChild>
            <Link href="/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Requisição
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar as requisições: {error.message}
        </div>
      )}

      {!error && requests.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma requisição encontrada. Solicite um serviço a partir do{" "}
            <a className="underline" href="/catalog">
              Catálogo de Serviços
            </a>
            .
          </p>
        </div>
      )}

      {!error && requests.length > 0 && (
        <ul className="space-y-3">
          {requests.map((request) => {
            const item = items.find((row) => row.id === request.catalog_item_id);
            return (
              <li
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                key={request.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-medium text-foreground">
                    {item?.name ?? "Item de catálogo não encontrado"}
                  </h2>
                  <Pill
                    className={statusClass(request.status, request.approved_at)}
                    label={statusLabel(request.status, request.approved_at)}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Solicitado em {new Date(request.created_at).toLocaleDateString("pt-BR")}
                </p>

                {isItStaff && request.status === "OPEN" && (
                  <div className="mt-3 flex gap-2">
                    <form action={approveRequest}>
                      <input name="request_id" type="hidden" value={request.id} />
                      <Button size="sm" type="submit">
                        Aprovar
                      </Button>
                    </form>
                    <form action={rejectRequest}>
                      <input name="request_id" type="hidden" value={request.id} />
                      <Button size="sm" type="submit" variant="outline">
                        Rejeitar
                      </Button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
