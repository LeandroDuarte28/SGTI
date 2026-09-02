"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action — creates a new problem. Restricted to IT staff by RLS
 * ("Problem: IT staff can manage") — a non-staff user submitting this will
 * get a Postgres RLS rejection, not a silent no-op.
 */
export async function createProblem(formData: FormData): Promise<void> {
  const title = formData.get("title");
  const description = formData.get("description");
  const rootCause = formData.get("root_cause");
  const isKnownError = formData.get("is_known_error") === "on";

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("O título é obrigatório.");
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error("A descrição é obrigatória.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: problem, error } = await supabase
    .schema("ticket")
    .from("Problem")
    .insert({
      title: title.trim(),
      description: description.trim(),
      root_cause: typeof rootCause === "string" && rootCause.trim().length > 0 ? rootCause.trim() : null,
      is_known_error: isKnownError,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error || !problem) {
    throw new Error(`Não foi possível criar o problema: ${error?.message ?? "erro desconhecido"}`);
  }

  redirect(`/problems/${problem.id}`);
}
