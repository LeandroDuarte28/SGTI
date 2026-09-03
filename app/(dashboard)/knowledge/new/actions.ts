"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Server Action — creates a knowledge base article. Restricted to IT staff
 * by RLS ("Article: IT staff can manage").
 */
export async function createArticle(formData: FormData): Promise<void> {
  const title = formData.get("title");
  const content = formData.get("content");
  const categoryId = formData.get("category_id");
  const status = formData.get("status");

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("O título é obrigatório.");
  }
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("O conteúdo é obrigatório.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: article, error } = await supabase
    .schema("knowledge")
    .from("Article")
    .insert({
      title: title.trim(),
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      content: content.trim(),
      category_id: typeof categoryId === "string" && categoryId !== "" ? categoryId : null,
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      author_id: user.id,
    })
    .select("id")
    .single();

  if (error || !article) {
    throw new Error(`Não foi possível criar o artigo: ${error?.message ?? "erro desconhecido"}`);
  }

  redirect(`/knowledge/${article.id}`);
}
