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

  const { data: articles, error } = await supabase
    .schema("knowledge")
    .from("Article")
    .select("id, title, status, author_id, view_count, created_at")
    .order("created_at", { ascending: false });

  if (error || !articles) {
    return new Response(`Erro ao gerar relatório: ${error?.message ?? "desconhecido"}`, { status: 500 });
  }

  const names = await fetchUserNames(supabase, articles.map((a) => a.author_id));

  const rows = articles.map((a) => ({
    title: a.title,
    status: a.status,
    author: a.author_id ? (names.get(a.author_id) ?? a.author_id) : "",
    view_count: a.view_count,
    created_at: formatDate(a.created_at),
  }));

  const csv = toCsv(rows, [
    { key: "title", label: "Título" },
    { key: "status", label: "Status" },
    { key: "author", label: "Autor" },
    { key: "view_count", label: "Visualizações" },
    { key: "created_at", label: "Criado em" },
  ]);

  await supabase
    .schema("shared")
    .from("AuditLog")
    .insert({ user_id: user.id, action: "REPORT_EXPORTED", entity_type: "Article", new_values: { format: "csv", rows: rows.length } });

  return csvResponse("artigos-kb.csv", csv);
}
