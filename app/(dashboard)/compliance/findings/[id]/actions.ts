"use server";

import { createHash } from "node:crypto";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole } from "@/lib/constants/roles";

const VALID_STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "PENDING_EVIDENCE",
  "IN_VALIDATION",
  "CONCLUDED",
  "CANCELLED",
  "NOT_APPLICABLE",
  "REOPENED",
] as const;
type FindingStatus = (typeof VALID_STATUSES)[number];
function isValidStatus(value: string): value is FindingStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

// Docs/45_COMPLIANCE.md §7.4 — the finding lifecycle.
const ALLOWED_TRANSITIONS: Record<FindingStatus, FindingStatus[]> = {
  NEW: ["IN_PROGRESS", "CANCELLED", "NOT_APPLICABLE"],
  IN_PROGRESS: ["PENDING_EVIDENCE", "CANCELLED"],
  PENDING_EVIDENCE: ["IN_VALIDATION"],
  IN_VALIDATION: ["CONCLUDED", "IN_PROGRESS"],
  CONCLUDED: ["REOPENED"],
  CANCELLED: [],
  NOT_APPLICABLE: [],
  REOPENED: ["IN_PROGRESS"],
};

/**
 * Updates a finding's status, enforcing the workflow guards from
 * Docs/45_COMPLIANCE.md §7 (CMP-005, 026, 042, 056). Restricted to
 * IT_MANAGER+ / the assigned analyst by RLS.
 */
