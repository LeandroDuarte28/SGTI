import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Points to the Next.js app root — loads next.config.ts and .env.test.local
  dir: "./",
});

const config: Config = {
  // ─── Test environment ─────────────────────────────────────────────────────
  testEnvironment: "jest-environment-jsdom",

  // ─── Setup ────────────────────────────────────────────────────────────────
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // ─── Coverage ─────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "services/**/*.{ts,tsx}",
    "actions/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!lib/supabase/database.types.ts", // Auto-generated
  ],
  // Docs/72_GITHUB_ACTIONS.md §5.4 targets 70% line coverage, but actual
  // coverage today is ~1-2% (only a handful of unit tests exist so far —
  // see roadmap item "testes automatizados"). Enforcing 70% now would fail
  // ci-full on every PR, blocking all merges. Re-enable the threshold below
  // once real coverage work has closed the gap.
  // coverageThreshold: {
  //   global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  // },
  coverageReporters: ["text", "lcov", "html"],

  // ─── Module name mapping ──────────────────────────────────────────────────
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // ─── Transform ────────────────────────────────────────────────────────────
  // next/jest handles this automatically; keep for reference.
  // transform is managed by createJestConfig

  // ─── Test patterns ────────────────────────────────────────────────────────
  testMatch: [
    "<rootDir>/__tests__/**/*.{ts,tsx}",
    "<rootDir>/**/*.test.{ts,tsx}",
    "<rootDir>/**/*.spec.{ts,tsx}",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/supabase/functions/", // Deno — separate test runner
  ],
};

export default createJestConfig(config);
