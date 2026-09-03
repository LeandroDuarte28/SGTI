import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { IT_STAFF_ROLES } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createFinding } from "./actions";

export const metadata: Metadata = { title: "Novo Apontamento" };

const TYPE_OPTIONS = [
  { value: "NON_CONFORMITY", label: "Não Conformidade" },
  { value: "OBSERVATION", label: "Observação" },
  { value: "IMPROVEMENT_OPPORTUNITY", label: "Oportunidade de Melhoria" },
];

const CRITICALITY_OPTIONS = [
  { value: "CRITICAL", label: "Crítica" },
  { value: "MAJOR", label: "Maior" },
  { value: "MINOR", label: "Menor" },
  { value: "OBSERVATION", label: "Observação" },
];

export default async function NewFindingPage({
  searchParams,
}: {
  searchParams: Promise<{ audit?: string }>;
}): Promise<React.JSX.Element> {
  const { audit: auditId } = await searchParams;

  if (!auditId) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Um apontamento precisa ser criado a partir de uma{" "}
            <Link className="underline" href="/compliance/audits">
              auditoria
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const [auditResult, auditNormsResult] = await Promise.all([
    supabase.schema("compliance").from("ComplianceAudit").select("id, name").eq("id", auditId).single(),
    supabase.schema("compliance").from("ComplianceAuditNorm").select("norm_id").eq("audit_id", auditId),
  ]);

  const audit = auditResult.data;
  const normIds = (auditNormsResult.data ?? []).map((row) => row.norm_id);

  const [itemsResult, rolesResult] = await Promise.all([
    supabase
      .schema("compliance")
      .from("NormItem")
      .select("id, item_code, item_name, norm_id, default_criticality")
      .in("norm_id", normIds.length > 0 ? normIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("is_applicable", true)
      .order("item_code"),
    supabase.schema("shared").from("UserRole").select("user_id").in("role", IT_STAFF_ROLES),
  ]);

  const items = itemsResult.data ?? [];
  const staffIds = [...new Set((rolesResult.data ?? []).map((r) => r.user_id))];
  const { data: staffProfiles } = await supabase
    .schema("shared")
    .from("UserProfile")
    .select("id, full_name")
    .in("id", staffIds.length > 0 ? staffIds : ["00000000-0000-0000-0000-000000000000"])
    .order("full_name");

  if (!audit) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Auditoria não encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-sm text-muted-foreground hover:underline" href={`/compliance/audits/${audit.id}`}>
          ← Voltar para {audit.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Novo Apontamento</h1>
        <p className="text-sm text-muted-foreground">Registre uma situação identificada nesta auditoria.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum item normativo aplicável disponível para as normas desta auditoria.
          </p>
        </div>
      ) : (
        <form action={createFinding} className="space-y-5 rounded-lg border border-border bg-card p-6">
          <input name="audit_id" type="hidden" value={audit.id} />

          <div className="space-y-2">
            <Label htmlFor="norm_item_id">Item Normativo</Label>
            <select
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              id="norm_item_id"
              name="norm_item_id"
            >
              <option disabled value="">
                Selecione um item
              </option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_code} — {item.item_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="finding_type">Tipo de Apontamento</Label>
              <select
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
                id="finding_type"
                name="finding_type"
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
              <Label htmlFor="criticality">Criticidade</Label>
              <select
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
                id="criticality"
                name="criticality"
              >
                <option disabled value="">
                  Selecione a criticidade
                </option>
                {CRITICALITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="title"
              maxLength={400}
              name="title"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              required
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="description"
              name="description"
              placeholder="Detalhamento completo da situação encontrada."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="analyst_id">Analista Responsável</Label>
              <select
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
                id="analyst_id"
                name="analyst_id"
              >
                <option disabled value="">
                  Selecione um analista
                </option>
                {(staffProfiles ?? []).map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Data Limite</Label>
              <input
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="due_date"
                name="due_date"
                type="date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_cost">Custo Estimado (opcional)</Label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="estimated_cost"
              min="0"
              name="estimated_cost"
              placeholder="0,00"
              step="0.01"
              type="number"
            />
          </div>

          <div className="flex items-center gap-2">
            <input className="h-4 w-4 rounded border-input" id="is_urgent" name="is_urgent" type="checkbox" />
            <Label className="font-normal" htmlFor="is_urgent">
              Marcar como urgente
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button asChild variant="outline">
              <Link href={`/compliance/audits/${audit.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit">Criar Apontamento</Button>
          </div>
        </form>
      )}
    </div>
  );
}
