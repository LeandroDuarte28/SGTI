"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function toggleCategoryActive(formData: FormData): Promise<void> {
  const categoryId = formData.get("category_id");
  const isActive = formData.get("is_active");

  if (typeof categoryId !== "string" || typeof isActive !== "string") {
    throw new Error("Dados inválidos.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("catalog")
    .from("ServiceCategory")
    .update({ is_active: isActive === "true" })
    .eq("id", categoryId);

  if (error) {
    throw new Error(`Não foi possível atualizar a categoria: ${error.message}`);
  }

  revalidatePath("/catalog");
}

export async function toggleItemActive(formData: FormData): Promise<void> {
  const itemId = formData.get("item_id");
  const isActive = formData.get("is_active");

  if (typeof itemId !== "string" || typeof isActive !== "string") {
    throw new Error("Dados inválidos.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("catalog")
    .from("ServiceCatalogItem")
    .update({ is_active: isActive === "true" })
    .eq("id", itemId);

  if (error) {
    throw new Error(`Não foi possível atualizar o item: ${error.message}`);
  }

  revalidatePath("/catalog");
}
