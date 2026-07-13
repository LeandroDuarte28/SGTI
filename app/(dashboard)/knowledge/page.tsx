import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Base de Conhecimento" };

export default async function KnowledgePage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: any authenticated user can read PUBLISHED articles; IT staff can
  // also see drafts (see supabase/migrations/20260712000900_knowledge_schema.sql).
  const { data: articles, error } = await supabase
    .schema("knowledge")
    .from("Article")
    .select("id, title, slug, content, status, view_count, created_at")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Base de Conhecimento</h1>
        <p className="text-sm text-muted-foreground">
          Artigos de autoatendimento para resolver dúvidas comuns.
        </p>
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
            <li
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
              key={article.id}
            >
              <h2 className="font-medium text-foreground">{article.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {article.view_count} {article.view_count === 1 ? "visualização" : "visualizações"}{" "}
                · Publicado em {new Date(article.created_at).toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
