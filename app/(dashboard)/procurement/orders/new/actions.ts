"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

interface ItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

function parseItems(formData: FormData): ItemInput[] {
  const descriptions = formData.getAll("item_description");
  const quantities = formData.getAll("item_quantity");
  const prices = formData.getAll("item_unit_price");

  const items: ItemInput[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    const description = descriptions[i];
    if (typeof description !== "string" || description.trim().length === 0) {
      continue;
    }
    const quantity = Number(quantities[i]);
    const unitPrice = Number(prices[i]);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      continue;
    }
    items.push({ description: description.trim(), quantity, unitPrice });
  }
  return items;
}

/**
 * Server Action — creates a purchase order with its line items. Requester
 * is the current user (RLS: "PurchaseOrder: requester can create own").
 */
export async function createPurchaseOrder(formData: FormData): Promise<void> {
  const supplierId = formData.get("supplier_id");
  const notes = formData.get("notes");
  const items = parseItems(formData);

  if (typeof supplierId !== "string" || supplierId.length === 0) {
    throw new Error("Selecione um fornecedor.");
  }
  if (items.length === 0) {
    throw new Error("Adicione ao menos um item ao pedido.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const { data: order, error } = await supabase
    .schema("procurement")
    .from("PurchaseOrder")
    .insert({
      supplier_id: supplierId,
      requested_by: user.id,
      total_amount: totalAmount,
      notes: typeof notes === "string" && notes.trim().length > 0 ? notes.trim() : null,
    })
    .select("id")
    .single();

  if (error || !order) {
    throw new Error(`Não foi possível criar o pedido: ${error?.message ?? "erro desconhecido"}`);
  }

  const { error: itemsError } = await supabase
    .schema("procurement")
    .from("PurchaseOrderItem")
    .insert(
      items.map((item) => ({
        purchase_order_id: order.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    );

  if (itemsError) {
    throw new Error(`Pedido criado, mas não foi possível salvar os itens: ${itemsError.message}`);
  }

  redirect(`/procurement/orders/${order.id}`);
}
