import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole } from "@/lib/constants/roles";
import { formatCurrency, formatHours, formatPercent, getSlaComplianceTone, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard Executivo" };

const OTHER_DASHBOARDS = [
  { href: "/dashboard/operational", label: "Operacional" },
  { href: "/dashboard/incidents", label: "Incidentes" },
  { href: "/dashboard/requests", label: "Requisições" },
  { href: "/dashboard/problems", label: "Problemas" },
  { href: "/dashboard/assets", label: "Ativos" },
  { href: "/dashboard/identity", label: "Identidade" },
  { href: "/dashboard/compliance", label: "Compliance" },
  { href: "/dashboard/financial", label: "Financeiro" },
  { href: "/dashboard/procurement", label: "Compras" },
  { href: "/dashboard/projects", label: "Projetos" },
  { href: "/dashboard/knowledge", label: "Base de Conhecimento" },
  { href: "/dashboard/sla", label: "SLA" },
] as const;

export default async function ExecutiveDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, ADMIN_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const today = now.toISOString().slice(0, 10);

  const [
    openIncidentsResult,
    openRequestsResult,
    closedIncidentsResult,
    fulfilledRequestsResult,
    criticalIncidentsResult,
    openProblemsResult,
    recurrentProblemsResult,
    slaIncidentsResult,
    complianceAuditResult,
    openFindingsResult,
    overdueFindingsResult,
    budgetsResult,
    expensesThisMonthResult,
    activeProjectsResult,
    overdueProjectsResult,
    projectsFinancialsResult,
    realizedBenefitsResult,
  ] = await Promise.all([
    supabase.schema("ticket").from("Incident").select("id").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("ServiceRequest").select("id").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("Incident").select("id").eq("status", "CLOSED").gte("updated_at", monthStart),
    supabase.schema("ticket").from("ServiceRequest").select("id").not("fulfilled_at", "is", null).gte("fulfilled_at", monthStart),
    supabase.schema("ticket").from("Incident").select("id").eq("priority", "CRITICAL").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("Problem").select("id").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("Problem").select("id").gte("related_incident_count", 3),
    supabase.schema("ticket").from("Incident").select("id, sla_breached_at, resolved_at, created_at").not("sla_id", "is", null).not("resolved_at", "is", null),
    supabase.schema("compliance").from("ComplianceAudit").select("compliance_score_final").not("compliance_score_final", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.schema("compliance").from("ComplianceFinding").select("id").not("status", "in", "(CONCLUDED,CANCELLED,NOT_APPLICABLE)"),
    supabase.schema("compliance").from("ComplianceFinding").select("id").lt("due_date", today).not("status", "in", "(CONCLUDED,CANCELLED,NOT_APPLICABLE)"),
    supabase.schema("financial").from("Budget").select("allocated_amount, spent_amount"),
    supabase.schema("financial").from("Expense").select("amount").gte("expense_date", monthStart.slice(0, 10)),
    supabase.schema("project").from("Project").select("id").in("status", ["PLANNING", "IN_PROGRESS"]),
    supabase.schema("project").from("Project").select("id").lt("end_date", today).not("status", "in", "(COMPLETED,CANCELLED)"),
    supabase.schema("project").from("Project").select("capex_realized, opex_realized").in("status", ["PLANNING", "IN_PROGRESS"]),
    supabase.schema("project").from("ProjectBenefit").select("realized_value").not("realized_value", "is", null),
  ]);

  const slaIncidents = slaIncidentsResult.data ?? [];
  const slaBreachedCount = slaIncidents.filter((i) => i.sla_breached_at !== null).length;
  const slaCompliancePercent =
    slaIncidents.length > 0 ? ((slaIncidents.length - slaBreachedCount) / slaIncidents.length) * 100 : NaN;
  const slaViolationPercent = slaIncidents.length > 0 ? (slaBreachedCount / slaIncidents.length) * 100 : NaN;
  const mttrHours =
    slaIncidents.length > 0
      ? slaIncidents.reduce((sum, i) => {
          const created = new Date(i.created_at).getTime();
          const resolved = new Date(i.resolved_at as string).getTime();
          return sum + (resolved - created) / 3_600_000;
        }, 0) / slaIncidents.length
      : NaN;

  const budgets = budgetsResult.data ?? [];
  const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount), 0);
  const expensesThisMonth = (expensesThisMonthResult.data ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

  const complianceScore = complianceAuditResult.data?.compliance_score_final;

  const projectInvestment = (projectsFinancialsResult.data ?? []).reduce(
    (sum, p) => sum + Number(p.capex_realized) + Number(p.opex_realized),
    0,
  );
  const realizedBenefitsTotal = (realizedBenefitsResult.data ?? []).reduce(
    (sum, b) => sum + Number(b.realized_value),
    0,
  );
  const projectRoi = projectInvestment > 0 ? (realizedBenefitsTotal / projectInvestment) * 100 : NaN;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard Executivo</h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada dos serviços de TI. Calculado ao vivo a cada carregamento da página.
        </p>
      </div>

      <Section title="Chamados">
        <StatCard href="/incidents" label="Incidentes Abertos" value={String(openIncidentsResult.data?.length ?? 0)} />
        <StatCard href="/requests" label="Requisições Abertas" value={String(openRequestsResult.data?.length ?? 0)} />
        <StatCard
          label="Fechados no Mês"
          tone="good"
          value={String((closedIncidentsResult.data?.length ?? 0) + (fulfilledRequestsResult.data?.length ?? 0))}
        />
        <StatCard
          href="/incidents"
          label="Incidentes Críticos Abertos"
          tone={(criticalIncidentsResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(criticalIncidentsResult.data?.length ?? 0)}
        />
        <StatCard href="/problems" label="Problemas Abertos" value={String(openProblemsResult.data?.length ?? 0)} />
        <StatCard
          href="/problems"
          label="Problemas Recorrentes"
          tone={(recurrentProblemsResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(recurrentProblemsResult.data?.length ?? 0)}
        />
      </Section>

      <Section title="SLA">
        <StatCard
          label="SLA Cumprido"
          tone={getSlaComplianceTone(slaCompliancePercent)}
          value={formatPercent(slaCompliancePercent)}
        />
        <StatCard
          label="SLA Violado"
          tone={slaViolationPercent > 10 ? "bad" : "neutral"}
          value={formatPercent(slaViolationPercent)}
        />
        <StatCard label="MTTR" value={formatHours(mttrHours)} />
      </Section>

      <Section title="Compliance">
        <StatCard
          href="/compliance"
          label="Compliance Score"
          tone={complianceScore !== undefined && complianceScore !== null && Number(complianceScore) < 80 ? "bad" : "neutral"}
          value={complianceScore !== undefined && complianceScore !== null ? formatPercent(Number(complianceScore)) : "—"}
        />
        <StatCard href="/compliance" label="Apontamentos Abertos" value={String(openFindingsResult.data?.length ?? 0)} />
        <StatCard
          href="/compliance"
          label="Apontamentos em Atraso"
          tone={(overdueFindingsResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(overdueFindingsResult.data?.length ?? 0)}
        />
      </Section>

      <Section title="Financeiro">
        <StatCard href="/financial" label="Orçamento Alocado" value={formatCurrency(totalAllocated)} />
        <StatCard href="/financial" label="Orçamento Gasto" value={formatCurrency(totalSpent)} />
        <StatCard
          label="% Orçamento Utilizado"
          tone={totalAllocated > 0 && totalSpent / totalAllocated > 1 ? "bad" : "neutral"}
          value={totalAllocated > 0 ? formatPercent((totalSpent / totalAllocated) * 100) : "—"}
        />
        <StatCard href="/financial" label="Despesas do Mês" value={formatCurrency(expensesThisMonth)} />
      </Section>

      <Section title="Projetos">
        <StatCard href="/projects" label="Projetos Ativos" value={String(activeProjectsResult.data?.length ?? 0)} />
        <StatCard
          href="/projects"
          label="Projetos com Prazo Vencido"
          tone={(overdueProjectsResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(overdueProjectsResult.data?.length ?? 0)}
        />
        <StatCard href="/projects" label="Investimento em Projetos Ativos" value={formatCurrency(projectInvestment)} />
        <StatCard
          label="ROI Realizado"
          tone={!Number.isNaN(projectRoi) && projectRoi >= 100 ? "good" : "neutral"}
          value={Number.isNaN(projectRoi) ? "—" : formatPercent(projectRoi)}
        />
      </Section>

      <section>
        <h2 className="mb-3 font-medium text-foreground">Outros Painéis</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {OTHER_DASHBOARDS.map((item) => (
            <Link
              className="rounded-lg border border-border bg-card p-3 text-center text-sm text-foreground shadow-sm transition-colors hover:bg-muted/50"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
