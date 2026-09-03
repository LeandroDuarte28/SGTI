import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole } from "@/lib/constants/roles";
import { formatDate } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";

import { updatePurchaseOrderStatus } from "./actions";

export const metadata: Metadata = { title: "Detalhe do Pedido" };

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
const STATUS_OPTIONS = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "ORDERED", "RECEIVED", "CANCELLED"];

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const user = await getAuthUser();
  const isManager = hasRole(user.roles, ADMIN_ROLES);

  const supabase = await createClient();

  const { data: order, error } = await supabase
    .schema("procurement")
    .from("PurchaseOrder")
    .select("id, supplier_id, requested_by, approved_by, status, total_amount, notes, created_at")
    .eq("id", id)
    .single();

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link className="text-sm text-muted-foreground hover:underline" href="/procurement">
          ← Voltar para Compras
        </Link>
        <div className="mt-4 rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Pedido não encontrado, ou você não tem permissão para vê-lo.
          </p>
        </div>
      </div>
    );
  }

  const [supplierResult, itemsResult, receivingResult] = await Promise.all([
    supabase.schema("procurement").from("Supplier").select("name").eq("id", order.supplier_id).single(),
    supabase
      .schema("procurement")
      .from("PurchaseOrderItem")
      .select("id, description, quantity, unit_price")
      .eq("purchase_order_id", id),
    supabase
      .schema("procurement")
      .from("ReceivingRecord")
      .select("id, received_by, received_at")
      .eq("purchase_order_id", id)
      .order("received_at", { ascending: false }),
  ]);

  const items = itemsResult.data ?? [];
  const receivingRecords = receivingResult.data ?? [];

  const profileIds = [order.requested_by, order.approved_by, ...receivingRecords.map((r) => r.received_by)].filter(
    (v): v is string => v !== null,
  );
  const { data: profiles } = await supabase
    .schema("shared")
    .from("UserProfile")
    .select("id, full_name")
    .in("id", profileIds.length > 0 ? profileIds : ["00000000-0000-0000-0000-000000000000"]);

  function nameFor(userId: string | null): string {
    if (!userId) {return "—";}
    return profiles?.find((p) => p.id === userId)?.full_name ?? "Usuário desconhecido";
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link className="text-sm text-muted-foreground hover:underline" href="/procurement">
        ← Voltar para Compras
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-foreground">
            {supplierResult.data?.name ?? "Fornecedor não encontrado"}
          </h1>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Solicitado por {nameFor(order.requested_by)} em {formatDate(order.created_at)}
          {order.approved_by && ` · Aprovado por ${nameFor(order.approved_by)}`}
        </p>
        {order.notes && <p className="mt-3 text-sm text-foreground">{order.notes}</p>}

        <ul className="mt-4 space-y-1 border-t border-border pt-3">
          {items.map((item) => (
            <li className="flex items-center justify-between text-sm" key={item.id}>
              <span className="text-foreground">
                {item.quantity}× {item.description}
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(item.quantity * item.unit_price)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-sm font-medium text-foreground">
          Total: {formatCurrency(order.total_amount)}
        </p>
      </div>

      {isManager && !["RECEIVED", "CANCELLED"].includes(order.status) && (
        <form
          action={updatePurchaseOrderStatus}
          className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card p-4"
        >
          <input name="order_id" type="hidden" value={order.id} />
          <select
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
            defaultValue={order.status}
            key={order.status}
            name="status"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
          <Button size="sm" type="submit">
            Atualizar status
          </Button>
        </form>
      )}

      {receivingRecords.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-medium text-foreground">Recebimento</h2>
          <ul className="space-y-2">
            {receivingRecords.map((record) => (
              <li className="rounded-lg border border-border bg-card p-3 text-sm text-foreground" key={record.id}>
                Recebido por {nameFor(record.received_by)} em {formatDate(record.received_at)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
