import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createProblem } from "./actions";

export const metadata: Metadata = { title: "Novo Problema" };

export default function NewProblemPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-muted-foreground text-sm hover:underline" href="/problems">
          ← Voltar para Problemas
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Novo Problema</h1>
        <p className="text-muted-foreground text-sm">
          Registre uma causa raiz investigada para agrupar incidentes relacionados.
        </p>
      </div>

      <form
        action={createProblem}
        className="border-border bg-card space-y-5 rounded-lg border p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="title"
            maxLength={200}
            name="title"
            placeholder="Ex: Instabilidade recorrente no servidor de e-mail"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="description"
            name="description"
            placeholder="Descreva o padrão observado nos incidentes relacionados."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="root_cause">Causa raiz (opcional)</Label>
          <textarea
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="root_cause"
            name="root_cause"
            placeholder="Preencha se a causa raiz já foi identificada."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            className="border-input h-4 w-4 rounded"
            id="is_known_error"
            name="is_known_error"
            type="checkbox"
          />
          <Label className="font-normal" htmlFor="is_known_error">
            Marcar como Erro Conhecido
          </Label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/problems">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Problema</Button>
        </div>
      </form>
    </div>
  );
}
