import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // ─── Base configs ───────────────────────────────────────────────────────
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
  ),

  // ─── Custom rules ────────────────────────────────────────────────────────
  {
    rules: {
      // TypeScript — enforce explicit typing (no 'any')
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",

      // React
      "react/self-closing-comp": "error",
      "react/jsx-sort-props": ["warn", { callbacksLast: true, shorthandFirst: true }],

      // Next.js
      "@next/next/no-html-link-for-pages": "error",

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-nested-ternary": "error",

      // ─── Module boundary enforcement ──────────────────────────────────
      // Prevents direct cross-module imports between bounded contexts.
      // Each module must only import from its own directory or @/lib, @/types, @/components/shared.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            // Modules cannot import directly from other modules' internals
            // (they must go through defined public APIs / service layer)
            {
              group: ["@/services/incidents/*"],
              importNames: [],
              message:
                "Import incidents data via @/services/incidents/index — not internal files.",
            },
            {
              group: ["@/services/compliance/*"],
              importNames: [],
              message:
                "Import compliance data via @/services/compliance/index — not internal files.",
            },
          ],
        },
      ],
    },
  },

  // ─── Test files — relaxed rules ─────────────────────────────────────────
  {
    files: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ─── Config files — allow require ────────────────────────────────────────
  {
    files: ["*.config.js", "*.config.ts", "jest.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // ─── Ignore patterns ─────────────────────────────────────────────────────
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "lib/supabase/database.types.ts", // Auto-generated — never lint
      "supabase/functions/**",          // Deno runtime — separate lint config
    ],
  },
];

export default eslintConfig;
