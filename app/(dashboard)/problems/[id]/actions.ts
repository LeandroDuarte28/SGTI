"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"] as const;
type Status = (typeof VALID_STATUSES)[number];

function isValidStatus(value: string): value is Status {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

/**
 * Updates the status of a problem. Restricted to IT staff by RLS
 * ("Problem: IT staff can manage").
 */
export async function updateProblemStatus(formData: FormData): Promise<void> {
  const problemId = formData.get("problem_id");
  const status = formData.get("status");

  if (typeof problemId !== "string" || problemId.length === 0) {
    throw new Error("Problema inválido.");
  }
  if (typeof status !== "string" || !isValidStatus(status)) {
    throw new Error("Status inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase.schema("ticket").from("Problem").update({ status }).eq("id", problemId);

  if (error) {
    throw new Error(`Não foi possível atualizar o status: ${error.message}`);
  }

  revalidatePath(`/problems/${problemId}`);
}

/**
 * Links an incident to a problem and bumps the denormalized
 * related_incident_count (no DB trigger maintains it — see
 * supabase/migrations/20260712000200_ticket_schema.sql). Restricted to IT
 * staff by RLS ("IncidentProblemLink: IT staff only" / "Problem: IT staff
 * can manage").
 */
export async function linkIncident(formData: FormData): Promise<void> {
  const problemId = formData.get("problem_id");
  const incidentId = formData.get("incident_id");

  if (typeof problemId !== "string" || problemId.length === 0) {
    throw new Error("Problema inválido.");
  }
  if (typeof incidentId !== "string" || incidentId.length === 0) {
    throw new Error("Selecione um incidente para vincular.");
  }

  const supabase = await createClient();

  const { error: linkError } = await supabase
    .schema("ticket")
    .from("IncidentProblemLink")
    .insert({ problem_id: problemId, incident_id: incidentId });

  if (linkError) {
    throw new Error(`Não foi possível vincular o incidente: ${linkError.message}`);
  }

  const { data: problem, error: fetchError } = await supabase
    .schema("ticket")
    .from("Problem")
    .select("related_incident_count")
    .eq("id", problemId)
    .single();

  if (!fetchError && problem) {
    await supabase
      .schema("ticket")
      .from("Problem")
      .update({ related_incident_count: problem.related_incident_count + 1 })
      .eq("id", problemId);
  }

  revalidatePath(`/problems/${problemId}`);
  revalidatePath("/problems");
}

/** Unlinks an incident from a problem and decrements the counter. */
export async function unlinkIncident(formData: FormData): Promise<void> {
  const problemId = formData.get("problem_id");
  const incidentId = formData.get("incident_id");

  if (typeof problemId !== "string" || problemId.length === 0) {
    throw new Error("Problema inválido.");
  }
  if (typeof incidentId !== "string" || incidentId.length === 0) {
    throw new Error("Incidente inválido.");
  }

  const supabase = await createClient();

  const { error: unlinkError } = await supabase
    .schema("ticket")
    .from("IncidentProblemLink")
    .delete()
    .eq("problem_id", problemId)
    .eq("incident_id", incidentId);

  if (unlinkError) {
    throw new Error(`Não foi possível desvincular o incidente: ${unlinkError.message}`);
  }

  const { data: problem, error: fetchError } = await supabase
    .schema("ticket")
    .from("Problem")
    .select("related_incident_count")
    .eq("id", problemId)
    .single();

  if (!fetchError && problem) {
    await supabase
      .schema("ticket")
      .from("Problem")
      .update({ related_incident_count: Math.max(0, problem.related_incident_count - 1) })
      .eq("id", problemId);
  }

  revalidatePath(`/problems/${problemId}`);
  revalidatePath("/problems");
}
