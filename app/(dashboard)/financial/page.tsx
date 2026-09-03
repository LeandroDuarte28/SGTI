import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatDateOnly } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Financeiro" };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const CONTRACT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo",
  EXPIRED: "Expirado",
  TERMINATED: "Encerrado",
  PENDING_RENEWAL: "Aguardando Renovação",
};

const CONTRACT_STATUS_CLASS: Record<string, string> = {
  ACTIVE: "bg-status-resolved/10 text-status-resolved",
  EXPIRED: "bg-destructive/10 text-destructive",
  TERMINATED: "bg-muted text-muted-foreground",
  PENDING_RENEWAL: "bg-priority-medium/10 text-priority-medium",
};

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function FinancialPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: SUPER_ADMIN and IT_MANAGER only (see
  // supabase/migrations/20260712000600_financial_schema.sql).
  const [budgetsResult, contractsResult, expensesResult] = await Promise.all([
    supabase
      .schema("financial")
      .from("Budget")
      .select("id, name, fiscal_year, category, allocated_amount, spent_amount")
      .order("fiscal_year", { ascending: false }),
    supabase
      .schema("financial")
      .from("Contract")
      .select("id, vendor_name, title, category, value, end_date, status")
      .order("end_date"),
    supabase
      .schema("financial")
      .from("Expense")
      .select("id, description, amount, expense_date")
      .order("expense_date", { ascending: false })
      .limit(10),
  ]);

  const error = budgetsResult.error ?? contractsResult.error ?? expensesResult.error;
  const budgets = budgetsResult.data ?? [];
  const contracts = contractsResult.data ?? [];
  const expenses = expensesResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Orçamentos de TI e contratos com fornecedores.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <a href="/api/reports/financial">Exportar CSV</a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/financial/budgets/new">
              <Plus className="mr-2 h-4 w-4" />
              Orçamento
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/financial/contracts/new">
              <Plus className="mr-2 h-4 w-4" />
              Contrato
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/financial/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Despesa
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os dados financeiros: {error.message}
        </div>
      )}

      {!error && budgets.length === 0 && contracts.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum dado financeiro cadastrado ainda, ou você não tem permissão para ver este
            módulo (restrito a Gestores de TI).
          </p>
        </div>
      )}

      {!error && budgets.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-medium text-foreground">Orçamentos</h2>
          <ul className="space-y-2">
            {budgets.map((budget) => {
              const percentUsed =
                budget.allocated_amount > 0
                  ? Math.round((budget.spent_amount / budget.allocated_amount) * 100)
                  : 0;
              return (
                <li
                  className="rounded-lg border border-border bg-card p-4 shadow-sm"
                  key={budget.id}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {budget.name} ({budget.fiscal_year}) · {budget.category}
                    </p>
                    <p className="text-xs text-muted-foreground">{percentUsed}% utilizado</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatCurrency(budget.spent_amount)} de {formatCurrency(budget.allocated_amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!error && contracts.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-foreground">Contratos</h2>
          <ul className="space-y-2">
            {contracts.map((contract) => (
              <li
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
                key={contract.id}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{contract.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {contract.vendor_name} · {formatCurrency(contract.value)}
                    {contract.end_date && ` · até ${formatDateOnly(contract.end_date)}`}
                  </p>
                </div>
                <Pill
                  className={CONTRACT_STATUS_CLASS[contract.status] ?? ""}
                  label={CONTRACT_STATUS_LABEL[contract.status] ?? contract.status}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!error && expenses.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-medium text-foreground">Despesas Recentes</h2>
          <ul className="space-y-2">
            {expenses.map((expense) => (
              <li
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
                key={expense.id}
              >
                <p className="text-sm text-foreground">{expense.description}</p>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(expense.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatDateOnly(expense.expense_date)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
