import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatDateOnly } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Auditorias" };

const TYPE_LABEL: Record<string, string> = {
  INTERNAL: "Interna",
  EXTERNAL: "Externa",
  CONSULTORIA: "Consultoria",
  REGULATORY: "Regulatória",
};

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planejada",
  IN_PROGRESS: "Em Andamento",
  PENDING_RESPONSES: "Aguardando Respostas",
  IN_REVIEW: "Em Revisão",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

const STATUS_CLASS: Record<string, string> = {
  PLANNED: "bg-status-open/10 text-status-open",
  IN_PROGRESS: "bg-status-in-progress/10 text-status-in-progress",
  PENDING_RESPONSES: "bg-status-pending/10 text-status-pending",
  IN_REVIEW: "bg-priority-medium/10 text-priority-medium",
  COMPLETED: "bg-status-resolved/10 text-status-resolved",
  CANCELLED: "bg-status-closed/10 text-status-closed",
};

export default async function AuditsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  const { data: audits, error } = await supabase
    .schema("compliance")
    .from("ComplianceAudit")
    .select("id, code, name, type, status, start_date, end_date, compliance_score_final")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link className="text-sm text-muted-foreground hover:underline" href="/compliance">
            ← Voltar para Compliance
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Auditorias</h1>
          <p className="text-sm text-muted-foreground">Ciclos de auditoria de compliance.</p>
        </div>
        <Button asChild>
          <Link href="/compliance/audits/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Auditoria
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar as auditorias: {error.message}
        </div>
      )}

      {!error && (audits ?? []).length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma auditoria cadastrada ainda.</p>
        </div>
      )}

      {!error && (audits ?? []).length > 0 && (
        <ul className="space-y-3">
          {(audits ?? []).map((audit) => (
            <li key={audit.id}>
              <Link
                className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
                href={`/compliance/audits/${audit.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-medium text-foreground">{audit.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {audit.code} · {TYPE_LABEL[audit.type] ?? audit.type}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_CLASS[audit.status] ?? ""
                    }`}
                  >
                    {STATUS_LABEL[audit.status] ?? audit.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDateOnly(audit.start_date)} – {formatDateOnly(audit.end_date)}
                  {audit.compliance_score_final !== null &&
                    ` · Score: ${Number(audit.compliance_score_final).toFixed(1)}%`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
