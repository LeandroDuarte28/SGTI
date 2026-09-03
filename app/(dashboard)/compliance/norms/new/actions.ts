"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VALID_TYPES = ["INTERNATIONAL", "REGULATORY_BR", "FRAMEWORK", "INTERNAL"] as const;
type NormType = (typeof VALID_TYPES)[number];

function isValidType(value: string): value is NormType {
  return (VALID_TYPES as readonly string[]).includes(value);
}

/**
 * Server Action — registers a norm/standard. Restricted to IT_MANAGER+ by
 * RLS ("Norm: managers can manage").
 */
export async function createNorm(formData: FormData): Promise<void> {
  const code = formData.get("code");
  const fullName = formData.get("full_name");
  const issuingBody = formData.get("issuing_body");
  const type = formData.get("type");

  if (typeof code !== "string" || code.trim().length === 0) {
    throw new Error("O código é obrigatório.");
  }
  if (typeof fullName !== "string" || fullName.trim().length === 0) {
    throw new Error("O nome completo é obrigatório.");
  }
  if (typeof issuingBody !== "string" || issuingBody.trim().length === 0) {
    throw new Error("O órgão emissor é obrigatório.");
  }
  if (typeof type !== "string" || !isValidType(type)) {
    throw new Error("Selecione um tipo válido.");
  }

  const supabase = await createClient();

  const { error } = await supabase.schema("compliance").from("Norm").insert({
    code: code.trim().toUpperCase().replace(/\s+/g, "_"),
    full_name: fullName.trim(),
    issuing_body: issuingBody.trim(),
    type,
  });

  if (error) {
    throw new Error(`Não foi possível cadastrar a norma: ${error.message}`);
  }

  redirect("/compliance/norms");
}
