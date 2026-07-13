import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
// ─── Global test setup ────────────────────────────────────────────────────────

// Mock Next.js router for components that use it
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock Supabase clients to prevent real network calls in unit tests
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({ data: { user: null }, error: null })),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => ({ data: null, error: null })),
      maybeSingle: jest.fn(() => ({ data: null, error: null })),
    })),
  })),
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        getUser: jest.fn(() => ({ data: { user: null }, error: null })),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn(() => ({ data: null, error: null })),
      })),
    }),
  ),
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    })),
  })),
}));

// Suppress console.error in tests (still shown for unexpected errors)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress known React act() warnings and Next.js test warnings
    const msg = String(args[0]);
    if (
      msg.includes("Warning: An update to") ||
      msg.includes("Warning: ReactDOM.render") ||
      msg.includes("Not implemented: navigation")
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});
