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
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
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
