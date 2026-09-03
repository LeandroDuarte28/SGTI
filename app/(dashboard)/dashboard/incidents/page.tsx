import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatHours, formatPercent, getSlaComplianceTone, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard de Incidentes" };

export default async function IncidentsDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, IT_STAFF_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

  const [totalResult, openResult, closedResult, criticalResult, slaRowsResult] = await Promise.all([
    supabase.schema("ticket").from("Incident").select("id").gte("created_at", monthStart),
    supabase.schema("ticket").from("Incident").select("id").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("Incident").select("id").eq("status", "CLOSED").gte("updated_at", monthStart),
    supabase.schema("ticket").from("Incident").select("id").eq("priority", "CRITICAL").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase
      .schema("ticket")
      .from("Incident")
      .select("sla_breached_at, resolved_at, created_at")
      .not("sla_id", "is", null)
      .not("resolved_at", "is", null),
  ]);

  const slaRows = slaRowsResult.data ?? [];
  const breachedCount = slaRows.filter((r) => r.sla_breached_at !== null).length;
  const slaCompliance = slaRows.length > 0 ? ((slaRows.length - breachedCount) / slaRows.length) * 100 : NaN;
  const mttrHours =
    slaRows.length > 0
      ? slaRows.reduce((sum, r) => sum + (new Date(r.resolved_at as string).getTime() - new Date(r.created_at).getTime()) / 3_600_000, 0) /
        slaRows.length
      : NaN;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard de Incidentes</h1>
        <p className="text-sm text-muted-foreground">
          Desempenho do processo de gestão de incidentes nos últimos 30 dias.
        </p>
      </div>

      <Section title="Volume">
        <StatCard href="/incidents" label="Total no Período" value={String(totalResult.data?.length ?? 0)} />
        <StatCard href="/incidents" label="Abertos" value={String(openResult.data?.length ?? 0)} />
        <StatCard label="Fechados no Período" tone="good" value={String(closedResult.data?.length ?? 0)} />
        <StatCard
          href="/incidents"
          label="Críticos Abertos"
          tone={(criticalResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(criticalResult.data?.length ?? 0)}
        />
      </Section>

      <Section title="SLA e Performance">
        <StatCard label="SLA Cumprido" tone={getSlaComplianceTone(slaCompliance)} value={formatPercent(slaCompliance)} />
        <StatCard label="MTTR" value={formatHours(mttrHours)} />
      </Section>
    </div>
  );
}
