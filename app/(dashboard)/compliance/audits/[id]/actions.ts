"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["PLANNED", "IN_PROGRESS", "PENDING_RESPONSES", "IN_REVIEW", "COMPLETED", "CANCELLED"] as const;
type AuditStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: string): value is AuditStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

// Docs/45_COMPLIANCE.md §4.2 — the audit lifecycle.
const ALLOWED_TRANSITIONS: Record<AuditStatus, AuditStatus[]> = {
  PLANNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["PENDING_RESPONSES", "CANCELLED"],
  PENDING_RESPONSES: ["IN_REVIEW"],
  IN_REVIEW: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Updates the status of a compliance audit. Restricted to IT_MANAGER+ by
 * RLS ("ComplianceAudit: managers can manage"). Implements:
 * - CMP-051: cancelling requires a justification.
 * - CMP-078: cancelling an audit auto-cancels its non-concluded findings.
 * - CMP-070: an audit with open CRITICAL findings can't be completed.
 * - CMP-047: an audit with zero findings can be completed directly.
 * - CMP-020: the compliance score is (re)calculated only when completing.
 */
export async function updateAuditStatus(formData: FormData): Promise<void> {
  const auditId = formData.get("audit_id");
  const status = formData.get("status");
  const cancellationReason = formData.get("cancellation_reason");

  if (typeof auditId !== "string" || auditId.length === 0) {
    throw new Error("Auditoria inválida.");
  }
  if (typeof status !== "string" || !isValidStatus(status)) {
    throw new Error("Status inválido.");
  }

  const supabase = await createClient();

  const { data: audit, error: fetchError } = await supabase
    .schema("compliance")
    .from("ComplianceAudit")
    .select("status")
    .eq("id", auditId)
    .single();

  if (fetchError || !audit) {
    throw new Error(`Não foi possível encontrar a auditoria: ${fetchError?.message ?? "não encontrada"}`);
  }

  const currentStatus = audit.status as AuditStatus;
  if (!ALLOWED_TRANSITIONS[currentStatus].includes(status)) {
    throw new Error(`Não é possível mudar de "${currentStatus}" para "${status}".`);
  }

  const updates: {
    status: AuditStatus;
    cancellation_reason?: string;
    compliance_score_final?: number;
  } = { status };

  if (status === "CANCELLED") {
    if (typeof cancellationReason !== "string" || cancellationReason.trim().length === 0) {
      throw new Error("Informe o motivo do cancelamento.");
    }
    updates.cancellation_reason = cancellationReason.trim();

    const { error: cascadeError } = await supabase
      .schema("compliance")
      .from("ComplianceFinding")
      .update({
        status: "CANCELLED",
        cancellation_reason: "Cancelado automaticamente: a auditoria foi encerrada.",
      })
      .eq("audit_id", auditId)
      .not("status", "in", "(CONCLUDED,CANCELLED,NOT_APPLICABLE)");

    if (cascadeError) {
      throw new Error(`Não foi possível cancelar os apontamentos vinculados: ${cascadeError.message}`);
    }
  }

  if (status === "COMPLETED") {
    const { count: findingCount } = await supabase
      .schema("compliance")
      .from("ComplianceFinding")
      .select("id", { count: "exact", head: true })
      .eq("audit_id", auditId);

    if (findingCount && findingCount > 0) {
      const { count: openCriticalCount } = await supabase
        .schema("compliance")
        .from("ComplianceFinding")
        .select("id", { count: "exact", head: true })
        .eq("audit_id", auditId)
        .eq("criticality", "CRITICAL")
        .not("status", "in", "(CONCLUDED,CANCELLED,NOT_APPLICABLE)");

      if (openCriticalCount && openCriticalCount > 0) {
        throw new Error(
          `Não é possível concluir: há ${openCriticalCount} apontamento(s) CRITICAL em aberto.`,
        );
      }
    }

    updates.compliance_score_final = await calculateComplianceScore(auditId);
  }

  const { error } = await supabase
    .schema("compliance")
    .from("ComplianceAudit")
    .update(updates)
    .eq("id", auditId);

  if (error) {
    throw new Error(`Não foi possível atualizar a auditoria: ${error.message}`);
  }

  revalidatePath(`/compliance/audits/${auditId}`);
  revalidatePath("/compliance/audits");
}

/**
 * CMP-020 / KPI-CMP-001 — (SUM(IMPL*1) + SUM(PART*0.5)) / SUM(APLIC) * 100,
 * over the norm items belonging to the norms this audit evaluates.
 */
async function calculateComplianceScore(auditId: string): Promise<number> {
  const supabase = await createClient();

  const { data: auditNorms } = await supabase
    .schema("compliance")
    .from("ComplianceAuditNorm")
    .select("norm_id")
    .eq("audit_id", auditId);

  const normIds = (auditNorms ?? []).map((row) => row.norm_id);
  if (normIds.length === 0) {
    return 0;
  }

  const { data: items } = await supabase
    .schema("compliance")
    .from("NormItem")
    .select("implementation_status")
    .in("norm_id", normIds)
    .eq("is_applicable", true);

  const applicable = items ?? [];
  if (applicable.length === 0) {
    return 0;
  }

  const numerator = applicable.reduce((sum, item) => {
    if (item.implementation_status === "IMPLEMENTED") {return sum + 1;}
    if (item.implementation_status === "PARTIAL") {return sum + 0.5;}
    return sum;
  }, 0);

  return Math.round((numerator / applicable.length) * 100 * 100) / 100;
}
