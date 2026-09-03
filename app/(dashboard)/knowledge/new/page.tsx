import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createArticle } from "./actions";

export const metadata: Metadata = { title: "Novo Artigo" };

export default async function NewArticlePage(): Promise<React.JSX.Element> {
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
        <Link className="text-sm text-muted-foreground hover:underline" href="/knowledge">
          ← Voltar para Base de Conhecimento
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Novo Artigo</h1>
      </div>

      <form action={createArticle} className="space-y-5 rounded-lg border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="title"
            name="title"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo</Label>
          <textarea
            required
            className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="content"
            name="content"
          />
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

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue="DRAFT"
            id="status"
            name="status"
          >
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/knowledge">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Artigo</Button>
        </div>
      </form>
    </div>
  );
}
