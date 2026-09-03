import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatHours, formatPercent, getSlaComplianceTone, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard de SLA" };

const PRIORITY_LABEL: Record<string, string> = {
  CRITICAL: "Crítica",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};
const PRIORITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default async function SlaDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, IT_STAFF_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();

  const [slaRowsResult, breachedOpenResult] = await Promise.all([
    supabase
      .schema("ticket")
      .from("Incident")
      .select("priority, sla_breached_at, resolved_at, created_at")
      .not("sla_id", "is", null)
      .not("resolved_at", "is", null),
    supabase.schema("ticket").from("Incident").select("id").not("sla_breached_at", "is", null).not("status", "in", "(RESOLVED,CLOSED)"),
  ]);

  const slaRows = slaRowsResult.data ?? [];
  const breachedCount = slaRows.filter((r) => r.sla_breached_at !== null).length;
  const overallCompliance = slaRows.length > 0 ? ((slaRows.length - breachedCount) / slaRows.length) * 100 : NaN;
  const mttrHours =
    slaRows.length > 0
      ? slaRows.reduce((sum, r) => sum + (new Date(r.resolved_at as string).getTime() - new Date(r.created_at).getTime()) / 3_600_000, 0) /
        slaRows.length
      : NaN;

  const byPriority = PRIORITY_ORDER.map((priority) => {
    const rows = slaRows.filter((r) => r.priority === priority);
    const breached = rows.filter((r) => r.sla_breached_at !== null).length;
    const compliance = rows.length > 0 ? ((rows.length - breached) / rows.length) * 100 : NaN;
    return { priority, compliance, total: rows.length };
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard de SLA</h1>
        <p className="text-sm text-muted-foreground">
          Desempenho de SLA por prioridade, considerando incidentes resolvidos com SLA definido.
        </p>
      </div>

      <Section title="Visão Geral">
        <StatCard label="SLA Geral Cumprido" tone={getSlaComplianceTone(overallCompliance)} value={formatPercent(overallCompliance)} />
        <StatCard
          href="/incidents"
          label="Chamados com SLA Violado (Abertos)"
          tone={(breachedOpenResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(breachedOpenResult.data?.length ?? 0)}
        />
        <StatCard label="MTTR" value={formatHours(mttrHours)} />
      </Section>

      <Section title="SLA por Prioridade">
        {byPriority.map((row) => (
          <StatCard
            key={row.priority}
            label={`${PRIORITY_LABEL[row.priority]} (${row.total})`}
            tone={row.total > 0 ? getSlaComplianceTone(row.compliance) : "neutral"}
            value={formatPercent(row.compliance)}
          />
        ))}
      </Section>
    </div>
  );
}
