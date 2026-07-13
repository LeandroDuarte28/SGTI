import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Problemas" };

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Andamento",
  PENDING: "Pendente",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
};

const STATUS_CLASS: Record<string, string> = {
  OPEN: "bg-status-open/10 text-status-open",
  IN_PROGRESS: "bg-status-in-progress/10 text-status-in-progress",
  PENDING: "bg-status-pending/10 text-status-pending",
  RESOLVED: "bg-status-resolved/10 text-status-resolved",
  CLOSED: "bg-status-closed/10 text-status-closed",
};

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function ProblemsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: this table is IT-staff only (see
  // supabase/migrations/20260712000200_ticket_schema.sql). END_USERs will
  // simply see an empty list — that's expected, not an error.
  const { data: problems, error } = await supabase
    .schema("ticket")
    .from("Problem")
    .select("id, title, status, is_known_error, related_incident_count, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Problemas</h1>
        <p className="text-sm text-muted-foreground">
          Causas raiz investigadas pela equipe de TI, agrupando incidentes relacionados.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os problemas: {error.message}
        </div>
      )}

      {!error && problems && problems.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum problema registrado ainda, ou você não tem permissão para ver este módulo
            (restrito à equipe de TI).
          </p>
        </div>
      )}

      {!error && problems && problems.length > 0 && (
        <ul className="space-y-3">
          {problems.map((problem) => (
            <li
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
              key={problem.id}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-medium text-foreground">{problem.title}</h2>
                <div className="flex shrink-0 gap-2">
                  {problem.is_known_error && (
                    <span className="rounded-full bg-priority-medium/10 px-2.5 py-0.5 text-xs font-medium text-priority-medium">
                      Erro Conhecido
                    </span>
                  )}
                  <Pill
                    className={STATUS_CLASS[problem.status] ?? ""}
                    label={STATUS_LABEL[problem.status] ?? problem.status}
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {problem.related_incident_count}{" "}
                {problem.related_incident_count === 1
                  ? "incidente relacionado"
                  : "incidentes relacionados"}{" "}
                · Aberto em {new Date(problem.created_at).toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
