import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatCurrency, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard de Compras" };

export default async function ProcurementDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, IT_STAFF_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

  const [openOrdersResult, pendingApprovalResult, receivedThisMonthResult] = await Promise.all([
    supabase.schema("procurement").from("PurchaseOrder").select("id").not("status", "in", "(RECEIVED,CANCELLED)"),
    supabase.schema("procurement").from("PurchaseOrder").select("id").eq("status", "PENDING_APPROVAL"),
    supabase.schema("procurement").from("PurchaseOrder").select("total_amount").eq("status", "RECEIVED").gte("updated_at", monthStart),
  ]);

  const receivedThisMonth = receivedThisMonthResult.data ?? [];
  const totalReceivedValue = receivedThisMonth.reduce((sum, po) => sum + Number(po.total_amount), 0);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard de Compras</h1>
        <p className="text-sm text-muted-foreground">Processo de aquisições de TI.</p>
      </div>

      <Section title="Pedidos">
        <StatCard href="/procurement" label="Compras Abertas" value={String(openOrdersResult.data?.length ?? 0)} />
        <StatCard href="/procurement" label="Aguardando Aprovação" value={String(pendingApprovalResult.data?.length ?? 0)} />
        <StatCard label="Recebidas no Mês" tone="good" value={String(receivedThisMonth.length)} />
        <StatCard label="Valor Recebido no Mês" value={formatCurrency(totalReceivedValue)} />
      </Section>
    </div>
  );
}
