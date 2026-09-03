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

  const { data: findings, error } = await supabase
    .schema("compliance")
    .from("ComplianceFinding")
    .select("code, title, criticality, status, analyst_id, due_date, is_recurrent")
    .order("due_date");

  if (error || !findings) {
    return new Response(`Erro ao gerar relatório: ${error?.message ?? "desconhecido"}`, { status: 500 });
  }

  const names = await fetchUserNames(supabase, findings.map((f) => f.analyst_id));

  const rows = findings.map((f) => ({
    code: f.code,
    title: f.title,
    criticality: f.criticality,
    status: f.status,
    analyst: names.get(f.analyst_id) ?? f.analyst_id,
    due_date: formatDateOnly(f.due_date),
    is_recurrent: f.is_recurrent ? "Sim" : "Não",
  }));

  const csv = toCsv(rows, [
    { key: "code", label: "Código" },
    { key: "title", label: "Título" },
    { key: "criticality", label: "Criticidade" },
    { key: "status", label: "Status" },
    { key: "analyst", label: "Analista" },
    { key: "due_date", label: "Prazo" },
    { key: "is_recurrent", label: "Recorrente" },
  ]);

  await supabase
    .schema("shared")
    .from("AuditLog")
    .insert({ user_id: user.id, action: "REPORT_EXPORTED", entity_type: "ComplianceFinding", new_values: { format: "csv", rows: rows.length } });

  return csvResponse("apontamentos-compliance.csv", csv);
}
