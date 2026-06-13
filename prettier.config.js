/** @type {import('prettier').Config} */
const prettierConfig = {
  // ─── Core formatting ──────────────────────────────────────────────────────
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

  // ─── Tailwind plugin ──────────────────────────────────────────────────────
  // Sorts Tailwind classes automatically — required by coding standards.
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["cn", "cva", "clsx", "tw"],

  // ─── Overrides per file type ──────────────────────────────────────────────
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
    {
      files: ["*.sql"],
      options: {
        // SQL files are not formatted by Prettier — skip.
        parser: "babel",
      },
    },
  ],
};

export default prettierConfig;
