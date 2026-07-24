import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { Button } from "@/components/ui/button";

import { addComment, assignToMe, updateStatus } from "./actions";

export const metadata: Metadata = { title: "Detalhe do Incidente" };

const IT_STAFF_ROLES = ["SUPER_ADMIN", "IT_MANAGER", "IT_ANALYST", "IT_TECHNICIAN"];

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

  const authorIds = [
    incident.reporter_id,
    incident.assignee_id,
    ...(comments ?? []).map((c) => c.author_id),
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
