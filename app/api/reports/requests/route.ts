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

  const { data: requests, error } = await supabase
    .schema("ticket")
    .from("ServiceRequest")
    .select("id, catalog_item_id, requester_id, status, approved_by, approved_at, fulfilled_at, created_at")
    .order("created_at", { ascending: false });

  if (error || !requests) {
    return new Response(`Erro ao gerar relatório: ${error?.message ?? "desconhecido"}`, { status: 500 });
  }

  const names = await fetchUserNames(supabase, [
    ...requests.map((r) => r.requester_id),
    ...requests.map((r) => r.approved_by),
  ]);

  const { data: catalogItems } = await supabase
    .schema("catalog")
    .from("ServiceCatalogItem")
    .select("id, name")
    .in("id", [...new Set(requests.map((r) => r.catalog_item_id))]);
  const catalogNames = new Map((catalogItems ?? []).map((c) => [c.id, c.name]));

  const rows = requests.map((r) => ({
    id: r.id,
    service: catalogNames.get(r.catalog_item_id) ?? r.catalog_item_id,
    status: r.status,
    requester: names.get(r.requester_id) ?? r.requester_id,
    approved_by: r.approved_by ? (names.get(r.approved_by) ?? r.approved_by) : "",
    approved_at: r.approved_at ? formatDate(r.approved_at) : "",
    fulfilled_at: r.fulfilled_at ? formatDate(r.fulfilled_at) : "",
    created_at: formatDate(r.created_at),
  }));

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "service", label: "Serviço" },
    { key: "status", label: "Status" },
    { key: "requester", label: "Solicitante" },
    { key: "approved_by", label: "Aprovado por" },
    { key: "approved_at", label: "Aprovado em" },
    { key: "fulfilled_at", label: "Concluído em" },
    { key: "created_at", label: "Criado em" },
  ]);

  await supabase
    .schema("shared")
    .from("AuditLog")
    .insert({ user_id: user.id, action: "REPORT_EXPORTED", entity_type: "ServiceRequest", new_values: { format: "csv", rows: rows.length } });

  return csvResponse("requisicoes.csv", csv);
}
