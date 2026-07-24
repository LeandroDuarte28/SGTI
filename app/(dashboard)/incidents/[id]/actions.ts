"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";

const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"] as const;
type Status = (typeof VALID_STATUSES)[number];

function isValidStatus(value: string): value is Status {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

/** Adds a public comment to an incident. Any authenticated participant can comment. */
export async function addComment(formData: FormData): Promise<void> {
  const incidentId = formData.get("incident_id");
  const body = formData.get("body");

  if (typeof incidentId !== "string" || incidentId.length === 0) {
    throw new Error("Incidente inválido.");
  }
  if (typeof body !== "string" || body.trim().length === 0) {
    throw new Error("O comentário não pode ficar vazio.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { error } = await supabase.schema("ticket").from("TicketComment").insert({
    ticket_type: "INCIDENT",
    ticket_id: incidentId,
    author_id: user.id,
    body: body.trim(),
    is_internal: false,
  });

  if (error) {
    throw new Error(`Não foi possível adicionar o comentário: ${error.message}`);
  }

  revalidatePath(`/incidents/${incidentId}`);
}

/**
 * Updates the status of an incident. Restricted to IT staff by RLS (see
 * "Incident: IT staff can update" policy) — a non-staff user submitting
 * this will get a Postgres RLS rejection, not a silent no-op.
 */
export async function updateStatus(formData: FormData): Promise<void> {
  const incidentId = formData.get("incident_id");
  const status = formData.get("status");

  if (typeof incidentId !== "string" || incidentId.length === 0) {
    throw new Error("Incidente inválido.");
  }
  if (typeof status !== "string" || !isValidStatus(status)) {
    throw new Error("Status inválido.");
  }

  const supabase = await createClient();
  const updates: { status: Status; resolved_at?: string; closed_at?: string } = { status };
  if (status === "RESOLVED") {
    updates.resolved_at = new Date().toISOString();
  }
  if (status === "CLOSED") {
    updates.closed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .schema("ticket")
    .from("Incident")
    .update(updates)
    .eq("id", incidentId);

  if (error) {
    throw new Error(`Não foi possível atualizar o status: ${error.message}`);
  }

  revalidatePath(`/incidents/${incidentId}`);
}

/** Assigns the incident to the currently authenticated (IT staff) user. */
export async function assignToMe(formData: FormData): Promise<void> {
  const incidentId = formData.get("incident_id");
  if (typeof incidentId !== "string" || incidentId.length === 0) {
    throw new Error("Incidente inválido.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { error } = await supabase
    .schema("ticket")
    .from("Incident")
    .update({ assignee_id: user.id })
    .eq("id", incidentId);

  if (error) {
    throw new Error(`Não foi possível atribuir o incidente: ${error.message}`);
  }

  revalidatePath(`/incidents/${incidentId}`);
}
