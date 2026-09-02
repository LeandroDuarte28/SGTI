import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createServiceRequest } from "./actions";

export const metadata: Metadata = { title: "Nova Requisição" };

export default async function NewServiceRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}): Promise<React.JSX.Element> {
  const { item: preselectedItemId } = await searchParams;
  const supabase = await createClient();

  const [categoriesResult, itemsResult] = await Promise.all([
    supabase
      .schema("catalog")
      .from("ServiceCategory")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .schema("catalog")
      .from("ServiceCatalogItem")
      .select("id, category_id, name")
      .eq("is_active", true),
  ]);

  const categories = categoriesResult.data ?? [];
  const items = itemsResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-sm text-muted-foreground hover:underline" href="/requests">
          ← Voltar para Requisições
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Nova Requisição</h1>
        <p className="text-sm text-muted-foreground">
          Solicite um serviço disponível no Catálogo.
        </p>
      </div>

      <form
        action={createServiceRequest}
        className="space-y-5 rounded-lg border border-border bg-card p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="catalog_item_id">Serviço</Label>
          <select
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={preselectedItemId ?? ""}
            id="catalog_item_id"
            name="catalog_item_id"
          >
            <option disabled value="">
              Selecione um serviço
            </option>
            {categories.map((category) => {
              const categoryItems = items.filter((item) => item.category_id === category.id);
              if (categoryItems.length === 0) {
                return null;
              }
              return (
                <optgroup key={category.id} label={category.name}>
                  {categoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="justification">Justificativa (opcional)</Label>
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="justification"
            name="justification"
            placeholder="Explique por que você precisa deste serviço."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/requests">Cancelar</Link>
          </Button>
          <Button type="submit">Enviar Requisição</Button>
        </div>
      </form>
    </div>
  );
}
