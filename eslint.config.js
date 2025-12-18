import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";
import nPlugin from "eslint-plugin-n";
import securityPlugin from "eslint-plugin-security";
import globals from "globals";

export default [
  /* =====================
   * Ignore
   * ===================== */
  {
    ignores: ["dist/**", "node_modules/**"],
  },

  /* =====================
   * Base config for TS
   * ===================== */
  {
    files: ["**/*.ts"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      promise: promisePlugin,
      n: nPlugin,
      security: securityPlugin,
    },

    rules: {
      /* =====================
       * Core
       * ===================== */
      "no-debugger": "error",
      "no-console": "off",

      /* =====================
       * TypeScript (type-aware)
       * ===================== */
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],

      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],

      /* =====================
       * Node
       * ===================== */
      "n/no-process-exit": "error",
      "n/no-sync": "warn",

      /* =====================
       * Promise / async
       * ===================== */
      "promise/catch-or-return": "error",
      "promise/no-return-wrap": "error",

      /* =====================
       * Imports
       * ===================== */
      "import/no-unresolved": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type",
          ],
          "newlines-between": "always",
        },
      ],
    },
  },
];
