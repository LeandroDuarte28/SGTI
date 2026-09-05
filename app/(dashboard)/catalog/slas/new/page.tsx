import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createSlaDefinition } from "./actions";

export const metadata: Metadata = { title: "Nova Definição de SLA" };

export default function NewSlaDefinitionPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-muted-foreground text-sm hover:underline" href="/catalog">
          ← Voltar para o Catálogo
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Nova Definição de SLA</h1>
      </div>

      <form
        action={createSlaDefinition}
        className="border-border bg-card space-y-5 rounded-lg border p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="name"
            name="name"
            placeholder="Ex: Padrão Planejado"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <select
            required
            className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            defaultValue=""
            id="priority"
            name="priority"
          >
            <option disabled value="">
              Selecione uma prioridade
            </option>
            <option value="CRITICAL">Crítico</option>
            <option value="HIGH">Alto</option>
            <option value="MEDIUM">Médio</option>
            <option value="LOW">Baixo</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="response_time_minutes">Tempo de 1º Atendimento (minutos)</Label>
            <input
              required
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="response_time_minutes"
              min="1"
              name="response_time_minutes"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resolution_time_minutes">Tempo de Resolução (minutos)</Label>
            <input
              required
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="resolution_time_minutes"
              min="1"
              name="resolution_time_minutes"
              type="number"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            defaultChecked
            className="border-input h-4 w-4 rounded"
            id="business_hours_only"
            name="business_hours_only"
            type="checkbox"
          />
          <Label className="font-normal" htmlFor="business_hours_only">
            Contar prazos apenas em horário comercial
          </Label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/catalog">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Definição de SLA</Button>
        </div>
      </form>
    </div>
  );
}
