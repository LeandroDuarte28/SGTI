import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createContract } from "./actions";

export const metadata: Metadata = { title: "Novo Contrato" };

export default function NewContractPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-sm text-muted-foreground hover:underline" href="/financial">
          ← Voltar para Financeiro
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Novo Contrato</h1>
      </div>

      <form action={createContract} className="space-y-5 rounded-lg border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vendor_name">Fornecedor</Label>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="vendor_name"
              name="vendor_name"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="title"
              name="title"
              placeholder="Ex: Licenciamento Microsoft 365"
              type="text"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <select
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue="OPEX"
            id="category"
            name="category"
          >
            <option value="OPEX">OPEX</option>
            <option value="CAPEX">CAPEX</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Data de Início</Label>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="start_date"
              name="start_date"
              type="date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">Data de Fim (opcional)</Label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="end_date"
              name="end_date"
              type="date"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="value">Valor (R$)</Label>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="value"
              min="0"
              name="value"
              placeholder="0,00"
              step="0.01"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="renewal_notice_days">Aviso de Renovação (dias)</Label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={30}
              id="renewal_notice_days"
              min="0"
              name="renewal_notice_days"
              type="number"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/financial">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Contrato</Button>
        </div>
      </form>
    </div>
  );
}
