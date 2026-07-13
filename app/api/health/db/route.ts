import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/health/db
 * Lightweight DB health check used by Vercel cron and UptimeRobot
 * to keep the Supabase free tier project from pausing.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const start = Date.now();
    const { error } = await supabase
      .schema("shared")
      .from("UserProfile")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { status: "down", error: error.message },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { status: "ok", latencyMs: Date.now() - start },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "down", error: message },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
