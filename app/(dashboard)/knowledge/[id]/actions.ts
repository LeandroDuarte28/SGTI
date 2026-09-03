"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";

/**
 * Updates an article's content. Restricted to IT staff by RLS ("Article:
 * IT staff can manage"). Snapshots the previous content into ArticleVersion
 * before overwriting, so edit history is preserved.
 */
export async function updateArticleContent(formData: FormData): Promise<void> {
  const articleId = formData.get("article_id");
  const content = formData.get("content");

  if (typeof articleId !== "string" || articleId.length === 0) {
    throw new Error("Artigo inválido.");
  }
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("O conteúdo é obrigatório.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: article, error: fetchError } = await supabase
    .schema("knowledge")
    .from("Article")
    .select("content")
    .eq("id", articleId)
    .single();

  if (fetchError || !article) {
    throw new Error(`Não foi possível encontrar o artigo: ${fetchError?.message ?? "não encontrado"}`);
  }

  const { count } = await supabase
    .schema("knowledge")
    .from("ArticleVersion")
    .select("id", { count: "exact", head: true })
    .eq("article_id", articleId);

  const { error: versionError } = await supabase.schema("knowledge").from("ArticleVersion").insert({
    article_id: articleId,
    content: article.content,
    version_number: (count ?? 0) + 1,
    edited_by: user.id,
  });

  if (versionError) {
    throw new Error(`Não foi possível salvar o histórico de versão: ${versionError.message}`);
  }

  const { error } = await supabase
    .schema("knowledge")
    .from("Article")
    .update({ content: content.trim() })
    .eq("id", articleId);

  if (error) {
    throw new Error(`Não foi possível atualizar o artigo: ${error.message}`);
  }

  revalidatePath(`/knowledge/${articleId}`);
}

const VALID_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type ArticleStatus = (typeof VALID_STATUSES)[number];
function isValidStatus(value: string): value is ArticleStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

/** Updates an article's publication status. Restricted to IT staff by RLS. */
export async function updateArticleStatus(formData: FormData): Promise<void> {
  const articleId = formData.get("article_id");
  const status = formData.get("status");

  if (typeof articleId !== "string" || articleId.length === 0) {
    throw new Error("Artigo inválido.");
  }
  if (typeof status !== "string" || !isValidStatus(status)) {
    throw new Error("Status inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase.schema("knowledge").from("Article").update({ status }).eq("id", articleId);

  if (error) {
    throw new Error(`Não foi possível atualizar o status: ${error.message}`);
  }

  revalidatePath(`/knowledge/${articleId}`);
}

/**
 * Submits (or updates) the current user's helpful/not-helpful feedback on
 * an article. RLS ("ArticleFeedback: user can manage own") plus the
 * UNIQUE(article_id, user_id) constraint make this an upsert.
 */
export async function submitFeedback(formData: FormData): Promise<void> {
  const articleId = formData.get("article_id");
  const isHelpful = formData.get("is_helpful");
  const comment = formData.get("comment");

  if (typeof articleId !== "string" || articleId.length === 0) {
    throw new Error("Artigo inválido.");
  }
  if (isHelpful !== "true" && isHelpful !== "false") {
    throw new Error("Resposta inválida.");
  }

  const user = await getAuthUser();
  const supabase = await createClient();

  const { error } = await supabase.schema("knowledge").from("ArticleFeedback").upsert(
    {
      article_id: articleId,
      user_id: user.id,
      is_helpful: isHelpful === "true",
      comment: typeof comment === "string" && comment.trim().length > 0 ? comment.trim() : null,
    },
    { onConflict: "article_id,user_id" },
  );

  if (error) {
    throw new Error(`Não foi possível registrar o feedback: ${error.message}`);
  }

  revalidatePath(`/knowledge/${articleId}`);
}
