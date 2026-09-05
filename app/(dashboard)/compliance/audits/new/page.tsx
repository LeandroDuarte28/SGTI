import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createAudit } from "./actions";

export const metadata: Metadata = { title: "Nova Auditoria" };

const TYPE_OPTIONS = [
  { value: "INTERNAL", label: "Interna" },
  { value: "EXTERNAL", label: "Externa" },
  { value: "CONSULTORIA", label: "Consultoria" },
  { value: "REGULATORY", label: "Regulatória" },
];

export default async function NewAuditPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  const [normsResult, consultanciesResult] = await Promise.all([
    supabase
      .schema("compliance")
      .from("Norm")
      .select("id, full_name")
      .eq("is_active", true)
      .order("full_name"),
    supabase
      .schema("compliance")
      .from("Consultancy")
      .select("id, trade_name")
      .eq("status", "ACTIVE")
      .order("trade_name"),
  ]);

  const norms = normsResult.data ?? [];
  const consultancies = consultanciesResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-muted-foreground text-sm hover:underline" href="/compliance/audits">
          ← Voltar para Auditorias
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Nova Auditoria</h1>
        <p className="text-muted-foreground text-sm">
          Planeje um ciclo de auditoria de compliance.
        </p>
      </div>

      <form action={createAudit} className="border-border bg-card space-y-5 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="name"
            name="name"
            placeholder="Ex: Auditoria Anual ISO 27001 2026"
            type="text"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              required
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              defaultValue=""
              id="type"
              name="type"
            >
              <option disabled value="">
                Selecione um tipo
              </option>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultancy_id">Consultoria (se externa)</Label>
            <select
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              defaultValue=""
              id="consultancy_id"
              name="consultancy_id"
            >
              <option value="">Nenhuma</option>
              {consultancies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.trade_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scope">Escopo</Label>
          <textarea
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="scope"
            name="scope"
            placeholder="Descreva o que será avaliado."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Data de Início</Label>
            <input
              required
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="start_date"
              name="start_date"
              type="date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">Data de Fim</Label>
            <input
              required
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="end_date"
              name="end_date"
              type="date"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead_auditor_name">Auditor Líder (opcional)</Label>
          <input
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="lead_auditor_name"
            name="lead_auditor_name"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label>Normas Avaliadas</Label>
          <div className="border-input grid gap-2 rounded-md border p-3 sm:grid-cols-2">
            {norms.map((norm) => (
              <label className="text-foreground flex items-center gap-2 text-sm" key={norm.id}>
                <input
                  className="border-input h-4 w-4 rounded"
                  name="norm_ids"
                  type="checkbox"
                  value={norm.id}
                />
                {norm.full_name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/compliance/audits">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Auditoria</Button>
        </div>
      </form>
    </div>
  );
}
