import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatDate } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Base de Conhecimento" };

export default async function KnowledgePage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  const isItStaff = hasRole(user.roles, IT_STAFF_ROLES);

  const supabase = await createClient();

  // RLS: any authenticated user can read PUBLISHED articles; IT staff can
  // also see drafts (see supabase/migrations/20260712000900_knowledge_schema.sql).
  let query = supabase
    .schema("knowledge")
    .from("Article")
    .select("id, title, slug, content, status, view_count, created_at")
    .order("created_at", { ascending: false });
  if (!isItStaff) {
    query = query.eq("status", "PUBLISHED");
  }
  const { data: articles, error } = await query;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Base de Conhecimento</h1>
          <p className="text-sm text-muted-foreground">
            Artigos de autoatendimento para resolver dúvidas comuns.
          </p>
        </div>
        {isItStaff && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <a href="/api/reports/knowledge">Exportar CSV</a>
            </Button>
            <Button asChild size="sm">
              <Link href="/knowledge/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Artigo
              </Link>
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os artigos: {error.message}
        </div>
      )}

      {!error && articles && articles.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum artigo publicado ainda.
          </p>
        </div>
      )}

      {!error && articles && articles.length > 0 && (
        <ul className="space-y-3">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
                href={`/knowledge/${article.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-medium text-foreground">{article.title}</h2>
                  {isItStaff && article.status !== "PUBLISHED" && (
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {article.status === "DRAFT" ? "Rascunho" : "Arquivado"}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {article.view_count} {article.view_count === 1 ? "visualização" : "visualizações"}{" "}
                  · Publicado em {formatDate(article.created_at)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
