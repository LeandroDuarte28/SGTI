"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const VALID_TYPES = ["INTERNAL", "EXTERNAL", "CONSULTORIA", "REGULATORY"] as const;
type AuditType = (typeof VALID_TYPES)[number];

function isValidType(value: string): value is AuditType {
  return (VALID_TYPES as readonly string[]).includes(value);
}

/**
 * Server Action — creates a compliance audit engagement. Restricted to
 * IT_MANAGER+ by RLS ("ComplianceAudit: managers can manage"). The code
 * (AUD-YYYY-NNNN) is generated server-side by a DB trigger.
 */
export async function createAudit(formData: FormData): Promise<void> {
  const name = formData.get("name");
  const type = formData.get("type");
  const consultancyId = formData.get("consultancy_id");
  const scope = formData.get("scope");
  const startDate = formData.get("start_date");
  const endDate = formData.get("end_date");
  const leadAuditorName = formData.get("lead_auditor_name");
  const normIds = formData.getAll("norm_ids").filter((v): v is string => typeof v === "string");

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("O nome é obrigatório.");
  }
  if (typeof type !== "string" || !isValidType(type)) {
    throw new Error("Selecione um tipo válido.");
  }
  if (typeof scope !== "string" || scope.trim().length === 0) {
    throw new Error("O escopo é obrigatório.");
  }
  if (typeof startDate !== "string" || startDate.length === 0) {
    throw new Error("A data de início é obrigatória.");
  }
  if (typeof endDate !== "string" || endDate.length === 0) {
    throw new Error("A data de fim é obrigatória.");
  }
  if (normIds.length === 0) {
    throw new Error("Selecione ao menos uma norma a ser avaliada.");
  }
  if ((type === "EXTERNAL" || type === "CONSULTORIA") && (typeof consultancyId !== "string" || consultancyId === "")) {
    throw new Error("Auditorias externas ou de consultoria exigem uma consultoria vinculada.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: audit, error } = await supabase
    .schema("compliance")
    .from("ComplianceAudit")
    .insert({
      code: "", // overwritten by trg_compliance_audit_code (AUD-YYYY-NNNN)
      name: name.trim(),
      type,
      consultancy_id: typeof consultancyId === "string" && consultancyId !== "" ? consultancyId : null,
      scope: scope.trim(),
      start_date: startDate,
      end_date: endDate,
      lead_auditor_name:
        typeof leadAuditorName === "string" && leadAuditorName.trim().length > 0
          ? leadAuditorName.trim()
          : null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !audit) {
    throw new Error(`Não foi possível criar a auditoria: ${error?.message ?? "erro desconhecido"}`);
  }

  const { error: linkError } = await supabase
    .schema("compliance")
    .from("ComplianceAuditNorm")
    .insert(normIds.map((normId) => ({ audit_id: audit.id, norm_id: normId })));

  if (linkError) {
    throw new Error(`Auditoria criada, mas não foi possível vincular as normas: ${linkError.message}`);
  }

  redirect(`/compliance/audits/${audit.id}`);
}
