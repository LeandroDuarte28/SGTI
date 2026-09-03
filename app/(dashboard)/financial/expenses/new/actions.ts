"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action — records an expense. Restricted to IT_MANAGER+ by RLS
 * ("Expense: managers only"). When linked to a budget, bumps that budget's
 * spent_amount — the schema has no trigger to keep this in sync, so the
 * application does it here.
 */
export async function createExpense(formData: FormData): Promise<void> {
  const budgetId = formData.get("budget_id");
  const contractId = formData.get("contract_id");
  const description = formData.get("description");
  const amount = formData.get("amount");
  const expenseDate = formData.get("expense_date");

  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error("A descrição é obrigatória.");
  }
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error("Valor inválido.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const resolvedBudgetId = typeof budgetId === "string" && budgetId !== "" ? budgetId : null;

  const { error } = await supabase.schema("financial").from("Expense").insert({
    budget_id: resolvedBudgetId,
    contract_id: typeof contractId === "string" && contractId !== "" ? contractId : null,
    description: description.trim(),
    amount: parsedAmount,
    expense_date:
      typeof expenseDate === "string" && expenseDate.length > 0
        ? expenseDate
        : new Date().toISOString().slice(0, 10),
    approved_by: user.id,
  });

  if (error) {
    throw new Error(`Não foi possível registrar a despesa: ${error.message}`);
  }

  if (resolvedBudgetId) {
    const { data: budget, error: fetchError } = await supabase
      .schema("financial")
      .from("Budget")
      .select("spent_amount")
      .eq("id", resolvedBudgetId)
      .single();

    if (!fetchError && budget) {
      await supabase
        .schema("financial")
        .from("Budget")
        .update({ spent_amount: Number(budget.spent_amount) + parsedAmount })
        .eq("id", resolvedBudgetId);
    }
  }

  redirect("/financial");
}
