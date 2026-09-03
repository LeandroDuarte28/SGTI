import { createClient } from "@/lib/supabase/server";
import { csvResponse, toCsv } from "@/lib/utils/csv";
import { formatDateOnly } from "@/lib/utils/format-date";

export async function GET(): Promise<Response> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: expenses, error } = await supabase
    .schema("financial")
    .from("Expense")
    .select("id, description, amount, expense_date, budget_id")
    .order("expense_date", { ascending: false });

  if (error || !expenses) {
    return new Response(`Erro ao gerar relatório: ${error?.message ?? "desconhecido"}`, { status: 500 });
  }

  const { data: budgets } = await supabase
    .schema("financial")
    .from("Budget")
    .select("id, name")
    .in("id", [...new Set(expenses.map((e) => e.budget_id).filter((id): id is string => !!id))]);
  const budgetNames = new Map((budgets ?? []).map((b) => [b.id, b.name]));

  const rows = expenses.map((e) => ({
    description: e.description,
    amount: e.amount,
    expense_date: formatDateOnly(e.expense_date),
    budget: e.budget_id ? (budgetNames.get(e.budget_id) ?? e.budget_id) : "",
  }));

  const csv = toCsv(rows, [
    { key: "description", label: "Descrição" },
    { key: "amount", label: "Valor" },
    { key: "expense_date", label: "Data" },
    { key: "budget", label: "Orçamento" },
  ]);

  await supabase
    .schema("shared")
    .from("AuditLog")
    .insert({ user_id: user.id, action: "REPORT_EXPORTED", entity_type: "Expense", new_values: { format: "csv", rows: rows.length } });

  return csvResponse("despesas.csv", csv);
}
