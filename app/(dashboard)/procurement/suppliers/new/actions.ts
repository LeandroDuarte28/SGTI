"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action — registers a supplier. Restricted to IT_MANAGER+ by RLS
 * ("Supplier: managers can manage").
 */
export async function createSupplier(formData: FormData): Promise<void> {
  const name = formData.get("name");
  const taxId = formData.get("tax_id");
  const contactEmail = formData.get("contact_email");
  const contactPhone = formData.get("contact_phone");

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("O nome é obrigatório.");
  }

  const supabase = await createClient();

  const { error } = await supabase.schema("procurement").from("Supplier").insert({
    name: name.trim(),
    tax_id: typeof taxId === "string" && taxId.trim().length > 0 ? taxId.trim() : null,
    contact_email:
      typeof contactEmail === "string" && contactEmail.trim().length > 0 ? contactEmail.trim() : null,
    contact_phone:
      typeof contactPhone === "string" && contactPhone.trim().length > 0 ? contactPhone.trim() : null,
  });

  if (error) {
    throw new Error(`Não foi possível cadastrar o fornecedor: ${error.message}`);
  }

  redirect("/procurement");
}
