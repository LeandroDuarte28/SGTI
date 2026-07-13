/** @type {import('prettier').Config} */
const prettierConfig = {
  // ─── Core formatting ───────────────────────────────────────────────────
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",

  // ─── Tailwind plugin ───────────────────────────────────────────────────
  // Sorts Tailwind classes automatically — required by coding standards.
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["cn", "cva", "clsx", "tw"],

  // ─── Overrides per file type ───────────────────────────────────────────
  // NOTE: *.sql is intentionally NOT listed here. SQL files are excluded via
  // .prettierignore instead — Prettier has no built-in SQL parser, and a
  // previous override here mistakenly forced the "babel" (JS) parser onto
  // *.sql files, which broke `prettier --check` on every migration file.
  overrides: [
    {
      files: ["*.json"],
      options: {
        printWidth: 120,
      },
    },
    {
      files: ["*.md"],
      options: {
        printWidth: 80,
        proseWrap: "always",
      },
    },
  ],
};

export default prettierConfig;
