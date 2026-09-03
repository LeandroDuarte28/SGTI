import { createClient } from "@/lib/supabase/server";
import { csvResponse, toCsv } from "@/lib/utils/csv";
import { formatDate } from "@/lib/utils/format-date";
import { fetchUserNames } from "@/lib/utils/user-names";

export async function GET(): Promise<Response> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: incidents, error } = await supabase
    .schema("ticket")
    .from("Incident")
    .select("id, title, status, priority, reporter_id, assignee_id, created_at, resolved_at, closed_at, sla_breached_at")
    .order("created_at", { ascending: false });

  if (error || !incidents) {
    return new Response(`Erro ao gerar relatório: ${error?.message ?? "desconhecido"}`, { status: 500 });
  }

  const names = await fetchUserNames(supabase, [
    ...incidents.map((i) => i.reporter_id),
    ...incidents.map((i) => i.assignee_id),
  ]);

  const rows = incidents.map((i) => ({
    id: i.id,
    title: i.title,
    status: i.status,
    priority: i.priority,
    reporter: i.reporter_id ? (names.get(i.reporter_id) ?? i.reporter_id) : "",
    assignee: i.assignee_id ? (names.get(i.assignee_id) ?? i.assignee_id) : "",
    created_at: formatDate(i.created_at),
    resolved_at: i.resolved_at ? formatDate(i.resolved_at) : "",
    closed_at: i.closed_at ? formatDate(i.closed_at) : "",
    sla_status: i.sla_breached_at ? "Violado" : "Dentro do prazo",
  }));

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "title", label: "Título" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Prioridade" },
    { key: "reporter", label: "Reportado por" },
    { key: "assignee", label: "Responsável" },
    { key: "created_at", label: "Criado em" },
    { key: "resolved_at", label: "Resolvido em" },
    { key: "closed_at", label: "Fechado em" },
    { key: "sla_status", label: "SLA" },
  ]);

  await supabase
    .schema("shared")
    .from("AuditLog")
    .insert({ user_id: user.id, action: "REPORT_EXPORTED", entity_type: "Incident", new_values: { format: "csv", rows: rows.length } });

  return csvResponse("incidentes.csv", csv);
}
