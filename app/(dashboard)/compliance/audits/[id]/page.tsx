import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole } from "@/lib/constants/roles";
import { formatDateOnly } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { updateAuditStatus } from "./actions";

export const metadata: Metadata = { title: "Detalhe da Auditoria" };

const TYPE_LABEL: Record<string, string> = {
  INTERNAL: "Interna",
  EXTERNAL: "Externa",
  CONSULTORIA: "Consultoria",
  REGULATORY: "Regulatória",
};

const AUDIT_STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planejada",
  IN_PROGRESS: "Em Andamento",
  PENDING_RESPONSES: "Aguardando Respostas",
  IN_REVIEW: "Em Revisão",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

const FINDING_STATUS_LABEL: Record<string, string> = {
  NEW: "Aberto",
  IN_PROGRESS: "Em Tratativa",
  PENDING_EVIDENCE: "Aguardando Evidência",
  IN_VALIDATION: "Em Validação",
  CONCLUDED: "Concluído",
  CANCELLED: "Cancelado",
  NOT_APPLICABLE: "Não Aplicável",
  REOPENED: "Reaberto",
};

const CRITICALITY_CLASS: Record<string, string> = {
  CRITICAL: "bg-priority-critical/10 text-priority-critical",
  MAJOR: "bg-priority-high/10 text-priority-high",
  MINOR: "bg-priority-medium/10 text-priority-medium",
  OBSERVATION: "bg-muted text-muted-foreground",
};

const STATUS_OPTIONS = ["PLANNED", "IN_PROGRESS", "PENDING_RESPONSES", "IN_REVIEW", "COMPLETED", "CANCELLED"];

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const user = await getAuthUser();
  const isManager = hasRole(user.roles, ADMIN_ROLES);

  const supabase = await createClient();

  const { data: audit, error } = await supabase
    .schema("compliance")
    .from("ComplianceAudit")
    .select(
      "id, code, name, type, scope, start_date, end_date, lead_auditor_name, status, compliance_score_final, cancellation_reason, notes",
    )
    .eq("id", id)
    .single();

  if (error || !audit) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link className="text-sm text-muted-foreground hover:underline" href="/compliance/audits">
          ← Voltar para Auditorias
        </Link>
        <div className="mt-4 rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Auditoria não encontrada, ou você não tem permissão para vê-la.
          </p>
        </div>
      </div>
    );
  }

  const [auditNormsResult, findingsResult] = await Promise.all([
    supabase.schema("compliance").from("ComplianceAuditNorm").select("norm_id").eq("audit_id", id),
    supabase
      .schema("compliance")
      .from("ComplianceFinding")
      .select("id, code, title, finding_type, criticality, status, due_date")
      .eq("audit_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const normIds = (auditNormsResult.data ?? []).map((row) => row.norm_id);
  const { data: normRows } = await supabase
    .schema("compliance")
    .from("Norm")
    .select("id, full_name")
    .in("id", normIds.length > 0 ? normIds : ["00000000-0000-0000-0000-000000000000"]);
  const norms = normRows ?? [];
  const findings = findingsResult.data ?? [];
  const canAddFindings = !["COMPLETED", "CANCELLED"].includes(audit.status);

  return (
    <div className="mx-auto max-w-2xl">
      <Link className="text-sm text-muted-foreground hover:underline" href="/compliance/audits">
        ← Voltar para Auditorias
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-foreground">{audit.name}</h1>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {AUDIT_STATUS_LABEL[audit.status] ?? audit.status}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {audit.code} · {TYPE_LABEL[audit.type] ?? audit.type}
          {audit.lead_auditor_name && ` · Auditor líder: ${audit.lead_auditor_name}`}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{audit.scope}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          {formatDateOnly(audit.start_date)} – {formatDateOnly(audit.end_date)}
        </p>
        {norms.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Normas avaliadas: {norms.map((n) => n.full_name).join(", ")}
          </p>
        )}
        {audit.compliance_score_final !== null && (
          <p className="mt-2 text-sm font-medium text-foreground">
            Compliance Score: {Number(audit.compliance_score_final).toFixed(1)}%
          </p>
        )}
        {audit.cancellation_reason && (
          <p className="mt-2 text-xs text-destructive">Cancelada: {audit.cancellation_reason}</p>
        )}
      </div>

      {isManager && !["COMPLETED", "CANCELLED"].includes(audit.status) && (
        <form
          action={updateAuditStatus}
          className="mt-4 space-y-2 rounded-lg border border-border bg-card p-4"
        >
          <input name="audit_id" type="hidden" value={audit.id} />
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
              defaultValue={audit.status}
              key={audit.status}
              name="status"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {AUDIT_STATUS_LABEL[status] ?? status}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit">
              Atualizar status
            </Button>
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="cancellation_reason">
              Motivo (obrigatório apenas ao cancelar)
            </Label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="cancellation_reason"
              name="cancellation_reason"
              placeholder="Motivo do cancelamento"
              type="text"
            />
          </div>
        </form>
      )}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground">Apontamentos ({findings.length})</h2>
          {isManager && canAddFindings && (
            <Button asChild size="sm">
              <Link href={`/compliance/findings/new?audit=${audit.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Apontamento
              </Link>
            </Button>
          )}
        </div>

        {findings.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum apontamento registrado nesta auditoria.</p>
          </div>
        )}

        {findings.length > 0 && (
          <ul className="space-y-2">
            {findings.map((finding) => (
              <li key={finding.id}>
                <Link
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:bg-muted/50"
                  href={`/compliance/findings/${finding.id}`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{finding.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {finding.code} · Prazo: {formatDateOnly(finding.due_date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        CRITICALITY_CLASS[finding.criticality] ?? ""
                      }`}
                    >
                      {finding.criticality}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {FINDING_STATUS_LABEL[finding.status] ?? finding.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
