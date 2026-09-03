import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard Operacional" };

export default async function OperationalDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, IT_STAFF_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();

  const [
    openIncidentsResult,
    openRequestsResult,
    breachedOpenResult,
    atRiskOpenResult,
    unassignedResult,
    pendingApprovalResult,
  ] = await Promise.all([
    supabase.schema("ticket").from("Incident").select("id").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("ServiceRequest").select("id").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("Incident").select("id").not("sla_breached_at", "is", null).not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("Incident").select("id").not("sla_at_risk_notified_at", "is", null).is("sla_breached_at", null).not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("Incident").select("id").is("assignee_id", null).not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("ServiceRequest").select("id").is("approved_at", null).eq("status", "OPEN"),
  ]);

  const queueTotal = (openIncidentsResult.data?.length ?? 0) + (openRequestsResult.data?.length ?? 0);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard Operacional</h1>
        <p className="text-sm text-muted-foreground">
          Visão do dia a dia da fila de trabalho. Calculado ao vivo a cada carregamento da página.
        </p>
      </div>

      <Section title="Fila de Trabalho">
        <StatCard label="Fila Atual (Total)" value={String(queueTotal)} />
        <StatCard
          href="/incidents"
          label="Chamados com SLA Violado"
          tone={(breachedOpenResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(breachedOpenResult.data?.length ?? 0)}
        />
        <StatCard
          href="/incidents"
          label="SLA em Risco"
          tone={(atRiskOpenResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(atRiskOpenResult.data?.length ?? 0)}
        />
        <StatCard
          href="/incidents"
          label="Sem Atribuição"
          tone={(unassignedResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(unassignedResult.data?.length ?? 0)}
        />
        <StatCard
          href="/requests"
          label="Requisições Aguardando Aprovação"
          value={String(pendingApprovalResult.data?.length ?? 0)}
        />
      </Section>
    </div>
  );
}
