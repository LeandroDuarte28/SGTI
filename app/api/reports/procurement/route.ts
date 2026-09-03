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

  const { data: orders, error } = await supabase
    .schema("procurement")
    .from("PurchaseOrder")
    .select("id, supplier_id, requested_by, status, total_amount, created_at")
    .order("created_at", { ascending: false });

  if (error || !orders) {
    return new Response(`Erro ao gerar relatório: ${error?.message ?? "desconhecido"}`, { status: 500 });
  }

  const names = await fetchUserNames(supabase, orders.map((o) => o.requested_by));
  const { data: suppliers } = await supabase
    .schema("procurement")
    .from("Supplier")
    .select("id, name")
    .in("id", [...new Set(orders.map((o) => o.supplier_id))]);
  const supplierNames = new Map((suppliers ?? []).map((s) => [s.id, s.name]));

  const rows = orders.map((o) => ({
    id: o.id,
    supplier: supplierNames.get(o.supplier_id) ?? o.supplier_id,
    status: o.status,
    total_amount: o.total_amount,
    requested_by: names.get(o.requested_by) ?? o.requested_by,
    created_at: formatDate(o.created_at),
  }));

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "supplier", label: "Fornecedor" },
    { key: "status", label: "Status" },
    { key: "total_amount", label: "Valor Total" },
    { key: "requested_by", label: "Solicitado por" },
    { key: "created_at", label: "Criado em" },
  ]);

  await supabase
    .schema("shared")
    .from("AuditLog")
    .insert({ user_id: user.id, action: "REPORT_EXPORTED", entity_type: "PurchaseOrder", new_values: { format: "csv", rows: rows.length } });

  return csvResponse("pedidos-compra.csv", csv);
}
