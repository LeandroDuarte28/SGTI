"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createServiceCategory(formData: FormData): Promise<void> {
  const name = formData.get("name");
  const description = formData.get("description");
  const sortOrder = formData.get("sort_order");

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("O nome é obrigatório.");
  }

  const supabase = await createClient();

  const { error } = await supabase.schema("catalog").from("ServiceCategory").insert({
    name: name.trim(),
    description: typeof description === "string" && description.trim().length > 0 ? description.trim() : null,
    sort_order: typeof sortOrder === "string" && sortOrder !== "" ? Number(sortOrder) : 0,
  });

  if (error) {
    throw new Error(`Não foi possível criar a categoria: ${error.message}`);
  }

  redirect("/catalog");
}
