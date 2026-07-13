/**
 * SGTI Edge Function: sla-monitor
 *
 * Purpose: Monitors SLA breach conditions and triggers notifications.
 * Schedule: Every 5 minutes via pg_cron (configured in Supabase Dashboard).
 * Runtime: Deno (Supabase Edge Functions)
 *
 * Sprint 0: Stub — health check only.
 * Implemented in: Phase 05 (SLA) per 80_IMPLEMENTATION_ORDER.md
 */

import { handleCors, getCorsHeaders } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabase-client.ts";

Deno.serve(async (request: Request): Promise<Response> => {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) {
    return corsResponse;
  }

  const corsHeaders = getCorsHeaders(request);

  try {
    // Verify cron secret to prevent unauthorized invocations
    const authHeader = request.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const _supabase = createAdminClient();

    // TODO (Phase 05): Implement SLA breach detection logic:
    // 1. Query active tickets past SLA due date
    // 2. Update breach status
    // 3. Create notifications for assignees and managers
    // 4. Log breach events to shared.AuditLog

    return new Response(
      JSON.stringify({
        status: "ok",
        message: "sla-monitor stub — not yet implemented",
        timestamp: new Date().toISOString(),
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
