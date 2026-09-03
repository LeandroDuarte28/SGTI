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

  const { data: problems, error } = await supabase
    .schema("ticket")
    .from("Problem")
    .select("id, title, status, is_known_error, related_incident_count, owner_id, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error || !problems) {
    return new Response(`Erro ao gerar relatório: ${error?.message ?? "desconhecido"}`, { status: 500 });
  }

  const names = await fetchUserNames(supabase, problems.map((p) => p.owner_id));

  const rows = problems.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    is_known_error: p.is_known_error ? "Sim" : "Não",
    related_incident_count: p.related_incident_count,
    owner: p.owner_id ? (names.get(p.owner_id) ?? p.owner_id) : "",
    created_at: formatDate(p.created_at),
    updated_at: formatDate(p.updated_at),
  }));

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "title", label: "Título" },
    { key: "status", label: "Status" },
    { key: "is_known_error", label: "Erro Conhecido" },
    { key: "related_incident_count", label: "Incidentes Relacionados" },
    { key: "owner", label: "Responsável" },
    { key: "created_at", label: "Criado em" },
    { key: "updated_at", label: "Atualizado em" },
  ]);

  await supabase
    .schema("shared")
    .from("AuditLog")
    .insert({ user_id: user.id, action: "REPORT_EXPORTED", entity_type: "Problem", new_values: { format: "csv", rows: rows.length } });

  return csvResponse("problemas.csv", csv);
}
