/**
 * SGTI Edge Function: sla-monitor
 *
 * Purpose: Detects SLA-at-risk (>=80% of resolution time consumed) and
 * SLA-breached (>=100%) incidents, notifies the assignee and IT managers,
 * and records an immutable breach entry in catalog.SLAHistory.
 * Schedule: called periodically by .github/workflows/sla-monitor.yml
 * (pg_cron is not enabled on this Supabase plan/environment).
 * Runtime: Deno (Supabase Edge Functions)
 *
 * Implements: Docs/31_SLA.md §7-9 (escalation, alerts, breach recording).
 * Not implemented: SLA pauses while PENDING (§5 — would need a status
 * transition history table), N1→N2→N3 hierarchy escalation and crisis
 * procedure (§7.3-7.4), and unassigned-ticket escalation (§7.2). Incidents
 * currently in PENDING are skipped rather than having their SLA paused.
 */

import { handleCors, getCorsHeaders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-client.ts";
import { evaluateResolutionSla } from "../_shared/sla.ts";

interface IncidentRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee_id: string | null;
  created_at: string;
  sla_at_risk_notified_at: string | null;
  sla_breached_at: string | null;
  sla_id: string | null;
}

interface SlaDefinitionRow {
  id: string;
  resolution_time_minutes: number;
  business_hours_only: boolean;
}

Deno.serve(async (request: Request): Promise<Response> => {
  const corsResponse = handleCors(request);
  if (corsResponse) {
    return corsResponse;
  }

  const corsHeaders = getCorsHeaders(request);

  try {
    const authHeader = request.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();
    const now = new Date();

    const { data: incidents, error: incidentsError } = await supabase
      .schema("ticket")
      .from("Incident")
      .select("id, title, status, priority, assignee_id, created_at, sla_at_risk_notified_at, sla_breached_at, sla_id")
      .not("status", "in", "(RESOLVED,CLOSED)")
      .not("sla_id", "is", null);

    if (incidentsError) {
      throw new Error(`Failed to load incidents: ${incidentsError.message}`);
    }

    const rows = (incidents ?? []) as IncidentRow[];
    const slaIds = [...new Set(rows.map((row) => row.sla_id).filter((id): id is string => id !== null))];

    const { data: slaDefinitions, error: slaError } = await supabase
      .schema("catalog")
      .from("SLADefinition")
      .select("id, resolution_time_minutes, business_hours_only")
      .in("id", slaIds.length > 0 ? slaIds : ["00000000-0000-0000-0000-000000000000"]);

    if (slaError) {
      throw new Error(`Failed to load SLA definitions: ${slaError.message}`);
    }

    const slaById = new Map<string, SlaDefinitionRow>((slaDefinitions ?? []).map((sla) => [sla.id, sla]));

    const { data: managers, error: managersError } = await supabase
      .schema("shared")
      .from("UserRole")
      .select("user_id")
      .in("role", ["IT_MANAGER", "SUPER_ADMIN"]);

    if (managersError) {
      throw new Error(`Failed to load managers: ${managersError.message}`);
    }

    const managerIds = [...new Set((managers ?? []).map((row) => row.user_id))];

    let atRiskNotified = 0;
    let breached = 0;

    for (const incident of rows) {
      if (incident.status === "PENDING" || incident.sla_breached_at !== null || !incident.sla_id) {
        continue;
      }

      const sla = slaById.get(incident.sla_id);
      if (!sla) {
        continue;
      }

      const evaluation = evaluateResolutionSla({
        createdAt: new Date(incident.created_at),
        resolutionTimeMinutes: sla.resolution_time_minutes,
        businessHoursOnly: sla.business_hours_only,
        now,
      });

      const recipientIds = [...new Set([incident.assignee_id, ...managerIds].filter((id): id is string => id !== null))];

      if (evaluation.status === "breached") {
        const { error: historyError } = await supabase.schema("catalog").from("SLAHistory").insert({
          incident_id: incident.id,
          event: "BREACHED",
          priority: incident.priority,
          technician_id: incident.assignee_id,
          elapsed_minutes: Math.round(evaluation.elapsedMinutes),
          deadline_minutes: evaluation.deadlineMinutes,
        });
        if (historyError) {
          console.error(`[sla-monitor] Failed to record breach for incident ${incident.id}: ${historyError.message}`);
          continue;
        }

        await supabase.schema("ticket").from("Incident").update({ sla_breached_at: now.toISOString() }).eq("id", incident.id);

        if (recipientIds.length > 0) {
          await supabase.schema("shared").from("Notification").insert(
            recipientIds.map((userId) => ({
              user_id: userId,
              title: "SLA Violado",
              body: `O incidente "${incident.title}" ultrapassou o prazo de resolução do SLA.`,
              link: `/incidents/${incident.id}`,
              entity_type: "Incident",
              entity_id: incident.id,
            })),
          );
        }

        await supabase.schema("shared").from("AuditLog").insert({
          action: "SLA_BREACHED",
          entity_type: "Incident",
          entity_id: incident.id,
          new_values: {
            priority: incident.priority,
            elapsed_minutes: Math.round(evaluation.elapsedMinutes),
            deadline_minutes: evaluation.deadlineMinutes,
            technician_id: incident.assignee_id,
          },
        });

        breached += 1;
      } else if (evaluation.status === "at_risk" && incident.sla_at_risk_notified_at === null) {
        await supabase
          .schema("ticket")
          .from("Incident")
          .update({ sla_at_risk_notified_at: now.toISOString() })
          .eq("id", incident.id);

        if (recipientIds.length > 0) {
          await supabase.schema("shared").from("Notification").insert(
            recipientIds.map((userId) => ({
              user_id: userId,
              title: "SLA em Risco",
              body: `O incidente "${incident.title}" já consumiu ${Math.round(evaluation.percentConsumed * 100)}% do prazo de resolução do SLA.`,
              link: `/incidents/${incident.id}`,
              entity_type: "Incident",
              entity_id: incident.id,
            })),
          );
        }

        atRiskNotified += 1;
      }
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        evaluated: rows.length,
        at_risk_notified: atRiskNotified,
        breached,
        timestamp: now.toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[sla-monitor] Error:", message);

    return new Response(
      JSON.stringify({ error: "Internal server error", details: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
