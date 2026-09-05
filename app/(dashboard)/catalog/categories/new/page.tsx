import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createServiceCategory } from "./actions";

export const metadata: Metadata = { title: "Nova Categoria de Serviço" };

export default function NewServiceCategoryPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-muted-foreground text-sm hover:underline" href="/catalog">
          ← Voltar para o Catálogo
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Nova Categoria de Serviço</h1>
      </div>

      <form
        action={createServiceCategory}
        className="border-border bg-card space-y-5 rounded-lg border p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="name"
            name="name"
            placeholder="Ex: Service Desk"
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
          <Label htmlFor="sort_order">Ordem de Exibição</Label>
          <input
            className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            defaultValue={0}
            id="sort_order"
            min="0"
            name="sort_order"
            type="number"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/catalog">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Categoria</Button>
        </div>
      </form>
    </div>
  );
}
