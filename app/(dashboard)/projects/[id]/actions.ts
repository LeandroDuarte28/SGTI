"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;
type ProjectStatus = (typeof VALID_STATUSES)[number];
function isValidStatus(value: string): value is ProjectStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

/** Updates a project's status. RLS: owner, or IT_MANAGER+. */
export async function updateProjectStatus(formData: FormData): Promise<void> {
  const projectId = formData.get("project_id");
  const status = formData.get("status");

  if (typeof projectId !== "string" || projectId.length === 0) {
    throw new Error("Projeto inválido.");
  }
  if (typeof status !== "string" || !isValidStatus(status)) {
    throw new Error("Status inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase.schema("project").from("Project").update({ status }).eq("id", projectId);

  if (error) {
    throw new Error(`Não foi possível atualizar o projeto: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
}

/** Adds a milestone. Restricted to IT staff by RLS ("Milestone: IT staff can manage"). */
export async function addMilestone(formData: FormData): Promise<void> {
  const projectId = formData.get("project_id");
  const title = formData.get("title");
  const dueDate = formData.get("due_date");

  if (typeof projectId !== "string" || projectId.length === 0) {
    throw new Error("Projeto inválido.");
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("O título do marco é obrigatório.");
  }

  const supabase = await createClient();
  const { error } = await supabase.schema("project").from("Milestone").insert({
    project_id: projectId,
    title: title.trim(),
    due_date: typeof dueDate === "string" && dueDate.length > 0 ? dueDate : null,
  });

  if (error) {
    throw new Error(`Não foi possível adicionar o marco: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
}

/** Marks a milestone as completed. */
export async function completeMilestone(formData: FormData): Promise<void> {
  const milestoneId = formData.get("milestone_id");
  const projectId = formData.get("project_id");

  if (typeof milestoneId !== "string" || milestoneId.length === 0) {
    throw new Error("Marco inválido.");
  }
  if (typeof projectId !== "string" || projectId.length === 0) {
    throw new Error("Projeto inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("project")
    .from("Milestone")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", milestoneId);

  if (error) {
    throw new Error(`Não foi possível concluir o marco: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
}

const VALID_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
type RiskLevel = (typeof VALID_RISK_LEVELS)[number];
function isValidRiskLevel(value: string): value is RiskLevel {
  return (VALID_RISK_LEVELS as readonly string[]).includes(value);
}

/** Adds a project risk. Restricted to IT staff by RLS ("Risk: IT staff can manage"). */
export async function addRisk(formData: FormData): Promise<void> {
  const projectId = formData.get("project_id");
  const description = formData.get("description");
  const probability = formData.get("probability");
  const impact = formData.get("impact");
  const mitigation = formData.get("mitigation");

  if (typeof projectId !== "string" || projectId.length === 0) {
    throw new Error("Projeto inválido.");
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

  const supabase = await createClient();
  const { error } = await supabase.schema("project").from("Risk").insert({
    project_id: projectId,
    description: description.trim(),
    probability,
    impact,
    mitigation: typeof mitigation === "string" && mitigation.trim().length > 0 ? mitigation.trim() : null,
  });

  if (error) {
    throw new Error(`Não foi possível adicionar o risco: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
}

/** Marks a project risk as resolved. */
export async function resolveRisk(formData: FormData): Promise<void> {
  const riskId = formData.get("risk_id");
  const projectId = formData.get("project_id");

  if (typeof riskId !== "string" || riskId.length === 0) {
    throw new Error("Risco inválido.");
  }
  if (typeof projectId !== "string" || projectId.length === 0) {
    throw new Error("Projeto inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("project")
    .from("Risk")
    .update({ is_resolved: true })
    .eq("id", riskId);

  if (error) {
    throw new Error(`Não foi possível resolver o risco: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
}

const VALID_REF_TYPES = ["ISSUE", "PULL_REQUEST", "COMMIT"] as const;
type GithubRefType = (typeof VALID_REF_TYPES)[number];
function isValidRefType(value: string): value is GithubRefType {
  return (VALID_REF_TYPES as readonly string[]).includes(value);
}

/** Links a GitHub issue/PR/commit to the project. */
export async function addGithubReference(formData: FormData): Promise<void> {
  const projectId = formData.get("project_id");
  const refType = formData.get("ref_type");
  const url = formData.get("url");
  const title = formData.get("title");

  if (typeof projectId !== "string" || projectId.length === 0) {
    throw new Error("Projeto inválido.");
  }
  if (typeof refType !== "string" || !isValidRefType(refType)) {
    throw new Error("Selecione um tipo de referência válido.");
  }
  if (typeof url !== "string" || url.trim().length === 0) {
    throw new Error("A URL é obrigatória.");
  }

  const supabase = await createClient();
  const { error } = await supabase.schema("project").from("GithubReference").insert({
    project_id: projectId,
    ref_type: refType,
    url: url.trim(),
    title: typeof title === "string" && title.trim().length > 0 ? title.trim() : null,
  });

  if (error) {
    throw new Error(`Não foi possível adicionar a referência: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
}
