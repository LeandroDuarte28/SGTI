"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action — creates a service request from the Catalog, submitted by
 * the currently authenticated user. RLS (see
 * supabase/migrations/20260712000200_ticket_schema.sql) enforces
 * requester_id = auth.uid() regardless of what's submitted, but we set it
 * explicitly here too for clarity and to avoid relying solely on RLS to
 * catch a missing value.
 */
export async function createServiceRequest(formData: FormData): Promise<void> {
  const catalogItemId = formData.get("catalog_item_id");
  const justification = formData.get("justification");

  if (typeof catalogItemId !== "string" || catalogItemId.length === 0) {
    throw new Error("Selecione um item do catálogo.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .schema("ticket")
    .from("ServiceRequest")
    .insert({
      catalog_item_id: catalogItemId,
      justification:
        typeof justification === "string" && justification.trim().length > 0
          ? justification.trim()
          : null,
      requester_id: user.id,
    });

  if (error) {
    throw new Error(`Não foi possível enviar a requisição: ${error.message}`);
  }

  redirect("/requests");
}
