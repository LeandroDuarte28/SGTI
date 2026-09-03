import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Compliance" };

const HUB_LINKS = [
  { href: "/compliance/audits", label: "Auditorias", desc: "Ciclos de auditoria e apontamentos" },
  { href: "/compliance/norms", label: "Normas", desc: "Normas, frameworks e itens normativos" },
  { href: "/compliance/consultancies", label: "Consultorias", desc: "Empresas de auditoria externa" },
] as const;

const FINDING_STATUS_LABEL: Record<string, string> = {
  NEW: "Aberto",
  IN_PROGRESS: "Em Tratativa",
  PENDING_EVIDENCE: "Aguardando Evidência",
  IN_VALIDATION: "Em Validação",
  REOPENED: "Reaberto",
};

const CRITICALITY_LABEL: Record<string, string> = {
  CRITICAL: "Crítica",
  MAJOR: "Alta",
  MINOR: "Média",
  OBSERVATION: "Observação",
};

const CRITICALITY_CLASS: Record<string, string> = {
  CRITICAL: "bg-priority-critical/10 text-priority-critical",
  MAJOR: "bg-priority-high/10 text-priority-high",
  MINOR: "bg-priority-medium/10 text-priority-medium",
  OBSERVATION: "bg-muted text-muted-foreground",
};

const AUDIT_STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planejada",
  IN_PROGRESS: "Em Andamento",
  PENDING_RESPONSES: "Aguardando Respostas",
  IN_REVIEW: "Em Revisão",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

const AUDIT_STATUS_CLASS: Record<string, string> = {
  PLANNED: "bg-status-open/10 text-status-open",
  IN_PROGRESS: "bg-status-in-progress/10 text-status-in-progress",
  PENDING_RESPONSES: "bg-status-pending/10 text-status-pending",
  IN_REVIEW: "bg-priority-medium/10 text-priority-medium",
  COMPLETED: "bg-status-resolved/10 text-status-resolved",
  CANCELLED: "bg-status-closed/10 text-status-closed",
};

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function CompliancePage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: SUPER_ADMIN, IT_MANAGER and AUDITOR can read; everyone else sees
  // an empty list (see supabase/migrations/20260727000000_compliance_findings_schema.sql).
  const [findingsResult, auditsResult] = await Promise.all([
    supabase
      .schema("compliance")
      .from("ComplianceFinding")
      .select("id, code, title, criticality, status, due_date")
      .not("status", "in", "(CONCLUDED,CANCELLED,NOT_APPLICABLE)")
      .order("due_date"),
    supabase
      .schema("compliance")
      .from("ComplianceAudit")
      .select("id, code, name, status, compliance_score_final")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const error = findingsResult.error ?? auditsResult.error;
  const findings = findingsResult.data ?? [];
  const audits = auditsResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Compliance</h1>
          <p className="text-sm text-muted-foreground">
            Apontamentos de auditoria em aberto e ciclos de auditoria recentes.
          </p>
        </div>
        <a
          className="shrink-0 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          href="/api/reports/compliance"
        >
          Exportar CSV
        </a>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {HUB_LINKS.map((link) => (
          <Link
            className="rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
            href={link.href}
            key={link.href}
          >
            <p className="font-medium text-foreground">{link.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{link.desc}</p>
          </Link>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os dados de compliance: {error.message}
        </div>
      )}

      {!error && findings.length === 0 && audits.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum apontamento ou auditoria cadastrada ainda, ou você não tem permissão para ver
            este módulo (restrito a Auditores e Gestores de TI).
          </p>
        </div>
      )}

      {!error && findings.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-medium text-foreground">Apontamentos em Aberto</h2>
          <ul className="space-y-3">
            {findings.map((finding) => (
              <li className="rounded-lg border border-border bg-card p-4 shadow-sm" key={finding.id}>
                <Link className="block" href={`/compliance/findings/${finding.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{finding.title}</p>
                      <p className="text-xs text-muted-foreground">{finding.code}</p>
                    </div>
                    <Pill
                      className={CRITICALITY_CLASS[finding.criticality] ?? ""}
                      label={CRITICALITY_LABEL[finding.criticality] ?? finding.criticality}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {FINDING_STATUS_LABEL[finding.status] ?? finding.status} · Prazo:{" "}
                    {new Date(finding.due_date).toLocaleDateString("pt-BR")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!error && audits.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-foreground">Auditorias Recentes</h2>
          <ul className="space-y-2">
            {audits.map((audit) => (
              <li key={audit.id}>
                <Link
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:bg-muted/50"
                  href={`/compliance/audits/${audit.id}`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{audit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {audit.code}
                      {audit.compliance_score_final !== null &&
                        ` · Score: ${Number(audit.compliance_score_final).toFixed(1)}%`}
                    </p>
                  </div>
                  <Pill
                    className={AUDIT_STATUS_CLASS[audit.status] ?? ""}
                    label={AUDIT_STATUS_LABEL[audit.status] ?? audit.status}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
