/**
 * @jest-environment node
 */
// Node environment required: NextRequest/NextResponse rely on the Fetch API
// globals (Request/Response/Headers) that jsdom does not provide.
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { NextRequest, type NextResponse } from "next/server";

const mockGetUser = jest.fn<() => Promise<{ data: { user: { id: string } | null } }>>();

jest.mock("@/lib/supabase/middleware", () => ({
  createMiddlewareClient: (_request: NextRequest, response: NextResponse) => ({
    supabase: { auth: { getUser: mockGetUser } },
    response,
  }),
}));

// IMPORTANT: import the module under test dynamically, inside the tests,
// rather than as a static top-level `import { middleware } from "@/middleware"`.
// With a static import, the jest.mock() above for its internal dependency
// (@/lib/supabase/middleware) is not applied in time and the real Supabase
// client gets constructed — verified by direct experimentation.
async function loadMiddleware() {
  const mod = await import("@/middleware");
  return mod.middleware;
}

function buildRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("middleware", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
  });

  it("allows an unauthenticated user to access /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const middleware = await loadMiddleware();

    const response = await middleware(buildRequest("/login"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects an authenticated user away from /login to /incidents", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const middleware = await loadMiddleware();

    const response = await middleware(buildRequest("/login"));

    expect(response.headers.get("location")).toContain("/incidents");
  });

  it("allows unauthenticated access to public API routes like /api/health", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const middleware = await loadMiddleware();

    const response = await middleware(buildRequest("/api/health"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects an unauthenticated user from a protected route to /login with redirectTo", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const middleware = await loadMiddleware();

    const response = await middleware(buildRequest("/incidents"));
    const location = response.headers.get("location");

    expect(location).toContain("/login");
    expect(location).toContain("redirectTo=%2Fincidents");
  });

  it("allows an authenticated user to access a protected route", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const middleware = await loadMiddleware();

    const response = await middleware(buildRequest("/incidents"));

    expect(response.headers.get("location")).toBeNull();
  });
});
