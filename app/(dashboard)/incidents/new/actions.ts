"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VALID_PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
type Priority = (typeof VALID_PRIORITIES)[number];

function isValidPriority(value: string): value is Priority {
  return (VALID_PRIORITIES as readonly string[]).includes(value);
}

/**
 * Server Action — creates a new incident reported by the currently
 * authenticated user. RLS (see supabase/migrations/20260712000200_ticket_schema.sql)
 * enforces reporter_id = auth.uid() regardless of what's submitted, but we
 * set it explicitly here too for clarity and to avoid relying solely on RLS
 * to catch a missing value.
 */
export async function createIncident(formData: FormData): Promise<void> {
  const title = formData.get("title");
  const description = formData.get("description");
  const priority = formData.get("priority");
  const categoryId = formData.get("category_id");

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("O título é obrigatório.");
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error("A descrição é obrigatória.");
  }
  if (typeof priority !== "string" || !isValidPriority(priority)) {
    throw new Error("Selecione uma prioridade válida.");
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
    .from("Incident")
    .insert({
      title: title.trim(),
      description: description.trim(),
      priority,
      category_id: typeof categoryId === "string" && categoryId !== "" ? categoryId : null,
      reporter_id: user.id,
    });

  if (error) {
    throw new Error(`Não foi possível criar o incidente: ${error.message}`);
  }

  redirect("/incidents");
}
