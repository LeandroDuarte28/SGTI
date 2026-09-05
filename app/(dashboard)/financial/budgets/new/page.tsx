import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createBudget } from "./actions";

export const metadata: Metadata = { title: "Novo Orçamento" };

export default function NewBudgetPage(): React.JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-muted-foreground text-sm hover:underline" href="/financial">
          ← Voltar para Financeiro
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Novo Orçamento</h1>
      </div>

      <form action={createBudget} className="border-border bg-card space-y-5 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="name"
            name="name"
            placeholder="Ex: Infraestrutura de TI"
            type="text"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fiscal_year">Ano Fiscal</Label>
            <input
              required
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              defaultValue={currentYear}
              id="fiscal_year"
              max={2100}
              min={2000}
              name="fiscal_year"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <select
              required
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              defaultValue="OPEX"
              id="category"
              name="category"
            >
              <option value="OPEX">OPEX</option>
              <option value="CAPEX">CAPEX</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allocated_amount">Valor Alocado (R$)</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="allocated_amount"
            min="0"
            name="allocated_amount"
            placeholder="0,00"
            step="0.01"
            type="number"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/financial">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Orçamento</Button>
        </div>
      </form>
    </div>
  );
}
