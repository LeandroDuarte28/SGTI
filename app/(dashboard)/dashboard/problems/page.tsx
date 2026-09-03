import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard de Problemas" };

export default async function ProblemsDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, IT_STAFF_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();

  const [openResult, knownErrorsResult, recurrentResult, resolvedRowsResult] = await Promise.all([
    supabase.schema("ticket").from("Problem").select("id").not("status", "in", "(RESOLVED,CLOSED)"),
    supabase.schema("ticket").from("Problem").select("id").eq("is_known_error", true),
    supabase.schema("ticket").from("Problem").select("id").gte("related_incident_count", 3),
    supabase.schema("ticket").from("Problem").select("created_at, updated_at").in("status", ["RESOLVED", "CLOSED"]),
  ]);

  const resolvedRows = resolvedRowsResult.data ?? [];
  const avgResolutionDays =
    resolvedRows.length > 0
      ? resolvedRows.reduce(
          (sum, r) => sum + (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()) / 86_400_000,
          0,
        ) / resolvedRows.length
      : NaN;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard de Problemas</h1>
        <p className="text-sm text-muted-foreground">Gestão proativa de problemas e erros conhecidos.</p>
      </div>

      <Section title="Visão Geral">
        <StatCard href="/problems" label="Problemas Abertos" value={String(openResult.data?.length ?? 0)} />
        <StatCard href="/problems" label="Erros Conhecidos (KEDB)" value={String(knownErrorsResult.data?.length ?? 0)} />
        <StatCard
          href="/problems"
          label="Problemas Recorrentes"
          tone={(recurrentResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(recurrentResult.data?.length ?? 0)}
        />
        <StatCard
          label="Tempo Médio de Resolução"
          value={Number.isNaN(avgResolutionDays) ? "—" : `${avgResolutionDays.toFixed(1)} dias`}
        />
      </Section>
    </div>
  );
}
