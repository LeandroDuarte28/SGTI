"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action — creates a project owned by the current user. RLS
 * ("Project: managers can manage all" and "Project: IT staff can read")
 * gates who sees this; anyone authenticated can hit the action, but
 * insert itself has no per-role WITH CHECK beyond the schema's grants, so
 * this mirrors the existing convention of trusting the app layer here.
 */
export async function createProject(formData: FormData): Promise<void> {
  const name = formData.get("name");
  const description = formData.get("description");
  const budgetId = formData.get("budget_id");
  const startDate = formData.get("start_date");
  const endDate = formData.get("end_date");
  const githubRepo = formData.get("github_repo");

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("O nome é obrigatório.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: project, error } = await supabase
    .schema("project")
    .from("Project")
    .insert({
      name: name.trim(),
      description: typeof description === "string" && description.trim().length > 0 ? description.trim() : null,
      budget_id: typeof budgetId === "string" && budgetId !== "" ? budgetId : null,
      start_date: typeof startDate === "string" && startDate.length > 0 ? startDate : null,
      end_date: typeof endDate === "string" && endDate.length > 0 ? endDate : null,
      github_repo: typeof githubRepo === "string" && githubRepo.trim().length > 0 ? githubRepo.trim() : null,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error || !project) {
    throw new Error(`Não foi possível criar o projeto: ${error?.message ?? "erro desconhecido"}`);
  }

  redirect(`/projects/${project.id}`);
}
