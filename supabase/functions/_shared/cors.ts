/**
 * SGTI Edge Functions — Shared CORS Configuration
 *
 * All Edge Functions that accept cross-origin requests must use these headers.
 * The allowed origin is restricted to the SGTI frontend domain.
 */

const ALLOWED_ORIGINS = [
  Deno.env.get("FRONTEND_URL") ?? "http://localhost:3000",
  "https://sgti.vercel.app",
];

export function getCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin") ?? "";
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : ALLOWED_ORIGINS[0]!,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Client-Info, apikey",
    "Access-Control-Max-Age": "86400",
  };
}

/** Returns a 204 No Content response for OPTIONS preflight requests */
export function handleCors(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }
  return null;
}
