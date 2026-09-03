import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatPercent, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard de Compliance" };

export default async function ComplianceDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, IT_STAFF_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [latestAuditResult, openFindingsResult, overdueFindingsResult, criticalOpenResult, overdueActionsResult] = await Promise.all([
    supabase
      .schema("compliance")
      .from("ComplianceAudit")
      .select("compliance_score_final")
      .not("compliance_score_final", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.schema("compliance").from("ComplianceFinding").select("id").not("status", "in", "(CONCLUDED,CANCELLED,NOT_APPLICABLE)"),
    supabase.schema("compliance").from("ComplianceFinding").select("id").lt("due_date", today).not("status", "in", "(CONCLUDED,CANCELLED,NOT_APPLICABLE)"),
    supabase.schema("compliance").from("ComplianceFinding").select("id").eq("criticality", "CRITICAL").not("status", "in", "(CONCLUDED,CANCELLED,NOT_APPLICABLE)"),
    supabase.schema("compliance").from("ActionItem").select("id").eq("status", "OVERDUE"),
  ]);

  const score = latestAuditResult.data?.compliance_score_final;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard de Compliance</h1>
        <p className="text-sm text-muted-foreground">Programa de compliance de TI — apontamentos e planos de ação.</p>
      </div>

      <Section title="Visão Geral">
        <StatCard
          href="/compliance"
          label="Compliance Score"
          tone={score !== undefined && score !== null && Number(score) < 80 ? "bad" : "neutral"}
          value={score !== undefined && score !== null ? formatPercent(Number(score)) : "—"}
        />
        <StatCard href="/compliance" label="Apontamentos Abertos" value={String(openFindingsResult.data?.length ?? 0)} />
        <StatCard
          href="/compliance"
          label="Apontamentos em Atraso"
          tone={(overdueFindingsResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(overdueFindingsResult.data?.length ?? 0)}
        />
        <StatCard
          href="/compliance"
          label="Apontamentos Críticos"
          tone={(criticalOpenResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(criticalOpenResult.data?.length ?? 0)}
        />
        <StatCard
          label="Planos de Ação Atrasados"
          tone={(overdueActionsResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(overdueActionsResult.data?.length ?? 0)}
        />
      </Section>
    </div>
  );
}
