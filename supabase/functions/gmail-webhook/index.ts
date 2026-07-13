/**
 * SGTI Edge Function: gmail-webhook
 *
 * Purpose: Receives Gmail push notifications (via Google Pub/Sub) for the
 *          implantacao@pinpag.com.br mailbox. Enqueues incoming emails
 *          for processing (ticket creation, SLA notifications, etc.)
 *
 * Performance target: Respond in ≤ 500ms (enqueue only, no processing).
 * Runtime: Deno (Supabase Edge Functions)
 *
 * Sprint 0: Stub — accepts and validates webhook structure only.
 * Implemented in: Phase 18 (Dashboards + Email) per 80_IMPLEMENTATION_ORDER.md
 */

import { handleCors, getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (request: Request): Promise<Response> => {
  const corsResponse = handleCors(request);
  if (corsResponse) {
    return corsResponse;
  }

  const corsHeaders = getCorsHeaders(request);

  // Gmail Pub/Sub sends POST with JSON body
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // TODO (Phase 18): Implement Gmail webhook processing:
    // 1. Validate Pub/Sub token from Authorization header
    // 2. Decode base64 message.data
    // 3. Fetch email content from Gmail API using historyId
    // 4. Parse sender, subject, body
    // 5. Enqueue for ticket-creation processing
    // 6. Respond 200 quickly to prevent Pub/Sub retry

    return new Response(
      JSON.stringify({
        status: "ok",
        message: "gmail-webhook stub — not yet implemented",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[gmail-webhook] Error:", message);

    // Return 200 anyway to prevent Pub/Sub from retrying indefinitely
    // Log the error and handle via dead-letter queue
    return new Response(
      JSON.stringify({ status: "error", details: message }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
