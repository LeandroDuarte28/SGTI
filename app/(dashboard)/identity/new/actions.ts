"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action — creates an access request submitted by the currently
 * authenticated user. RLS ("AccessRequest: requester can create own") enforces
 * requester_id = auth.uid() regardless of what's submitted, but we set it
 * explicitly here too for clarity.
 */
export async function createAccessRequest(formData: FormData): Promise<void> {
  const systemName = formData.get("system_name");
  const accessLevel = formData.get("access_level");
  const justification = formData.get("justification");

  if (typeof systemName !== "string" || systemName.trim().length === 0) {
    throw new Error("O sistema é obrigatório.");
  }
  if (typeof accessLevel !== "string" || accessLevel.trim().length === 0) {
    throw new Error("O nível de acesso é obrigatório.");
  }
  if (typeof justification !== "string" || justification.trim().length === 0) {
    throw new Error("A justificativa é obrigatória.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.schema("identity").from("AccessRequest").insert({
    requester_id: user.id,
    system_name: systemName.trim(),
    access_level: accessLevel.trim(),
    justification: justification.trim(),
  });

  if (error) {
    throw new Error(`Não foi possível enviar a solicitação: ${error.message}`);
  }

  redirect("/identity");
}
