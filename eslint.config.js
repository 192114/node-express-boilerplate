import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import promisePlugin from 'eslint-plugin-promise'
import nPlugin from 'eslint-plugin-n'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'

export default [
  /* =====================
   * Ignore
   * ===================== */
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  /* =====================
   * Base config for TS
   * ===================== */
  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.prisma.json'],
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      promise: promisePlugin,
      n: nPlugin,
    },

    rules: {
      /* Core */
      'no-debugger': 'error',
      'no-console': 'off',

      /* Type-aware (核心) */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],

      /* Node */
      'n/no-process-exit': 'error',

      /* Imports */
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
        },
      ],
    },
  },
  prettierConfig,
]
