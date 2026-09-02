import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/database.types";

import { addComment, assignToMe, escalateIncident, resolveEscalation, updateStatus } from "./actions";

export const metadata: Metadata = { title: "Detalhe do Incidente" };

type SystemRole = Database["shared"]["Enums"]["SystemRole"];

const IT_STAFF_ROLES: SystemRole[] = ["SUPER_ADMIN", "IT_MANAGER", "IT_ANALYST", "IT_TECHNICIAN"];

const PRIORITY_LABEL: Record<string, string> = {
  CRITICAL: "Crítica",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Andamento",
  PENDING: "Pendente",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
};

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const user = await getAuthUser();
  const isItStaff = user.roles.some((role) => IT_STAFF_ROLES.includes(role));

  const supabase = await createClient();

  const { data: incident, error } = await supabase
    .schema("ticket")
    .from("Incident")
    .select("id, title, description, status, priority, reporter_id, assignee_id, created_at")
    .eq("id", id)
    .single();

  if (error || !incident) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link className="text-sm text-muted-foreground hover:underline" href="/incidents">
          ← Voltar para Incidentes
        </Link>
        <div className="mt-4 rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Incidente não encontrado, ou você não tem permissão para vê-lo.
          </p>
        </div>
      </div>
    );
  }

  const { data: comments } = await supabase
    .schema("ticket")
    .from("TicketComment")
    .select("id, body, author_id, created_at")
    .eq("ticket_type", "INCIDENT")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  const { data: escalations } = await supabase
    .schema("ticket")
    .from("EscalationRecord")
    .select("id, escalated_to, reason, escalated_at, resolved_at")
    .eq("incident_id", id)
    .order("escalated_at", { ascending: false });

  const { data: itStaffRoles } = isItStaff
    ? await supabase
        .schema("shared")
        .from("UserRole")
        .select("user_id")
        .in("role", IT_STAFF_ROLES)
    : { data: null };

  const itStaffIds = [...new Set((itStaffRoles ?? []).map((r) => r.user_id))].filter(
    (staffId) => staffId !== user.id,
  );

  const authorIds = [
    incident.reporter_id,
    incident.assignee_id,
    ...(comments ?? []).map((c) => c.author_id),
    ...(escalations ?? []).map((e) => e.escalated_to),
    ...itStaffIds,
  ].filter((value): value is string => value !== null);

  const { data: profiles } = await supabase
    .schema("shared")
    .from("UserProfile")
    .select("id, full_name")
    .in("id", authorIds.length > 0 ? authorIds : ["00000000-0000-0000-0000-000000000000"]);

  function nameFor(userId: string | null): string {
    if (!userId) {
      return "—";
    }
    return profiles?.find((p) => p.id === userId)?.full_name ?? "Usuário desconhecido";
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link className="text-sm text-muted-foreground hover:underline" href="/incidents">
        ← Voltar para Incidentes
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-foreground">{incident.title}</h1>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {PRIORITY_LABEL[incident.priority] ?? incident.priority}
          </span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{incident.description}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Reportado por {nameFor(incident.reporter_id)} em{" "}
          {new Date(incident.created_at).toLocaleDateString("pt-BR")} · Responsável:{" "}
          {nameFor(incident.assignee_id)}
        </p>
      </div>

      {isItStaff && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
          <form action={updateStatus} className="flex items-center gap-2">
            <input name="incident_id" type="hidden" value={incident.id} />
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
              defaultValue={incident.status}
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

          {!incident.assignee_id && (
            <form action={assignToMe}>
              <input name="incident_id" type="hidden" value={incident.id} />
              <Button size="sm" type="submit" variant="outline">
                Atribuir a mim
              </Button>
            </form>
          )}
        </div>
      )}

      {!isItStaff && (
        <div className="mt-4 inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Status: {STATUS_LABEL[incident.status] ?? incident.status}
        </div>
      )}

      {(isItStaff || (escalations && escalations.length > 0)) && (
        <div className="mt-6">
          <h2 className="mb-3 font-medium text-foreground">Escalonamento</h2>

          {escalations && escalations.length > 0 && (
            <ul className="mb-4 space-y-3">
              {escalations.map((escalation) => (
                <li className="rounded-lg border border-border bg-card p-3" key={escalation.id}>
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-foreground">
                      Escalonado para {nameFor(escalation.escalated_to)}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        escalation.resolved_at
                          ? "bg-status-resolved/10 text-status-resolved"
                          : "bg-sla-warning/10 text-sla-warning"
                      }`}
                    >
                      {escalation.resolved_at ? "Resolvido" : "Em aberto"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{escalation.reason}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(escalation.escalated_at).toLocaleDateString("pt-BR")}
                    {escalation.resolved_at &&
                      ` · resolvido em ${new Date(escalation.resolved_at).toLocaleDateString("pt-BR")}`}
                  </p>
                  {isItStaff && !escalation.resolved_at && (
                    <form action={resolveEscalation} className="mt-2">
                      <input name="incident_id" type="hidden" value={incident.id} />
                      <input name="escalation_id" type="hidden" value={escalation.id} />
                      <Button size="sm" type="submit" variant="outline">
                        Marcar como resolvido
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isItStaff && itStaffIds.length > 0 && (
            <form action={escalateIncident} className="space-y-2 rounded-lg border border-border bg-card p-4">
              <input name="incident_id" type="hidden" value={incident.id} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  required
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                  defaultValue=""
                  name="escalated_to"
                >
                  <option disabled value="">
                    Escalonar para...
                  </option>
                  {itStaffIds.map((staffId) => (
                    <option key={staffId} value={staffId}>
                      {nameFor(staffId)}
                    </option>
                  ))}
                </select>
                <input
                  required
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  name="reason"
                  placeholder="Motivo do escalonamento"
                  type="text"
                />
                <Button size="sm" type="submit">
                  Escalonar
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 font-medium text-foreground">Comentários</h2>

        {comments && comments.length > 0 && (
          <ul className="mb-4 space-y-3">
            {comments.map((comment) => (
              <li className="rounded-lg border border-border bg-card p-3" key={comment.id}>
                <p className="text-sm text-foreground">{comment.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nameFor(comment.author_id)} ·{" "}
                  {new Date(comment.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form action={addComment} className="space-y-2">
          <input name="incident_id" type="hidden" value={incident.id} />
          <textarea
            required
            className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            name="body"
            placeholder="Escreva um comentário..."
          />
          <div className="flex justify-end">
            <Button size="sm" type="submit">
              Comentar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
