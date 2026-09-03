import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole } from "@/lib/constants/roles";
import { Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard de Identidades" };

export default async function IdentityDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, ADMIN_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

  const [activeAccessResult, pendingRequestsResult, approvedThisMonthResult, overdueReviewsResult] = await Promise.all([
    supabase.schema("identity").from("SystemAccess").select("id").is("revoked_at", null),
    supabase.schema("identity").from("AccessRequest").select("id").eq("status", "PENDING"),
    supabase.schema("identity").from("AccessRequest").select("id").eq("status", "APPROVED").gte("reviewed_at", monthStart),
    supabase.schema("identity").from("AccessReviewCycle").select("id").is("completed_at", null).lt("due_at", new Date().toISOString()),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard de Identidades</h1>
        <p className="text-sm text-muted-foreground">Ciclo de vida de acessos e revisões de identidade.</p>
      </div>

      <Section title="Acessos">
        <StatCard href="/identity" label="Acessos Ativos" value={String(activeAccessResult.data?.length ?? 0)} />
        <StatCard
          href="/identity"
          label="Solicitações Pendentes"
          tone={(pendingRequestsResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(pendingRequestsResult.data?.length ?? 0)}
        />
        <StatCard label="Aprovadas no Mês" tone="good" value={String(approvedThisMonthResult.data?.length ?? 0)} />
        <StatCard
          label="Ciclos de Revisão Vencidos"
          tone={(overdueReviewsResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(overdueReviewsResult.data?.length ?? 0)}
        />
      </Section>
    </div>
  );
}
