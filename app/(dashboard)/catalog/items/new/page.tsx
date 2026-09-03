import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createServiceCatalogItem } from "./actions";

export const metadata: Metadata = { title: "Novo Item do Catálogo" };

export default async function NewServiceCatalogItemPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  const [categoriesResult, slaResult] = await Promise.all([
    supabase.schema("catalog").from("ServiceCategory").select("id, name").eq("is_active", true).order("sort_order"),
    supabase.schema("catalog").from("SLADefinition").select("id, name").eq("is_active", true).order("name"),
  ]);

  const categories = categoriesResult.data ?? [];
  const slaDefinitions = slaResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-sm text-muted-foreground hover:underline" href="/catalog">
          ← Voltar para o Catálogo
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Novo Item do Catálogo</h1>
      </div>

      <form action={createServiceCatalogItem} className="space-y-5 rounded-lg border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="category_id">Categoria</Label>
          <select
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue=""
            id="category_id"
            name="category_id"
          >
            <option disabled value="">
              Selecione uma categoria
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="name"
            name="name"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="description"
            name="description"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default_sla_id">SLA Padrão (opcional)</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              id="default_sla_id"
              name="default_sla_id"
            >
              <option value="">Nenhum</option>
              {slaDefinitions.map((sla) => (
                <option key={sla.id} value={sla.id}>
                  {sla.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated_delivery_days">Entrega Estimada (dias, opcional)</Label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="estimated_delivery_days"
              min="0"
              name="estimated_delivery_days"
              type="number"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/catalog">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Item</Button>
        </div>
      </form>
    </div>
  );
}
