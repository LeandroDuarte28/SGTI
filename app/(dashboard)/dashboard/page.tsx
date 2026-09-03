import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole } from "@/lib/constants/roles";

export const metadata: Metadata = { title: "Dashboard Executivo" };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) {
    return "—";
  }
  return `${hours.toFixed(1)}h`;
}

function getSlaComplianceTone(percent: number): "neutral" | "good" | "bad" {
  if (Number.isNaN(percent)) {
    return "neutral";
  }
  return percent >= 90 ? "good" : "bad";
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return `${value.toFixed(1)}%`;
}

function StatCard({
  label,
  value,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string;
  href?: string;
  tone?: "neutral" | "good" | "bad";
}): React.JSX.Element {
  const TONE_CLASS: Record<typeof tone, string> = {
    bad: "text-destructive",
    good: "text-status-resolved",
    neutral: "text-foreground",
  };
  const toneClass = TONE_CLASS[tone];

  const content = (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );

  if (!href) {
    return content;
  }
  return (
    <Link className="block transition-opacity hover:opacity-80" href={href}>
      {content}
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-medium text-foreground">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

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
      </Section>
    </div>
  );
}
