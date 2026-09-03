import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createExpense } from "./actions";

export const metadata: Metadata = { title: "Nova Despesa" };

export default async function NewExpensePage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  const [budgetsResult, contractsResult] = await Promise.all([
    supabase.schema("financial").from("Budget").select("id, name, fiscal_year").order("fiscal_year", { ascending: false }),
    supabase.schema("financial").from("Contract").select("id, title").order("title"),
  ]);

  const budgets = budgetsResult.data ?? [];
  const contracts = contractsResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-sm text-muted-foreground hover:underline" href="/financial">
          ← Voltar para Financeiro
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Nova Despesa</h1>
      </div>

      <form action={createExpense} className="space-y-5 rounded-lg border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="description"
            name="description"
            type="text"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="budget_id">Orçamento (opcional)</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              id="budget_id"
              name="budget_id"
            >
              <option value="">Nenhum</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.fiscal_year})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract_id">Contrato (opcional)</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              id="contract_id"
              name="contract_id"
            >
              <option value="">Nenhum</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="amount"
              min="0"
              name="amount"
              placeholder="0,00"
              step="0.01"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense_date">Data</Label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="expense_date"
              name="expense_date"
              type="date"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/financial">Cancelar</Link>
          </Button>
          <Button type="submit">Registrar Despesa</Button>
        </div>
      </form>
    </div>
  );
}
