"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createServiceCatalogItem(formData: FormData): Promise<void> {
  const categoryId = formData.get("category_id");
  const name = formData.get("name");
  const description = formData.get("description");
  const defaultSlaId = formData.get("default_sla_id");
  const estimatedDeliveryDays = formData.get("estimated_delivery_days");

  if (typeof categoryId !== "string" || categoryId.trim().length === 0) {
    throw new Error("A categoria é obrigatória.");
  }
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("O nome é obrigatório.");
  }

  const supabase = await createClient();

  const { error } = await supabase.schema("catalog").from("ServiceCatalogItem").insert({
    category_id: categoryId,
    name: name.trim(),
    description: typeof description === "string" && description.trim().length > 0 ? description.trim() : null,
    default_sla_id: typeof defaultSlaId === "string" && defaultSlaId !== "" ? defaultSlaId : null,
    estimated_delivery_days:
      typeof estimatedDeliveryDays === "string" && estimatedDeliveryDays !== "" ? Number(estimatedDeliveryDays) : null,
  });

  if (error) {
    throw new Error(`Não foi possível criar o item do catálogo: ${error.message}`);
  }

  redirect("/catalog");
}
