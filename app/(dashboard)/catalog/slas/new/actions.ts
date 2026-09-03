"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type TicketPriority = Database["catalog"]["Enums"]["TicketPriority"];

const VALID_PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

function isValidPriority(value: string): value is TicketPriority {
  return (VALID_PRIORITIES as readonly string[]).includes(value);
}

export async function createSlaDefinition(formData: FormData): Promise<void> {
  const name = formData.get("name");
  const priority = formData.get("priority");
  const responseTimeMinutes = formData.get("response_time_minutes");
  const resolutionTimeMinutes = formData.get("resolution_time_minutes");
  const businessHoursOnly = formData.get("business_hours_only");

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("O nome é obrigatório.");
  }
  if (typeof priority !== "string" || !isValidPriority(priority)) {
    throw new Error("Prioridade inválida.");
  }
  if (typeof responseTimeMinutes !== "string" || Number(responseTimeMinutes) <= 0) {
    throw new Error("O tempo de resposta deve ser maior que zero.");
  }
  if (typeof resolutionTimeMinutes !== "string" || Number(resolutionTimeMinutes) <= 0) {
    throw new Error("O tempo de resolução deve ser maior que zero.");
  }

  const supabase = await createClient();

  const { error } = await supabase.schema("catalog").from("SLADefinition").insert({
    name: name.trim(),
    priority,
    response_time_minutes: Number(responseTimeMinutes),
    resolution_time_minutes: Number(resolutionTimeMinutes),
    business_hours_only: businessHoursOnly === "on",
  });

  if (error) {
    throw new Error(`Não foi possível criar a definição de SLA: ${error.message}`);
  }

  redirect("/catalog");
}
