import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createProject } from "./actions";

export const metadata: Metadata = { title: "Novo Projeto" };

export default async function NewProjectPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const { data: budgets } = await supabase
    .schema("financial")
    .from("Budget")
    .select("id, name, fiscal_year")
    .order("fiscal_year", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-muted-foreground text-sm hover:underline" href="/projects">
          ← Voltar para Projetos
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Novo Projeto</h1>
      </div>

      <form
        action={createProject}
        className="border-border bg-card space-y-5 rounded-lg border p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="name"
            name="name"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <textarea
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="description"
            name="description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget_id">Orçamento Vinculado (opcional)</Label>
          <select
            className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            defaultValue=""
            id="budget_id"
            name="budget_id"
          >
            <option value="">Nenhum</option>
            {(budgets ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.fiscal_year})
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Data de Início (opcional)</Label>
            <input
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="start_date"
              name="start_date"
              type="date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">Data de Fim (opcional)</Label>
            <input
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="end_date"
              name="end_date"
              type="date"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="github_repo">Repositório GitHub (opcional)</Label>
          <input
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="github_repo"
            name="github_repo"
            placeholder="org/repositorio"
            type="text"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/projects">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Projeto</Button>
        </div>
      </form>
    </div>
  );
}
