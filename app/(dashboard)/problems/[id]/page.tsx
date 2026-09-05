import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

import { linkIncident, unlinkIncident, updateProblemStatus } from "./actions";

export const metadata: Metadata = { title: "Detalhe do Problema" };

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Andamento",
  PENDING: "Pendente",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
};

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const supabase = await createClient();

  // RLS ("Problem: IT staff can manage") restricts this to IT staff — a
  // non-staff viewer simply gets no row, same as the /problems list.
  const { data: problem, error } = await supabase
    .schema("ticket")
    .from("Problem")
    .select(
      "id, title, description, root_cause, is_known_error, status, related_incident_count, owner_id, created_at",
    )
    .eq("id", id)
    .single();

  if (error || !problem) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link className="text-muted-foreground text-sm hover:underline" href="/problems">
          ← Voltar para Problemas
        </Link>
        <div className="border-border mt-4 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Problema não encontrado, ou você não tem permissão para vê-lo.
          </p>
        </div>
      </div>
    );
  }

  const [linksResult, allIncidentsResult] = await Promise.all([
    supabase
      .schema("ticket")
      .from("IncidentProblemLink")
      .select("incident_id")
      .eq("problem_id", id),
    supabase
      .schema("ticket")
      .from("Incident")
      .select("id, title, status")
      .order("created_at", { ascending: false }),
  ]);

  const linkedIncidentIds = new Set((linksResult.data ?? []).map((link) => link.incident_id));
  const allIncidents = allIncidentsResult.data ?? [];
  const linkedIncidents = allIncidents.filter((incident) => linkedIncidentIds.has(incident.id));
  const linkableIncidents = allIncidents.filter((incident) => !linkedIncidentIds.has(incident.id));

  return (
    <div className="mx-auto max-w-2xl">
      <Link className="text-muted-foreground text-sm hover:underline" href="/problems">
        ← Voltar para Problemas
      </Link>

      <div className="border-border bg-card mt-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-foreground text-xl font-semibold">{problem.title}</h1>
          {problem.is_known_error && (
            <span className="bg-priority-medium/10 text-priority-medium shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium">
              Erro Conhecido
            </span>
          )}
        </div>
        <p className="text-foreground mt-3 text-sm whitespace-pre-wrap">{problem.description}</p>
        {problem.root_cause && (
          <div className="bg-muted mt-3 rounded-md p-3">
            <p className="text-muted-foreground text-xs font-medium">Causa raiz</p>
            <p className="text-foreground mt-1 text-sm whitespace-pre-wrap">{problem.root_cause}</p>
          </div>
        )}
        <p className="text-muted-foreground mt-4 text-xs">
          Aberto em {new Date(problem.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="border-border bg-card mt-4 flex items-center gap-3 rounded-lg border p-4">
        <form action={updateProblemStatus} className="flex items-center gap-2">
          <input name="problem_id" type="hidden" value={problem.id} />
          <select
            className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
            defaultValue={problem.status}
            key={problem.status}
            name="status"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status] ?? status}
              </option>
            ))}
          </select>
          <Button size="sm" type="submit">
            Atualizar status
          </Button>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="text-foreground mb-3 font-medium">
          Incidentes Relacionados ({linkedIncidents.length})
        </h2>

        {linkedIncidents.length > 0 && (
          <ul className="mb-4 space-y-3">
            {linkedIncidents.map((incident) => (
              <li
                className="border-border bg-card flex items-center justify-between gap-4 rounded-lg border p-3"
                key={incident.id}
              >
                <Link
                  className="text-foreground text-sm hover:underline"
                  href={`/incidents/${incident.id}`}
                >
                  {incident.title}
                </Link>
                <form action={unlinkIncident}>
                  <input name="problem_id" type="hidden" value={problem.id} />
                  <input name="incident_id" type="hidden" value={incident.id} />
                  <Button size="sm" type="submit" variant="outline">
                    Desvincular
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {linkableIncidents.length > 0 && (
          <form
            action={linkIncident}
            className="border-border bg-card flex items-center gap-2 rounded-lg border p-4"
          >
            <input name="problem_id" type="hidden" value={problem.id} />
            <select
              required
              className="border-input bg-background text-foreground flex-1 rounded-md border px-2 py-1.5 text-sm"
              defaultValue=""
              name="incident_id"
            >
              <option disabled value="">
                Vincular incidente...
              </option>
              {linkableIncidents.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  {incident.title}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit">
              Vincular
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
