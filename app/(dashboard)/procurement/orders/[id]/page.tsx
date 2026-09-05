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
const STATUS_OPTIONS = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "ORDERED",
  "RECEIVED",
  "CANCELLED",
];

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
        <Link className="text-muted-foreground text-sm hover:underline" href="/procurement">
          ← Voltar para Compras
        </Link>
        <div className="border-border mt-4 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Pedido não encontrado, ou você não tem permissão para vê-lo.
          </p>
        </div>
      </div>
    );
  }

  const [supplierResult, itemsResult, receivingResult] = await Promise.all([
    supabase
      .schema("procurement")
      .from("Supplier")
      .select("name")
      .eq("id", order.supplier_id)
      .single(),
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

  const profileIds = [
    order.requested_by,
    order.approved_by,
    ...receivingRecords.map((r) => r.received_by),
  ].filter((v): v is string => v !== null);
  const { data: profiles } = await supabase
    .schema("shared")
    .from("UserProfile")
    .select("id, full_name")
    .in("id", profileIds.length > 0 ? profileIds : ["00000000-0000-0000-0000-000000000000"]);

  function nameFor(userId: string | null): string {
    if (!userId) {
      return "—";
    }
    return profiles?.find((p) => p.id === userId)?.full_name ?? "Usuário desconhecido";
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link className="text-muted-foreground text-sm hover:underline" href="/procurement">
        ← Voltar para Compras
      </Link>

      <div className="border-border bg-card mt-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-foreground text-xl font-semibold">
            {supplierResult.data?.name ?? "Fornecedor não encontrado"}
          </h1>
          <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Solicitado por {nameFor(order.requested_by)} em {formatDate(order.created_at)}
          {order.approved_by && ` · Aprovado por ${nameFor(order.approved_by)}`}
        </p>
        {order.notes && <p className="text-foreground mt-3 text-sm">{order.notes}</p>}

        <ul className="border-border mt-4 space-y-1 border-t pt-3">
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
        <p className="text-foreground mt-3 text-right text-sm font-medium">
          Total: {formatCurrency(order.total_amount)}
        </p>
      </div>

      {isManager && !["RECEIVED", "CANCELLED"].includes(order.status) && (
        <form
          action={updatePurchaseOrderStatus}
          className="border-border bg-card mt-4 flex items-center gap-2 rounded-lg border p-4"
        >
          <input name="order_id" type="hidden" value={order.id} />
          <select
            className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
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
          <h2 className="text-foreground mb-3 font-medium">Recebimento</h2>
          <ul className="space-y-2">
            {receivingRecords.map((record) => (
              <li
                className="border-border bg-card text-foreground rounded-lg border p-3 text-sm"
                key={record.id}
              >
                Recebido por {nameFor(record.received_by)} em {formatDate(record.received_at)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
