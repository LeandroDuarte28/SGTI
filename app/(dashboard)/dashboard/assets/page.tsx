import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatCurrency, Section, StatCard } from "@/components/dashboard/kpi";

export const metadata: Metadata = { title: "Dashboard de Ativos" };

export default async function AssetsDashboardPage(): Promise<React.JSX.Element> {
  const user = await getAuthUser();
  const isManager = hasRole(user.roles, ADMIN_ROLES);
  if (!hasRole(user.roles, IT_STAFF_ROLES)) {
    redirect("/incidents");
  }

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const in90Days = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);

  const [inUseResult, inStockResult, unassignedResult, warrantyExpiringResult, warrantyExpiredResult, fleetValueResult, licensesResult] =
    await Promise.all([
      supabase.schema("asset").from("Asset").select("id").eq("status", "IN_USE"),
      supabase.schema("asset").from("Asset").select("id").eq("status", "IN_STOCK"),
      supabase.schema("asset").from("Asset").select("id").eq("status", "IN_USE").is("assigned_to", null),
      supabase.schema("asset").from("Asset").select("id").gte("warranty_expires", today).lte("warranty_expires", in90Days),
      supabase.schema("asset").from("Asset").select("id").lt("warranty_expires", today).neq("status", "RETIRED"),
      supabase.schema("asset").from("Asset").select("purchase_value").not("status", "in", "(RETIRED,LOST)"),
      supabase.schema("asset").from("SoftwareLicense").select("seats_total, seats_used"),
    ]);

  const fleetValue = (fleetValueResult.data ?? []).reduce((sum, a) => sum + Number(a.purchase_value ?? 0), 0);
  const licenses = licensesResult.data ?? [];
  const underutilizedLicenses = licenses.filter((l) => l.seats_total > 0 && l.seats_used / l.seats_total < 0.2).length;
  const overutilizedLicenses = licenses.filter((l) => l.seats_total > 0 && l.seats_used / l.seats_total > 0.9).length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard de Ativos</h1>
        <p className="text-sm text-muted-foreground">Inventário de TI, garantias e licenças.</p>
      </div>

      <Section title="Inventário">
        <StatCard href="/assets" label="Em Uso" value={String(inUseResult.data?.length ?? 0)} />
        <StatCard href="/assets" label="Em Estoque" value={String(inStockResult.data?.length ?? 0)} />
        <StatCard
          href="/assets"
          label="Sem Responsável"
          tone={(unassignedResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(unassignedResult.data?.length ?? 0)}
        />
      </Section>

      <Section title="Garantias">
        <StatCard
          href="/assets"
          label="Vencendo em 90 dias"
          tone={(warrantyExpiringResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(warrantyExpiringResult.data?.length ?? 0)}
        />
        <StatCard
          href="/assets"
          label="Vencidas"
          tone={(warrantyExpiredResult.data?.length ?? 0) > 0 ? "bad" : "neutral"}
          value={String(warrantyExpiredResult.data?.length ?? 0)}
        />
      </Section>

      <Section title="Licenças de Software">
        <StatCard
          href="/assets"
          label="Com Utilização > 90%"
          value={String(overutilizedLicenses)}
        />
        <StatCard
          href="/assets"
          label="Subutilizadas (< 20%)"
          tone={underutilizedLicenses > 0 ? "bad" : "neutral"}
          value={String(underutilizedLicenses)}
        />
      </Section>

      {isManager && (
        <Section title="Financeiro">
          <StatCard label="Valor Total do Parque" value={formatCurrency(fleetValue)} />
        </Section>
      )}
    </div>
  );
}
