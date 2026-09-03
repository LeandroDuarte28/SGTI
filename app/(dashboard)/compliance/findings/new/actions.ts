"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VALID_FINDING_TYPES = ["NON_CONFORMITY", "OBSERVATION", "IMPROVEMENT_OPPORTUNITY"] as const;
type FindingType = (typeof VALID_FINDING_TYPES)[number];
function isValidFindingType(value: string): value is FindingType {
  return (VALID_FINDING_TYPES as readonly string[]).includes(value);
}

const VALID_CRITICALITIES = ["CRITICAL", "MAJOR", "MINOR", "OBSERVATION"] as const;
type Criticality = (typeof VALID_CRITICALITIES)[number];
function isValidCriticality(value: string): value is Criticality {
  return (VALID_CRITICALITIES as readonly string[]).includes(value);
}

/**
 * Server Action — creates a compliance finding ("Apontamento"). Restricted
 * to IT_MANAGER+ by RLS ("ComplianceFinding: managers can manage"). The
 * code (CMP-YYYY-NNNNNN), recurrence flag and the CMP-002/CMP-014/CMP-043
 * date checks are handled by DB triggers/constraints — see
 * supabase/migrations/20260727000000_compliance_findings_schema.sql.
 */
export async function createFinding(formData: FormData): Promise<void> {
  const auditId = formData.get("audit_id");
  const normItemId = formData.get("norm_item_id");
  const findingType = formData.get("finding_type");
  const title = formData.get("title");
  const description = formData.get("description");
  const criticality = formData.get("criticality");
  const analystId = formData.get("analyst_id");
  const dueDate = formData.get("due_date");
  const isUrgent = formData.get("is_urgent") === "on";
  const estimatedCost = formData.get("estimated_cost");

  if (typeof auditId !== "string" || auditId.length === 0) {
    throw new Error("Auditoria inválida.");
  }
  if (typeof normItemId !== "string" || normItemId.length === 0) {
    throw new Error("Selecione um item normativo.");
  }
  if (typeof findingType !== "string" || !isValidFindingType(findingType)) {
    throw new Error("Selecione um tipo de apontamento válido.");
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("O título é obrigatório.");
  }
  if (typeof description !== "string" || description.trim().length === 0) {
    throw new Error("A descrição é obrigatória.");
  }
  if (typeof criticality !== "string" || !isValidCriticality(criticality)) {
    throw new Error("Selecione uma criticidade válida.");
  }
  if (typeof analystId !== "string" || analystId.length === 0) {
    throw new Error("Selecione o analista responsável.");
  }
  if (typeof dueDate !== "string" || dueDate.length === 0) {
    throw new Error("A data limite é obrigatória.");
  }
  // CMP-014: CRITICAL findings can't have a deadline more than 90 days out.
  if (criticality === "CRITICAL") {
    const days = (new Date(dueDate).getTime() - Date.now()) / 86_400_000;
    if (days > 90) {
      throw new Error("Apontamentos CRITICAL não podem ter prazo superior a 90 dias.");
    }
  }

  const supabase = await createClient();

  const { data: normItem, error: normItemError } = await supabase
    .schema("compliance")
    .from("NormItem")
    .select("norm_id, is_applicable")
    .eq("id", normItemId)
    .single();

  if (normItemError || !normItem) {
    throw new Error("Item normativo não encontrado.");
  }
  // CMP-092: can't create a finding for an item marked not applicable.
  if (!normItem.is_applicable) {
    throw new Error("Este item normativo não é aplicável e não pode receber apontamentos.");
  }

  const parsedCost =
    typeof estimatedCost === "string" && estimatedCost.trim().length > 0 ? Number(estimatedCost) : null;

  const { data: finding, error } = await supabase
    .schema("compliance")
    .from("ComplianceFinding")
    .insert({
      code: "", // overwritten by trg_compliance_finding_insert (CMP-YYYY-NNNNNN)
      audit_id: auditId,
      norm_id: normItem.norm_id,
      norm_item_id: normItemId,
      finding_type: findingType,
      title: title.trim(),
      description: description.trim(),
      criticality,
      analyst_id: analystId,
      due_date: dueDate,
      is_urgent: isUrgent,
      estimated_cost: parsedCost,
    })
    .select("id")
    .single();

  if (error || !finding) {
    throw new Error(`Não foi possível criar o apontamento: ${error?.message ?? "erro desconhecido"}`);
  }

  redirect(`/compliance/findings/${finding.id}`);
}
