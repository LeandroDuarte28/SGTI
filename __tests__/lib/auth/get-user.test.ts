/**
 * @jest-environment node
 */
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

type QueryResult<T> = { data: T | null; error: { message: string } | null };

const mockGetUser =
  jest.fn<() => Promise<{ data: { user: { id: string; email?: string } | null }; error: unknown }>>();

let profileResult: QueryResult<{
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
}> = { data: null, error: null };

let roleResult: QueryResult<{ role: string }[]> = { data: [], error: null };

function createProfileQuery() {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(async () => profileResult),
  };
}

function createRoleQuery() {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn(async () => roleResult),
  };
}

const mockFrom = jest.fn((table: string) =>
  table === "UserProfile" ? createProfileQuery() : createRoleQuery(),
);
const mockSchema = jest.fn(() => ({ from: mockFrom }));
const mockRedirect = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
    schema: mockSchema,
  }),
}));

jest.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`REDIRECT:${url}`);
  },
}));

jest.mock("@/lib/constants/routes", () => ({
  ROUTES: { LOGIN: "/login" },
}));

// Dynamic import, same reasoning as middleware.test.ts: a static top-level
// import of the module under test can run before jest.mock() for its
// dependencies takes effect in this project's SWC-based Jest transform.
async function loadGetAuthUser() {
  const mod = await import("@/lib/auth/get-user");
  return mod.getAuthUser;
}

describe("getAuthUser", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockRedirect.mockReset();
    profileResult = { data: null, error: null };
    roleResult = { data: [], error: null };
  });

  it("redirects to /login when there is no authenticated user (default behavior)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const getAuthUser = await loadGetAuthUser();

    await expect(getAuthUser()).rejects.toThrow("REDIRECT:/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("returns null instead of redirecting when redirectIfUnauthenticated is false", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const getAuthUser = await loadGetAuthUser();

    const result = await getAuthUser(false);

    expect(result).toBeNull();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("returns the authenticated user with profile data and roles", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "leandro@pinpag.com.br" } },
      error: null,
    });
    profileResult = {
      data: {
        full_name: "Leandro Duarte Silva",
        display_name: "Leandro",
        avatar_url: "https://example.com/avatar.png",
      },
      error: null,
    };
    roleResult = { data: [{ role: "END_USER" }, { role: "IT_ANALYST" }], error: null };
    const getAuthUser = await loadGetAuthUser();

    const result = await getAuthUser();

    expect(result).toEqual({
      id: "user-1",
      email: "leandro@pinpag.com.br",
      fullName: "Leandro Duarte Silva",
      displayName: "Leandro",
      avatarUrl: "https://example.com/avatar.png",
      roles: ["END_USER", "IT_ANALYST"],
    });
  });

  it("queries both UserProfile and UserRole under the shared schema", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "leandro@pinpag.com.br" } },
      error: null,
    });
    const getAuthUser = await loadGetAuthUser();

    await getAuthUser();

    expect(mockSchema).toHaveBeenCalledWith("shared");
    expect(mockFrom).toHaveBeenCalledWith("UserProfile");
    expect(mockFrom).toHaveBeenCalledWith("UserRole");
  });

  it("falls back to an empty roles array when no role rows are found", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "leandro@pinpag.com.br" } },
      error: null,
    });
    roleResult = { data: null, error: null };
    const getAuthUser = await loadGetAuthUser();

    const result = await getAuthUser();

    expect(result?.roles).toEqual([]);
  });
});
