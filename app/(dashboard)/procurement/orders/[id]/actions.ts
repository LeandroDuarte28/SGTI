"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";

const VALID_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "ORDERED",
  "RECEIVED",
  "CANCELLED",
] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];
function isValidStatus(value: string): value is OrderStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["PENDING_APPROVAL", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "CANCELLED"],
  APPROVED: ["ORDERED", "CANCELLED"],
  ORDERED: ["RECEIVED", "CANCELLED"],
  RECEIVED: [],
  CANCELLED: [],
};

/**
 * Updates a purchase order's status. Restricted to IT_MANAGER+ by RLS
 * ("PurchaseOrder: managers can manage all"). Approving stamps
 * approved_by; marking RECEIVED also logs a ReceivingRecord.
 */
export async function updatePurchaseOrderStatus(formData: FormData): Promise<void> {
  const orderId = formData.get("order_id");
  const status = formData.get("status");

  if (typeof orderId !== "string" || orderId.length === 0) {
    throw new Error("Pedido inválido.");
  }
  if (typeof status !== "string" || !isValidStatus(status)) {
    throw new Error("Status inválido.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: order, error: fetchError } = await supabase
    .schema("procurement")
    .from("PurchaseOrder")
    .select("status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    throw new Error(`Não foi possível encontrar o pedido: ${fetchError?.message ?? "não encontrado"}`);
  }

  const currentStatus = order.status as OrderStatus;
  if (!ALLOWED_TRANSITIONS[currentStatus].includes(status)) {
    throw new Error(`Não é possível mudar de "${currentStatus}" para "${status}".`);
  }

  const updates: { status: OrderStatus; approved_by?: string } = { status };
  if (status === "APPROVED") {
    updates.approved_by = user.id;
  }

  const { error } = await supabase
    .schema("procurement")
    .from("PurchaseOrder")
    .update(updates)
    .eq("id", orderId);

  if (error) {
    throw new Error(`Não foi possível atualizar o pedido: ${error.message}`);
  }

  if (status === "RECEIVED") {
    const { error: receivingError } = await supabase.schema("procurement").from("ReceivingRecord").insert({
      purchase_order_id: orderId,
      received_by: user.id,
    });
    if (receivingError) {
      throw new Error(`Pedido marcado como recebido, mas falhou o registro de recebimento: ${receivingError.message}`);
    }
  }

  revalidatePath(`/procurement/orders/${orderId}`);
  revalidatePath("/procurement");
}
