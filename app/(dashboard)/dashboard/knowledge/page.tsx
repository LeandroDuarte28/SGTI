import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatPercent, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard da Base de Conhecimento" };

export default async function KnowledgeDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, IT_STAFF_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

  const [publishedResult, draftsResult, newThisMonthResult, feedbackResult] = await Promise.all([
    supabase.schema("knowledge").from("Article").select("id").eq("status", "PUBLISHED"),
    supabase.schema("knowledge").from("Article").select("id").eq("status", "DRAFT"),
    supabase.schema("knowledge").from("Article").select("id").eq("status", "PUBLISHED").gte("created_at", monthStart),
    supabase.schema("knowledge").from("ArticleFeedback").select("is_helpful"),
  ]);

  const feedback = feedbackResult.data ?? [];
  const helpfulRate = feedback.length > 0 ? (feedback.filter((f) => f.is_helpful).length / feedback.length) * 100 : NaN;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard da Base de Conhecimento</h1>
        <p className="text-sm text-muted-foreground">Cobertura e qualidade dos artigos de autoatendimento.</p>
      </div>

      <Section title="Conteúdo">
        <StatCard href="/knowledge" label="Artigos Publicados" value={String(publishedResult.data?.length ?? 0)} />
        <StatCard href="/knowledge" label="Rascunhos Pendentes" value={String(draftsResult.data?.length ?? 0)} />
        <StatCard label="Novos no Mês" tone="good" value={String(newThisMonthResult.data?.length ?? 0)} />
        <StatCard
          label="Helpful Rate Médio"
          tone={!Number.isNaN(helpfulRate) && helpfulRate < 75 ? "bad" : "neutral"}
          value={formatPercent(helpfulRate)}
        />
      </Section>
    </div>
  );
}
