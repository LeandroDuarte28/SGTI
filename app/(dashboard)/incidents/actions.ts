"use server";

import { revalidatePath } from "next/cache";

import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole } from "@/lib/constants/roles";

/**
 * Manually triggers the sla-monitor Edge Function. There is no scheduled
 * trigger wired up yet (pg_cron is not enabled on this Supabase plan, and
 * CI/CD does not deploy Edge Functions) — see Docs/31_SLA.md §7 for the
 * intended "every 5 minutes" cadence. This button is the interim way to
 * actually run the check until that automation is set up.
 */
export async function runSlaMonitor(): Promise<void> {
  const user = await getAuthUser();
  if (!hasRole(user.roles, ADMIN_ROLES)) {
    throw new Error("Apenas Gestores de TI podem executar a verificação de SLA.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cronSecret = process.env.CRON_SECRET;
  if (!supabaseUrl || !cronSecret) {
    throw new Error("CRON_SECRET ou NEXT_PUBLIC_SUPABASE_URL não configurados no ambiente.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/sla-monitor`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cronSecret}` },
  });

  const body = (await response.json()) as { error?: string; details?: string };

  if (!response.ok) {
    throw new Error(`Falha ao executar a verificação de SLA: ${body.details ?? body.error ?? "erro desconhecido"}`);
  }

  revalidatePath("/incidents");
}
