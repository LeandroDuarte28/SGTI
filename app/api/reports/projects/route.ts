import { createClient } from "@/lib/supabase/server";
import { csvResponse, toCsv } from "@/lib/utils/csv";
import { formatDateOnly } from "@/lib/utils/format-date";
import { fetchUserNames } from "@/lib/utils/user-names";

export async function GET(): Promise<Response> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: projects, error } = await supabase
    .schema("project")
    .from("Project")
    .select("id, name, status, owner_id, start_date, end_date, capex_approved, opex_approved, capex_realized, opex_realized")
    .order("created_at", { ascending: false });

  if (error || !projects) {
    return new Response(`Erro ao gerar relatório: ${error?.message ?? "desconhecido"}`, { status: 500 });
  }

  const names = await fetchUserNames(supabase, projects.map((p) => p.owner_id));

  const rows = projects.map((p) => ({
    name: p.name,
    status: p.status,
    owner: p.owner_id ? (names.get(p.owner_id) ?? p.owner_id) : "",
    start_date: p.start_date ? formatDateOnly(p.start_date) : "",
    end_date: p.end_date ? formatDateOnly(p.end_date) : "",
    approved: Number(p.capex_approved ?? 0) + Number(p.opex_approved ?? 0),
    realized: Number(p.capex_realized) + Number(p.opex_realized),
  }));

  const csv = toCsv(rows, [
    { key: "name", label: "Projeto" },
    { key: "status", label: "Status" },
    { key: "owner", label: "Responsável" },
    { key: "start_date", label: "Início" },
    { key: "end_date", label: "Fim" },
    { key: "approved", label: "Orçamento Aprovado" },
    { key: "realized", label: "Orçamento Realizado" },
  ]);

  await supabase
    .schema("shared")
    .from("AuditLog")
    .insert({ user_id: user.id, action: "REPORT_EXPORTED", entity_type: "Project", new_values: { format: "csv", rows: rows.length } });

  return csvResponse("projetos.csv", csv);
}
