"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";

/**
 * Approves an access request: grants (or reactivates) the corresponding
 * SystemAccess row and marks the request APPROVED. Restricted to IT staff
 * by RLS ("AccessRequest: IT staff can manage" / "SystemAccess: IT staff
 * can manage").
 */
export async function approveAccessRequest(formData: FormData): Promise<void> {
  const requestId = formData.get("request_id");
  if (typeof requestId !== "string" || requestId.length === 0) {
    throw new Error("Solicitação inválida.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .schema("identity")
    .from("AccessRequest")
    .select("requester_id, system_name, access_level")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    throw new Error(`Não foi possível encontrar a solicitação: ${fetchError?.message ?? "não encontrada"}`);
  }

  const { error: grantError } = await supabase
    .schema("identity")
    .from("SystemAccess")
    .upsert(
      {
        user_id: request.requester_id,
        system_name: request.system_name,
        access_level: request.access_level,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
        revoked_at: null,
      },
      { onConflict: "user_id,system_name" },
    );

  if (grantError) {
    throw new Error(`Não foi possível conceder o acesso: ${grantError.message}`);
  }

  const { error: updateError } = await supabase
    .schema("identity")
    .from("AccessRequest")
    .update({ status: "APPROVED", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) {
    throw new Error(`Não foi possível atualizar a solicitação: ${updateError.message}`);
  }

  revalidatePath("/identity");
}

/** Rejects an access request. Restricted to IT staff by RLS. */
export async function rejectAccessRequest(formData: FormData): Promise<void> {
  const requestId = formData.get("request_id");
  if (typeof requestId !== "string" || requestId.length === 0) {
    throw new Error("Solicitação inválida.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { error } = await supabase
    .schema("identity")
    .from("AccessRequest")
    .update({ status: "REJECTED", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Não foi possível rejeitar a solicitação: ${error.message}`);
  }

  revalidatePath("/identity");
}