export async function updateFindingStatus(formData: FormData): Promise<void> {
  const findingId = formData.get("finding_id");
  const status = formData.get("status");
  const reason = formData.get("reason");

  if (typeof findingId !== "string" || findingId.length === 0) {
    throw new Error("Apontamento inválido.");
  }
  if (typeof status !== "string" || !isValidStatus(status)) {
    throw new Error("Status inválido.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: finding, error: fetchError } = await supabase
    .schema("compliance")
    .from("ComplianceFinding")
    .select("status, criticality")
    .eq("id", findingId)
    .single();

  if (fetchError || !finding) {
    throw new Error(`Não foi possível encontrar o apontamento: ${fetchError?.message ?? "não encontrado"}`);
  }

  const currentStatus = finding.status as FindingStatus;
  if (!ALLOWED_TRANSITIONS[currentStatus].includes(status)) {
    throw new Error(`Não é possível mudar de "${currentStatus}" para "${status}".`);
  }

  // CMP-056: CRITICAL findings require a manager (not just the analyst) to conclude.
  if (status === "CONCLUDED" && finding.criticality === "CRITICAL" && !hasRole(user.roles, ADMIN_ROLES)) {
    throw new Error("Apontamentos CRITICAL exigem aprovação de um Gestor de TI para serem concluídos.");
  }

  // CMP-005: concluding requires at least one APPROVED evidence.
  if (status === "CONCLUDED") {
    const { count } = await supabase
      .schema("compliance")
      .from("FindingEvidence")
      .select("id", { count: "exact", head: true })
      .eq("finding_id", findingId)
      .eq("review_status", "APPROVED");

    if (!count) {
      throw new Error("Conclusão bloqueada: nenhuma evidência aprovada foi encontrada.");
    }
  }

  const updates: {
    status: FindingStatus;
    cancellation_reason?: string;
    reopen_reason?: string;
  } = { status };

  if (status === "CANCELLED" || status === "NOT_APPLICABLE") {
    if (typeof reason !== "string" || reason.trim().length < 30) {
      throw new Error("Informe um motivo com pelo menos 30 caracteres.");
    }
    updates.cancellation_reason = reason.trim();
  }
  if (status === "REOPENED") {
    if (typeof reason !== "string" || reason.trim().length === 0) {
      throw new Error("Informe o motivo da reabertura.");
    }
    updates.reopen_reason = reason.trim();
  }

  const { error } = await supabase
    .schema("compliance")
    .from("ComplianceFinding")
    .update(updates)
    .eq("id", findingId);

  if (error) {
    throw new Error(`Não foi possível atualizar o apontamento: ${error.message}`);
  }

  revalidatePath(`/compliance/findings/${findingId}`);
}

const ACCEPTED_TYPES: Record<string, { extensions: string[]; maxBytes: number }> = {
  "application/pdf": { extensions: [".pdf"], maxBytes: 50 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { extensions: [".docx"], maxBytes: 50 * 1024 * 1024 },
  "application/msword": { extensions: [".doc"], maxBytes: 50 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { extensions: [".xlsx"], maxBytes: 50 * 1024 * 1024 },
  "application/vnd.ms-excel": { extensions: [".xls"], maxBytes: 50 * 1024 * 1024 },
  "image/png": { extensions: [".png"], maxBytes: 20 * 1024 * 1024 },
  "image/jpeg": { extensions: [".jpg", ".jpeg"], maxBytes: 20 * 1024 * 1024 },
  "text/csv": { extensions: [".csv"], maxBytes: 20 * 1024 * 1024 },
};

const VALID_EVIDENCE_TYPES = ["SCREENSHOT", "DOCUMENT", "LOG", "REPORT", "CERTIFICATE", "OTHER"] as const;
type EvidenceType = (typeof VALID_EVIDENCE_TYPES)[number];
function isValidEvidenceType(value: string): value is EvidenceType {
  return (VALID_EVIDENCE_TYPES as readonly string[]).includes(value);
}

const VALID_REVIEW_DECISIONS = ["APPROVED", "REJECTED"] as const;
type ReviewDecision = (typeof VALID_REVIEW_DECISIONS)[number];
function isValidReviewDecision(value: string): value is ReviewDecision {
  return (VALID_REVIEW_DECISIONS as readonly string[]).includes(value);
}

const VALID_ACTION_ITEM_STATUSES = ["PENDING", "IN_PROGRESS", "DONE", "CANCELLED", "OVERDUE"] as const;
type ActionItemStatus = (typeof VALID_ACTION_ITEM_STATUSES)[number];
function isValidActionItemStatus(value: string): value is ActionItemStatus {
  return (VALID_ACTION_ITEM_STATUSES as readonly string[]).includes(value);
}

const VALID_RISK_LEVELS = ["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const;
type RiskLevel = (typeof VALID_RISK_LEVELS)[number];
function isValidRiskLevel(value: string): value is RiskLevel {
  return (VALID_RISK_LEVELS as readonly string[]).includes(value);
}

const VALID_RISK_CATEGORIES = [
  "REGULATORY",
  "OPERATIONAL",
  "REPUTATIONAL",
  "FINANCIAL",
  "SECURITY",
  "PRIVACY",
] as const;
type RiskCategory = (typeof VALID_RISK_CATEGORIES)[number];
function isValidRiskCategory(value: string): value is RiskCategory {
  return (VALID_RISK_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Uploads a piece of evidence for a finding: validates the file type/size
 * (CMP-034/035), computes its SHA-256 hash server-side (CMP-017), stores it
 * in the private `compliance-evidence` Supabase Storage bucket, and records
 * the metadata row. Restricted to IT_MANAGER+ / the assigned analyst by RLS.
 */
export async function uploadEvidence(formData: FormData): Promise<void> {
  const findingId = formData.get("finding_id");
  const title = formData.get("title");
  const description = formData.get("description");
  const evidenceType = formData.get("evidence_type");
  const evidenceDate = formData.get("evidence_date");
  const file = formData.get("file");

  if (typeof findingId !== "string" || findingId.length === 0) {
    throw new Error("Apontamento inválido.");
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("O título é obrigatório.");
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error("A descrição é obrigatória.");
  }
  if (typeof evidenceType !== "string" || !isValidEvidenceType(evidenceType)) {
    throw new Error("Selecione o tipo de evidência.");
  }
  if (typeof evidenceDate !== "string" || evidenceDate.length === 0) {
    throw new Error("A data da evidência é obrigatória.");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecione um arquivo.");
  }

  // CMP-034/035: only listed MIME types are accepted, within their size limit.
  const accepted = ACCEPTED_TYPES[file.type];
  if (!accepted) {
    throw new Error(`Tipo de arquivo não permitido: ${file.type || "desconhecido"}.`);
  }
  if (file.size > accepted.maxBytes) {
    throw new Error(`Arquivo acima do limite de ${accepted.maxBytes / (1024 * 1024)} MB para este tipo.`);
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const bytes = new Uint8Array(await file.arrayBuffer());
  // CMP-017: hash computed on the server, before upload.
  const sha256Hash = createHash("sha256").update(bytes).digest("hex");

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `evidences/${findingId}/${crypto.randomUUID()}_${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from("compliance-evidence")
    .upload(storagePath, bytes, { contentType: file.type });

  if (uploadError) {
    throw new Error(`Não foi possível enviar o arquivo: ${uploadError.message}`);
  }

  const { error } = await supabase.schema("compliance").from("FindingEvidence").insert({
    finding_id: findingId,
    title: title.trim(),
    description: description.trim(),
    evidence_type: evidenceType,
    storage_path: storagePath,
    sha256_hash: sha256Hash,
    evidence_date: evidenceDate,
    uploaded_by: user.id,
  });

  if (error) {
    throw new Error(`Não foi possível registrar a evidência: ${error.message}`);
  }

  revalidatePath(`/compliance/findings/${findingId}`);
}

/**
 * Approves or rejects an evidence. Restricted to IT_MANAGER+ by RLS
 * ("FindingEvidence: managers can manage") — also enforces CMP-023 (SoD:
 * reviewer != uploader) and CMP-041 (rejection reason ≥ 30 chars) at the DB
 * level via CHECK constraints.
 */
export async function reviewEvidence(formData: FormData): Promise<void> {
  const evidenceId = formData.get("evidence_id");
  const findingId = formData.get("finding_id");
  const decision = formData.get("decision");
  const rejectionReason = formData.get("rejection_reason");

  if (typeof evidenceId !== "string" || evidenceId.length === 0) {
    throw new Error("Evidência inválida.");
  }
  if (typeof findingId !== "string" || findingId.length === 0) {
    throw new Error("Apontamento inválido.");
  }
  if (typeof decision !== "string" || !isValidReviewDecision(decision)) {
    throw new Error("Decisão inválida.");
  }
  const reviewDecision = decision;
  if (reviewDecision === "REJECTED" && (typeof rejectionReason !== "string" || rejectionReason.trim().length < 30)) {
    throw new Error("Informe o motivo da rejeição com pelo menos 30 caracteres.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { error } = await supabase
    .schema("compliance")
    .from("FindingEvidence")
    .update({
      review_status: reviewDecision,
      reviewed_by: user.id,
      rejection_reason: reviewDecision === "REJECTED" ? (rejectionReason as string).trim() : null,
    })
    .eq("id", evidenceId);

  if (error) {
    throw new Error(`Não foi possível registrar a revisão: ${error.message}`);
  }

  revalidatePath(`/compliance/findings/${findingId}`);
}

/**
 * Adds an action-plan item to a finding. The due-date-not-after-finding
 * check (CMP-019) and the 30-char minimum description (part of §9.1) are
 * enforced by DB trigger/CHECK.
 */
export async function addActionItem(formData: FormData): Promise<void> {
  const findingId = formData.get("finding_id");
  const description = formData.get("description");
  const responsibleId = formData.get("responsible_id");
  const dueDate = formData.get("due_date");

  if (typeof findingId !== "string" || findingId.length === 0) {
    throw new Error("Apontamento inválido.");
  }
  if (typeof description !== "string" || description.trim().length < 30) {
    throw new Error("A descrição deve ter pelo menos 30 caracteres.");
  }
  if (typeof responsibleId !== "string" || responsibleId.length === 0) {
    throw new Error("Selecione o responsável.");
  }
  if (typeof dueDate !== "string" || dueDate.length === 0) {
    throw new Error("O prazo é obrigatório.");
  }

  const supabase = await createClient();

  const { count } = await supabase
    .schema("compliance")
    .from("ActionItem")
    .select("id", { count: "exact", head: true })
    .eq("finding_id", findingId);

  const { error } = await supabase.schema("compliance").from("ActionItem").insert({
    finding_id: findingId,
    sequence_number: (count ?? 0) + 1,
    description: description.trim(),
    responsible_id: responsibleId,
    due_date: dueDate,
  });

  if (error) {
    throw new Error(`Não foi possível adicionar o item do plano de ação: ${error.message}`);
  }

  revalidatePath(`/compliance/findings/${findingId}`);
}

/** Updates an action-plan item's progress. */
export async function updateActionItemProgress(formData: FormData): Promise<void> {
  const actionItemId = formData.get("action_item_id");
  const findingId = formData.get("finding_id");
  const status = formData.get("status");
  const completionPercentage = formData.get("completion_percentage");

  if (typeof actionItemId !== "string" || actionItemId.length === 0) {
    throw new Error("Item inválido.");
  }
  if (typeof findingId !== "string" || findingId.length === 0) {
    throw new Error("Apontamento inválido.");
  }
  const pct = Number(completionPercentage);
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
    throw new Error("Percentual inválido.");
  }
  const itemStatus: ActionItemStatus =
    typeof status === "string" && isValidActionItemStatus(status) ? status : "IN_PROGRESS";

  const supabase = await createClient();

  const { error } = await supabase
    .schema("compliance")
    .from("ActionItem")
    .update({ status: itemStatus, completion_percentage: pct })
    .eq("id", actionItemId);

  if (error) {
    throw new Error(`Não foi possível atualizar o item: ${error.message}`);
  }

  revalidatePath(`/compliance/findings/${findingId}`);
}

/**
 * Creates or updates the finding's risk assessment. CMP-085 (contingency
 * plan required for CRITICAL/HIGH risk levels, per the 5×5 matrix) is
 * enforced by a DB trigger.
 */
export async function saveFindingRisk(formData: FormData): Promise<void> {
  const findingId = formData.get("finding_id");
  const description = formData.get("description");
  const probability = formData.get("probability");
  const impact = formData.get("impact");
  const category = formData.get("category");
  const contingencyPlan = formData.get("contingency_plan");
  const responsibleId = formData.get("responsible_id");

  if (typeof findingId !== "string" || findingId.length === 0) {
    throw new Error("Apontamento inválido.");
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error("A descrição do risco é obrigatória.");
  }
  if (typeof probability !== "string" || !isValidRiskLevel(probability)) {
    throw new Error("Selecione a probabilidade.");
  }
  if (typeof impact !== "string" || !isValidRiskLevel(impact)) {
    throw new Error("Selecione o impacto.");
  }
  if (typeof category !== "string" || !isValidRiskCategory(category)) {
    throw new Error("Selecione a categoria.");
  }
  if (typeof responsibleId !== "string" || responsibleId.length === 0) {
    throw new Error("Selecione o responsável.");
  }

  const supabase = await createClient();

  const { error } = await supabase.schema("compliance").from("FindingRisk").upsert(
    {
      finding_id: findingId,
      description: description.trim(),
      probability,
      impact,
      category,
      contingency_plan:
        typeof contingencyPlan === "string" && contingencyPlan.trim().length > 0
          ? contingencyPlan.trim()
          : null,
      responsible_id: responsibleId,
    },
    { onConflict: "finding_id" },
  );

  if (error) {
    throw new Error(`Não foi possível salvar o risco: ${error.message}`);
  }

  revalidatePath(`/compliance/findings/${findingId}`);
}
