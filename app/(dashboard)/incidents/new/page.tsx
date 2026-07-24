import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createIncident } from "./actions";

export const metadata: Metadata = { title: "Novo Incidente" };

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
];

export default async function NewIncidentPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .schema("catalog")
    .from("ServiceCategory")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-sm text-muted-foreground hover:underline" href="/incidents">
          ← Voltar para Incidentes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Novo Incidente</h1>
        <p className="text-sm text-muted-foreground">
          Descreva o problema que você está enfrentando.
        </p>
      </div>

      <form action={createIncident} className="space-y-5 rounded-lg border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="title"
            maxLength={200}
            name="title"
            placeholder="Ex: Não consigo acessar o sistema financeiro"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            required
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="description"
            name="description"
            placeholder="Descreva o que aconteceu, quando começou, e qualquer mensagem de erro que apareceu."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <select
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue="MEDIUM"
            id="priority"
            name="priority"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {categories && categories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="category_id">Categoria (opcional)</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              id="category_id"
              name="category_id"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/incidents">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Incidente</Button>
        </div>
      </form>
    </div>
  );
}
