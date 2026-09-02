"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";

/**
 * Approves a service request. Restricted to IT staff by RLS (see
 * "ServiceRequest: IT staff can update" policy) — a non-staff user
 * submitting this will get a Postgres RLS rejection, not a silent no-op.
 */
export async function approveRequest(formData: FormData): Promise<void> {
  const requestId = formData.get("request_id");
  if (typeof requestId !== "string" || requestId.length === 0) {
    throw new Error("Requisição inválida.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { error } = await supabase
    .schema("ticket")
    .from("ServiceRequest")
    .update({ status: "IN_PROGRESS", approved_by: user.id, approved_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Não foi possível aprovar a requisição: ${error.message}`);
  }

  revalidatePath("/requests");
}

/** Rejects a service request. Restricted to IT staff by RLS. */
export async function rejectRequest(formData: FormData): Promise<void> {
  const requestId = formData.get("request_id");
  if (typeof requestId !== "string" || requestId.length === 0) {
    throw new Error("Requisição inválida.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .schema("ticket")
    .from("ServiceRequest")
    .update({ status: "CLOSED" })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Não foi possível rejeitar a requisição: ${error.message}`);
  }

  revalidatePath("/requests");
}
