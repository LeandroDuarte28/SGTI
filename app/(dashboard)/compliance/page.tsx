import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Compliance" };

const CONTROL_STATUS_LABEL: Record<string, string> = {
  COMPLIANT: "Conforme",
  NON_COMPLIANT: "Não Conforme",
  IN_REMEDIATION: "Em Remediação",
  NOT_APPLICABLE: "Não Aplicável",
};

const CONTROL_STATUS_CLASS: Record<string, string> = {
  COMPLIANT: "bg-status-resolved/10 text-status-resolved",
  NON_COMPLIANT: "bg-destructive/10 text-destructive",
  IN_REMEDIATION: "bg-priority-medium/10 text-priority-medium",
  NOT_APPLICABLE: "bg-muted text-muted-foreground",
};

const SEVERITY_LABEL: Record<string, string> = {
  CRITICAL: "Crítica",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

const SEVERITY_CLASS: Record<string, string> = {
  CRITICAL: "bg-priority-critical/10 text-priority-critical",
  HIGH: "bg-priority-high/10 text-priority-high",
  MEDIUM: "bg-priority-medium/10 text-priority-medium",
  LOW: "bg-priority-low/10 text-priority-low",
};

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function CompliancePage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: SUPER_ADMIN, IT_MANAGER and AUDITOR can read; everyone else sees
  // an empty list (see supabase/migrations/20260712000500_compliance_schema.sql).
  const [controlsResult, nonConformancesResult] = await Promise.all([
    supabase
      .schema("compliance")
      .from("Control")
      .select("id, code, title, framework, status")
      .order("code"),
    supabase
      .schema("compliance")
      .from("NonConformance")
      .select("id, description, severity, status, created_at")
      .neq("status", "RESOLVED")
      .order("created_at", { ascending: false }),
  ]);

  const error = controlsResult.error ?? nonConformancesResult.error;
  const controls = controlsResult.data ?? [];
  const nonConformances = nonConformancesResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Compliance</h1>
        <p className="text-sm text-muted-foreground">
          Controles de conformidade e não conformidades em aberto.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os dados de compliance: {error.message}
        </div>
      )}

      {!error && controls.length === 0 && nonConformances.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum controle cadastrado ainda, ou você não tem permissão para ver este módulo
            (restrito a Auditores e Gestores de TI).
          </p>
        </div>
      )}

      {!error && nonConformances.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-medium text-foreground">Não Conformidades em Aberto</h2>
          <ul className="space-y-3">
            {nonConformances.map((nc) => (
              <li className="rounded-lg border border-border bg-card p-4 shadow-sm" key={nc.id}>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-foreground">{nc.description}</p>
                  <Pill
                    className={SEVERITY_CLASS[nc.severity] ?? ""}
                    label={SEVERITY_LABEL[nc.severity] ?? nc.severity}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Identificada em {new Date(nc.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!error && controls.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-foreground">Controles</h2>
          <ul className="space-y-2">
            {controls.map((control) => (
              <li
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
                key={control.id}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {control.code} — {control.title}
                  </p>
                  {control.framework && (
                    <p className="text-xs text-muted-foreground">{control.framework}</p>
                  )}
                </div>
                <Pill
                  className={CONTROL_STATUS_CLASS[control.status] ?? ""}
                  label={CONTROL_STATUS_LABEL[control.status] ?? control.status}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
