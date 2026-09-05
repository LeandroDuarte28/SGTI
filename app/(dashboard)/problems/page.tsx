import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Problemas</h1>
          <p className="text-muted-foreground text-sm">
            Causas raiz investigadas pela equipe de TI, agrupando incidentes relacionados.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <a href="/api/reports/problems">Exportar CSV</a>
          </Button>
          <Button asChild>
            <Link href="/problems/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Problema
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
          Não foi possível carregar os problemas: {error.message}
        </div>
      )}

      {!error && problems && problems.length === 0 && (
        <div className="border-border rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum problema registrado ainda, ou você não tem permissão para ver este módulo
            (restrito à equipe de TI).
          </p>
        </div>
      )}

      {!error && problems && problems.length > 0 && (
        <ul className="space-y-3">
          {problems.map((problem) => (
            <li key={problem.id}>
              <Link
                className="border-border bg-card hover:bg-muted/50 block rounded-lg border p-4 shadow-sm transition-colors"
                href={`/problems/${problem.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-foreground font-medium">{problem.title}</h2>
                  <div className="flex shrink-0 gap-2">
                    {problem.is_known_error && (
                      <span className="bg-priority-medium/10 text-priority-medium rounded-full px-2.5 py-0.5 text-xs font-medium">
                        Erro Conhecido
                      </span>
                    )}
                    <Pill
                      className={STATUS_CLASS[problem.status] ?? ""}
                      label={STATUS_LABEL[problem.status] ?? problem.status}
                    />
                  </div>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {problem.related_incident_count}{" "}
                  {problem.related_incident_count === 1
                    ? "incidente relacionado"
                    : "incidentes relacionados"}{" "}
                  · Aberto em {new Date(problem.created_at).toLocaleDateString("pt-BR")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
