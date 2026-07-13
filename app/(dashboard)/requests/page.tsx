import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Requisições de Serviço" };

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em Andamento",
  PENDING: "Pendente",
  RESOLVED: "Concluída",
  CLOSED: "Fechada",
};

const STATUS_CLASS: Record<string, string> = {
  OPEN: "bg-status-open/10 text-status-open",
  IN_PROGRESS: "bg-status-in-progress/10 text-status-in-progress",
  PENDING: "bg-status-pending/10 text-status-pending",
  RESOLVED: "bg-status-resolved/10 text-status-resolved",
  CLOSED: "bg-status-closed/10 text-status-closed",
};

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function RequestsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: the requester sees only their own requests; IT staff sees all
  // (see supabase/migrations/20260712000200_ticket_schema.sql policies).
  const [requestsResult, itemsResult] = await Promise.all([
    supabase
      .schema("ticket")
      .from("ServiceRequest")
      .select("id, catalog_item_id, status, created_at")
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
        <Button disabled title="Solicite a partir do Catálogo de Serviços">
          <Plus className="mr-2 h-4 w-4" />
          Nova Requisição
        </Button>
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
                    className={STATUS_CLASS[request.status] ?? ""}
                    label={STATUS_LABEL[request.status] ?? request.status}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Solicitado em {new Date(request.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
