import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatDateOnly } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Projetos" };

const STATUS_LABEL: Record<string, string> = {
  PLANNING: "Planejamento",
  IN_PROGRESS: "Em Andamento",
  ON_HOLD: "Em Espera",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
  PLANNING: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-status-in-progress/10 text-status-in-progress",
  ON_HOLD: "bg-priority-medium/10 text-priority-medium",
  COMPLETED: "bg-status-resolved/10 text-status-resolved",
  CANCELLED: "bg-destructive/10 text-destructive",
};

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function ProjectsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: IT staff can read all projects; the owner can update their own
  // (see supabase/migrations/20260712000800_project_schema.sql).
  const [projectsResult, profilesResult] = await Promise.all([
    supabase
      .schema("project")
      .from("Project")
      .select("id, name, description, status, owner_id, start_date, end_date, github_repo")
      .order("created_at", { ascending: false }),
    supabase.schema("shared").from("UserProfile").select("id, full_name"),
  ]);

  const error = projectsResult.error ?? profilesResult.error;
  const projects = projectsResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projetos</h1>
          <p className="text-sm text-muted-foreground">Projetos de TI em andamento e planejados.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os projetos: {error.message}
        </div>
      )}

      {!error && projects.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado ainda.</p>
        </div>
      )}

      {!error && projects.length > 0 && (
        <ul className="space-y-3">
          {projects.map((project) => {
            const owner = profiles.find((profile) => profile.id === project.owner_id);
            return (
              <li key={project.id}>
                <Link
                  className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
                  href={`/projects/${project.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-medium text-foreground">{project.name}</h2>
                    <Pill
                      className={STATUS_CLASS[project.status] ?? ""}
                      label={STATUS_LABEL[project.status] ?? project.status}
                    />
                  </div>
                  {project.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {owner && `Responsável: ${owner.full_name}`}
                    {project.start_date && ` · Início: ${formatDateOnly(project.start_date)}`}
                    {project.github_repo && ` · ${project.github_repo}`}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
