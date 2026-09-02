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
    supabase.schema("compliance").from("Norm").select("id, full_name").eq("is_active", true).order("full_name"),
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
        <Link className="text-sm text-muted-foreground hover:underline" href="/compliance/audits">
          ← Voltar para Auditorias
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Nova Auditoria</h1>
        <p className="text-sm text-muted-foreground">
          Planeje um ciclo de auditoria de compliance.
        </p>
      </div>

      <form action={createAudit} className="space-y-5 rounded-lg border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="start_date"
              name="start_date"
              type="date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">Data de Fim</Label>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="end_date"
              name="end_date"
              type="date"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead_auditor_name">Auditor Líder (opcional)</Label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="lead_auditor_name"
            name="lead_auditor_name"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label>Normas Avaliadas</Label>
          <div className="grid gap-2 rounded-md border border-input p-3 sm:grid-cols-2">
            {norms.map((norm) => (
              <label className="flex items-center gap-2 text-sm text-foreground" key={norm.id}>
                <input className="h-4 w-4 rounded border-input" name="norm_ids" type="checkbox" value={norm.id} />
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
