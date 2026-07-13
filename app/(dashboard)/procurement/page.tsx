import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Compras" };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_APPROVAL: "Aguardando Aprovação",
  APPROVED: "Aprovado",
  ORDERED: "Pedido Realizado",
  RECEIVED: "Recebido",
  CANCELLED: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_APPROVAL: "bg-priority-medium/10 text-priority-medium",
  APPROVED: "bg-status-in-progress/10 text-status-in-progress",
  ORDERED: "bg-status-pending/10 text-status-pending",
  RECEIVED: "bg-status-resolved/10 text-status-resolved",
  CANCELLED: "bg-destructive/10 text-destructive",
};

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function ProcurementPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: the requester sees only their own purchase orders; IT managers see
  // all (see supabase/migrations/20260712000700_procurement_schema.sql).
  const [ordersResult, suppliersResult] = await Promise.all([
    supabase
      .schema("procurement")
      .from("PurchaseOrder")
      .select("id, supplier_id, status, total_amount, created_at")
      .order("created_at", { ascending: false }),
    supabase.schema("procurement").from("Supplier").select("id, name"),
  ]);

  const error = ordersResult.error ?? suppliersResult.error;
  const orders = ordersResult.data ?? [];
  const suppliers = suppliersResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Compras</h1>
        <p className="text-sm text-muted-foreground">Pedidos de compra e fornecedores.</p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os pedidos de compra: {error.message}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhum pedido de compra encontrado.</p>
        </div>
      )}

      {!error && orders.length > 0 && (
        <ul className="space-y-3">
          {orders.map((order) => {
            const supplier = suppliers.find((row) => row.id === order.supplier_id);
            return (
              <li className="rounded-lg border border-border bg-card p-4 shadow-sm" key={order.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-medium text-foreground">
                      {supplier?.name ?? "Fornecedor não encontrado"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                  <Pill
                    className={STATUS_CLASS[order.status] ?? ""}
                    label={STATUS_LABEL[order.status] ?? order.status}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Criado em {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
