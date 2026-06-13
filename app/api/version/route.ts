import { NextResponse } from "next/server";

/**
 * GET /api/version
 * Returns the current application version. Public, no auth required.
 */
export function GET(): NextResponse {
  return NextResponse.json(
    {
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      deployedAt: process.env.VERCEL_DEPLOYMENT_ID ?? "local",
      environment: process.env.NODE_ENV,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
