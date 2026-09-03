"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = ["OPEX", "CAPEX"] as const;
type ExpenseCategory = (typeof VALID_CATEGORIES)[number];
function isValidCategory(value: string): value is ExpenseCategory {
  return (VALID_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Server Action — creates a budget. Restricted to IT_MANAGER+ by RLS
 * ("Budget: managers only").
 */
export async function createBudget(formData: FormData): Promise<void> {
  const name = formData.get("name");
  const fiscalYear = formData.get("fiscal_year");
  const category = formData.get("category");
  const allocatedAmount = formData.get("allocated_amount");

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("O nome é obrigatório.");
  }
  const year = Number(fiscalYear);
  if (!Number.isInteger(year)) {
    throw new Error("Ano fiscal inválido.");
  }
  if (typeof category !== "string" || !isValidCategory(category)) {
    throw new Error("Selecione uma categoria válida.");
  }
  const amount = Number(allocatedAmount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Valor alocado inválido.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.schema("financial").from("Budget").insert({
    name: name.trim(),
    fiscal_year: year,
    category,
    allocated_amount: amount,
    owner_id: user.id,
  });

  if (error) {
    throw new Error(`Não foi possível criar o orçamento: ${error.message}`);
  }

  redirect("/financial");
}
