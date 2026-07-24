import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Incidentes" };

const PRIORITY_LABEL: Record<string, string> = {
  CRITICAL: "Crítica",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

const PRIORITY_CLASS: Record<string, string> = {
  CRITICAL: "bg-priority-critical/10 text-priority-critical",
  HIGH: "bg-priority-high/10 text-priority-high",
  MEDIUM: "bg-priority-medium/10 text-priority-medium",
  LOW: "bg-priority-low/10 text-priority-low",
};

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

export default async function IncidentsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS already scopes this correctly: END_USER sees only what they
  // reported/were assigned; IT staff sees everything (see
  // supabase/migrations/20260712000200_ticket_schema.sql policies).
  const { data: incidents, error } = await supabase
    .schema("ticket")
    .from("Incident")
    .select("id, title, status, priority, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Incidentes</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe e gerencie os incidentes reportados.
          </p>
        </div>
        <Button asChild>
          <Link href="/incidents/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Incidente
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os incidentes: {error.message}
        </div>
      )}

      {!error && incidents && incidents.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum incidente encontrado. Quando a tela de criação estiver pronta, os incidentes
            reportados aparecerão aqui.
          </p>
        </div>
      )}

      {!error && incidents && incidents.length > 0 && (
        <ul className="space-y-3">
          {incidents.map((incident) => (
            <li
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
              key={incident.id}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-medium text-foreground">{incident.title}</h2>
                <div className="flex shrink-0 gap-2">
                  <Pill
                    className={PRIORITY_CLASS[incident.priority] ?? ""}
                    label={PRIORITY_LABEL[incident.priority] ?? incident.priority}
                  />
                  <Pill
                    className={STATUS_CLASS[incident.status] ?? ""}
                    label={STATUS_LABEL[incident.status] ?? incident.status}
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Aberto em {new Date(incident.created_at).toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
