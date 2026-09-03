import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatHours, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard de Requisições" };

export default async function RequestsDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, IT_STAFF_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

  const [totalResult, openResult, fulfilledResult, pendingApprovalResult, cycleRowsResult] = await Promise.all([
    supabase.schema("ticket").from("ServiceRequest").select("id").gte("created_at", monthStart),
    supabase.schema("ticket").from("ServiceRequest").select("id").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("ServiceRequest").select("id").not("fulfilled_at", "is", null).gte("fulfilled_at", monthStart),
    supabase.schema("ticket").from("ServiceRequest").select("id").is("approved_at", null).eq("status", "OPEN"),
    supabase.schema("ticket").from("ServiceRequest").select("created_at, fulfilled_at").not("fulfilled_at", "is", null),
  ]);

  const cycleRows = cycleRowsResult.data ?? [];
  const avgCycleHours =
    cycleRows.length > 0
      ? cycleRows.reduce((sum, r) => sum + (new Date(r.fulfilled_at as string).getTime() - new Date(r.created_at).getTime()) / 3_600_000, 0) /
        cycleRows.length
      : NaN;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard de Requisições</h1>
        <p className="text-sm text-muted-foreground">
          Ciclo de atendimento das requisições de serviço nos últimos 30 dias.
        </p>
      </div>

      <Section title="Volume">
        <StatCard href="/requests" label="Total no Período" value={String(totalResult.data?.length ?? 0)} />
        <StatCard href="/requests" label="Abertas" value={String(openResult.data?.length ?? 0)} />
        <StatCard label="Concluídas no Período" tone="good" value={String(fulfilledResult.data?.length ?? 0)} />
        <StatCard href="/requests" label="Aguardando Aprovação" value={String(pendingApprovalResult.data?.length ?? 0)} />
      </Section>

      <Section title="Ciclo de Atendimento">
        <StatCard label="Tempo Médio de Ciclo" value={formatHours(avgCycleHours)} />
      </Section>
    </div>
  );
}
