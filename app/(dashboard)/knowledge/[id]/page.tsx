import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatDate } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { submitFeedback, updateArticleContent, updateArticleStatus } from "./actions";

export const metadata: Metadata = { title: "Artigo" };

const STATUS_LABEL: Record<string, string> = { DRAFT: "Rascunho", PUBLISHED: "Publicado", ARCHIVED: "Arquivado" };
const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const user = await getAuthUser();
  const isItStaff = hasRole(user.roles, IT_STAFF_ROLES);

  const supabase = await createClient();

  const { data: article, error } = await supabase
    .schema("knowledge")
    .from("Article")
    .select("id, title, content, status, author_id, view_count, created_at")
    .eq("id", id)
    .single();

  if (error || !article) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link className="text-sm text-muted-foreground hover:underline" href="/knowledge">
          ← Voltar para Base de Conhecimento
        </Link>
        <div className="mt-4 rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Artigo não encontrado, ou você não tem permissão para vê-lo.
          </p>
        </div>
      </div>
    );
  }

  // View counter — simple best-effort increment, not gated behind a Server
  // Action since it's a passive read-side effect with no user-facing form.
  await supabase
    .schema("knowledge")
    .from("Article")
    .update({ view_count: article.view_count + 1 })
    .eq("id", id);

  const [feedbackResult, myFeedbackResult, versionsResult] = await Promise.all([
    supabase.schema("knowledge").from("ArticleFeedback").select("is_helpful").eq("article_id", id),
    supabase.schema("knowledge").from("ArticleFeedback").select("is_helpful").eq("article_id", id).eq("user_id", user.id).maybeSingle(),
    isItStaff
      ? supabase
          .schema("knowledge")
          .from("ArticleVersion")
          .select("id, version_number, edited_by, created_at")
          .eq("article_id", id)
          .order("version_number", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  const allFeedback = feedbackResult.data ?? [];
  const helpfulCount = allFeedback.filter((f) => f.is_helpful).length;
  const notHelpfulCount = allFeedback.length - helpfulCount;
  const myFeedback = myFeedbackResult.data;
  const versions = versionsResult.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <Link className="text-sm text-muted-foreground hover:underline" href="/knowledge">
        ← Voltar para Base de Conhecimento
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-foreground">{article.title}</h1>
          {isItStaff && (
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {STATUS_LABEL[article.status] ?? article.status}
            </span>
          )}
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{article.content}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          {article.view_count + 1} {article.view_count === 0 ? "visualização" : "visualizações"} · Publicado
          em {formatDate(article.created_at)}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <p className="mb-2 text-sm text-foreground">Este artigo foi útil?</p>
        <div className="flex items-center gap-2">
          <form action={submitFeedback}>
            <input name="article_id" type="hidden" value={article.id} />
            <input name="is_helpful" type="hidden" value="true" />
            <Button size="sm" type="submit" variant={myFeedback?.is_helpful === true ? "default" : "outline"}>
              Sim ({helpfulCount})
            </Button>
          </form>
          <form action={submitFeedback}>
            <input name="article_id" type="hidden" value={article.id} />
            <input name="is_helpful" type="hidden" value="false" />
            <Button size="sm" type="submit" variant={myFeedback?.is_helpful === false ? "default" : "outline"}>
              Não ({notHelpfulCount})
            </Button>
          </form>
        </div>
      </div>

      {isItStaff && (
        <>
          <div className="mt-6">
            <h2 className="mb-3 font-medium text-foreground">Editar Conteúdo</h2>
            <form action={updateArticleContent} className="space-y-2 rounded-lg border border-border bg-card p-4">
              <input name="article_id" type="hidden" value={article.id} />
              <textarea
                required
                className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                defaultValue={article.content}
                name="content"
              />
              <div className="flex justify-end">
                <Button size="sm" type="submit">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>

          <form action={updateArticleStatus} className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card p-4">
            <input name="article_id" type="hidden" value={article.id} />
            <Label className="text-sm" htmlFor="status">
              Status
            </Label>
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
              defaultValue={article.status}
              key={article.status}
              name="status"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit">
              Atualizar
            </Button>
          </form>

          {versions.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-medium text-foreground">Histórico de Versões</h2>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {versions.map((v) => (
                  <li key={v.id}>
                    Versão {v.version_number} · {formatDate(v.created_at)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
