import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/health
 *
 * Public health check endpoint.
 * Used by:
 * - UptimeRobot monitoring (keep-alive for Supabase free tier)
 * - GitHub Actions smoke tests post-deploy
 * - Cloudflare Health Checks
 * - Load balancer probes
 *
 * Returns HTTP 200 with all subsystem statuses when healthy.
 * Returns HTTP 503 if any critical subsystem is down.
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  const health = {
    status: "ok" as "ok" | "degraded" | "down",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    subsystems: {
      database: {
        status: "unknown" as "ok" | "down" | "unknown",
        latencyMs: 0,
      },
    },
  };

  // ─── Database check ────────────────────────────────────────────────────
  try {
    const dbStart = Date.now();
    const supabase = await createClient();
    // Lightweight query — just checks if the DB connection is alive.
    // NOTE: .select("id") — must be a real column name. Supabase JS treats
    // the select() argument as a column list (translated to a PostgREST
    // query param), not a raw SQL expression, so .select("1") is NOT the
    // same as `SELECT 1` in plain SQL — it looks for a column literally
    // named "1", which doesn't exist, and always errors.
    const { error } = await supabase.from("_health_check").select("id").limit(1).maybeSingle();
    health.subsystems.database = {
      status: error ? "down" : "ok",
      latencyMs: Date.now() - dbStart,
    };
  } catch {
    health.subsystems.database = { status: "down", latencyMs: 0 };
  }

  // ─── Determine overall status ───────────────────────────────────────────
  const isDbDown = health.subsystems.database.status === "down";
  if (isDbDown) {
    health.status = "down";
  }

  const totalLatency = Date.now() - start;
  const statusCode = health.status === "ok" ? 200 : 503;

  return NextResponse.json(
    { ...health, totalLatencyMs: totalLatency },
    {
      status: statusCode,
      headers: {
        // Prevent caching of health checks
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
