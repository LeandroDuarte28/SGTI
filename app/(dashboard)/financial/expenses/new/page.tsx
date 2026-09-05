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
    supabase
      .schema("financial")
      .from("Budget")
      .select("id, name, fiscal_year")
      .order("fiscal_year", { ascending: false }),
    supabase.schema("financial").from("Contract").select("id, title").order("title"),
  ]);

  const budgets = budgetsResult.data ?? [];
  const contracts = contractsResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-muted-foreground text-sm hover:underline" href="/financial">
          ← Voltar para Financeiro
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Nova Despesa</h1>
      </div>

      <form
        action={createExpense}
        className="border-border bg-card space-y-5 rounded-lg border p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="description"
            name="description"
            type="text"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="budget_id">Orçamento (opcional)</Label>
            <select
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
