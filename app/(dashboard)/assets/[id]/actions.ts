"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";

const VALID_STATUSES = ["IN_USE", "IN_STOCK", "IN_MAINTENANCE", "RETIRED", "LOST"] as const;
type AssetStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: string): value is AssetStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

/**
 * Updates the status of an asset. Restricted to IT staff by RLS (see
 * "Asset: IT staff can manage" policy) — a non-staff user submitting this
 * will get a Postgres RLS rejection, not a silent no-op.
 */
export async function updateAssetStatus(formData: FormData): Promise<void> {
  const assetId = formData.get("asset_id");
  const status = formData.get("status");

  if (typeof assetId !== "string" || assetId.length === 0) {
    throw new Error("Ativo inválido.");
  }
  if (typeof status !== "string" || !isValidStatus(status)) {
    throw new Error("Status inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase.schema("asset").from("Asset").update({ status }).eq("id", assetId);

  if (error) {
    throw new Error(`Não foi possível atualizar o status: ${error.message}`);
  }

  revalidatePath(`/assets/${assetId}`);
}

/**
 * Reassigns an asset to a different user, or unassigns it. Restricted to IT
 * staff by RLS.
 */
export async function reassignAsset(formData: FormData): Promise<void> {
  const assetId = formData.get("asset_id");
  const assignedTo = formData.get("assigned_to");

  if (typeof assetId !== "string" || assetId.length === 0) {
    throw new Error("Ativo inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("asset")
    .from("Asset")
    .update({ assigned_to: typeof assignedTo === "string" && assignedTo !== "" ? assignedTo : null })
    .eq("id", assetId);

  if (error) {
    throw new Error(`Não foi possível atribuir o ativo: ${error.message}`);
  }

  revalidatePath(`/assets/${assetId}`);
}

/**
 * Adds a maintenance record to an asset's history. Restricted to IT staff by
 * RLS (see "AssetMaintenanceRecord: IT staff only" policy).
 */
export async function addMaintenanceRecord(formData: FormData): Promise<void> {
  const assetId = formData.get("asset_id");
  const description = formData.get("description");
  const cost = formData.get("cost");

  if (typeof assetId !== "string" || assetId.length === 0) {
    throw new Error("Ativo inválido.");
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error("Descreva o serviço de manutenção realizado.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const parsedCost = typeof cost === "string" && cost.trim().length > 0 ? Number(cost) : null;
  if (parsedCost !== null && !Number.isFinite(parsedCost)) {
    throw new Error("Custo inválido.");
  }

  const { error } = await supabase.schema("asset").from("AssetMaintenanceRecord").insert({
    asset_id: assetId,
    description: description.trim(),
    performed_by: user.id,
    cost: parsedCost,
  });

  if (error) {
    throw new Error(`Não foi possível registrar a manutenção: ${error.message}`);
  }

  revalidatePath(`/assets/${assetId}`);
}
