import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole } from "@/lib/constants/roles";
import { formatCurrency, formatPercent, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard de Projetos" };

export default async function ProjectsDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, ADMIN_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [activeResult, overdueResult, financialsResult, benefitsResult, unresolvedRisksResult, overdueMilestonesResult] =
    await Promise.all([
      supabase.schema("project").from("Project").select("id").in("status", ["PLANNING", "IN_PROGRESS"]),
      supabase.schema("project").from("Project").select("id").lt("end_date", today).not("status", "in", "(COMPLETED,CANCELLED)"),
      supabase.schema("project").from("Project").select("capex_realized, opex_realized").in("status", ["PLANNING", "IN_PROGRESS"]),
      supabase.schema("project").from("ProjectBenefit").select("realized_value").not("realized_value", "is", null),
      supabase.schema("project").from("Risk").select("id").eq("is_resolved", false),
      supabase.schema("project").from("Milestone").select("id").lt("due_date", today).is("completed_at", null),
    ]);

  const investment = (financialsResult.data ?? []).reduce((sum, p) => sum + Number(p.capex_realized) + Number(p.opex_realized), 0);
  const realizedBenefits = (benefitsResult.data ?? []).reduce((sum, b) => sum + Number(b.realized_value), 0);
  const roi = investment > 0 ? (realizedBenefits / investment) * 100 : NaN;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard de Projetos</h1>
        <p className="text-sm text-muted-foreground">Portfólio de projetos de TI — saúde, financeiro e benefícios.</p>
      </div>

      <Section title="Portfólio">
        <StatCard href="/projects" label="Projetos Ativos" value={String(activeResult.data?.length ?? 0)} />
        <StatCard
          href="/projects"
          label="Projetos com Prazo Vencido"
          tone={(overdueResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(overdueResult.data?.length ?? 0)}
        />
        <StatCard
          label="Riscos Não Resolvidos"
          tone={(unresolvedRisksResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(unresolvedRisksResult.data?.length ?? 0)}
        />
        <StatCard
          label="Marcos Vencidos"
          tone={(overdueMilestonesResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(overdueMilestonesResult.data?.length ?? 0)}
        />
      </Section>

      <Section title="Financeiro e Benefícios">
        <StatCard href="/projects" label="Investimento Ativo" value={formatCurrency(investment)} />
        <StatCard label="Benefícios Realizados" value={formatCurrency(realizedBenefits)} />
        <StatCard
          label="ROI Realizado"
          tone={!Number.isNaN(roi) && roi >= 100 ? "good" : "neutral"}
          value={Number.isNaN(roi) ? "—" : formatPercent(roi)}
        />
      </Section>
    </div>
  );
}
