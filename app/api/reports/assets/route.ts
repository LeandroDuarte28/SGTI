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

  const { data: assets, error } = await supabase
    .schema("asset")
    .from("Asset")
    .select("id, asset_tag, type, status, name, assigned_to, warranty_expires, purchase_value")
    .order("asset_tag");

  if (error || !assets) {
    return new Response(`Erro ao gerar relatório: ${error?.message ?? "desconhecido"}`, { status: 500 });
  }

  const names = await fetchUserNames(supabase, assets.map((a) => a.assigned_to));

  const rows = assets.map((a) => ({
    asset_tag: a.asset_tag,
    name: a.name,
    type: a.type,
    status: a.status,
    assigned_to: a.assigned_to ? (names.get(a.assigned_to) ?? a.assigned_to) : "",
    warranty_expires: a.warranty_expires ? formatDateOnly(a.warranty_expires) : "",
    purchase_value: a.purchase_value ?? "",
  }));

  const csv = toCsv(rows, [
    { key: "asset_tag", label: "Etiqueta" },
    { key: "name", label: "Nome" },
    { key: "type", label: "Tipo" },
    { key: "status", label: "Status" },
    { key: "assigned_to", label: "Responsável" },
    { key: "warranty_expires", label: "Garantia até" },
    { key: "purchase_value", label: "Valor de Compra" },
  ]);

  await supabase
    .schema("shared")
    .from("AuditLog")
    .insert({ user_id: user.id, action: "REPORT_EXPORTED", entity_type: "Asset", new_values: { format: "csv", rows: rows.length } });

  return csvResponse("ativos.csv", csv);
}
