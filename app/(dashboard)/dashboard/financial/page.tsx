import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole } from "@/lib/constants/roles";
import { formatCurrency, formatPercent, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard Financeiro" };

export default async function FinancialDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, ADMIN_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const in90Days = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const [budgetsResult, expensesThisMonthResult, contractsExpiringResult, unapprovedExpensesResult] = await Promise.all([
    supabase.schema("financial").from("Budget").select("allocated_amount, spent_amount, category"),
    supabase.schema("financial").from("Expense").select("amount").gte("expense_date", monthStart),
    supabase.schema("financial").from("Contract").select("id").eq("status", "ACTIVE").gte("end_date", today).lte("end_date", in90Days),
    supabase.schema("financial").from("Expense").select("id").is("approved_by", null),
  ]);

  const budgets = budgetsResult.data ?? [];
  const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount), 0);
  const opexSpent = budgets.filter((b) => b.category === "OPEX").reduce((sum, b) => sum + Number(b.spent_amount), 0);
  const capexSpent = budgets.filter((b) => b.category === "CAPEX").reduce((sum, b) => sum + Number(b.spent_amount), 0);
  const expensesThisMonth = (expensesThisMonthResult.data ?? []).reduce((sum, e) => sum + Number(e.amount), 0);
  const percentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : NaN;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard Financeiro</h1>
        <p className="text-sm text-muted-foreground">Desempenho financeiro de TI — orçado vs. realizado.</p>
      </div>

      <Section title="Orçamento">
        <StatCard href="/financial" label="Alocado (Total)" value={formatCurrency(totalAllocated)} />
        <StatCard href="/financial" label="Gasto (Total)" value={formatCurrency(totalSpent)} />
        <StatCard
          label="% Orçamento Utilizado"
          tone={!Number.isNaN(percentUsed) && percentUsed > 100 ? "bad" : "neutral"}
          value={formatPercent(percentUsed)}
        />
        <StatCard label="Saldo Disponível" value={formatCurrency(totalAllocated - totalSpent)} />
      </Section>

      <Section title="Composição">
        <StatCard label="OPEX Gasto" value={formatCurrency(opexSpent)} />
        <StatCard label="CAPEX Gasto" value={formatCurrency(capexSpent)} />
        <StatCard href="/financial" label="Despesas do Mês" value={formatCurrency(expensesThisMonth)} />
        <StatCard
          label="Despesas sem Aprovação"
          tone={(unapprovedExpensesResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(unapprovedExpensesResult.data?.length ?? 0)}
        />
      </Section>

      <Section title="Contratos">
        <StatCard
          href="/financial"
          label="Contratos Vencendo (90 dias)"
          tone={(contractsExpiringResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(contractsExpiringResult.data?.length ?? 0)}
        />
      </Section>
    </div>
  );
}
