// eslint.config.mjs
import tseslint from '@typescript-eslint/eslint-plugin';
import parserTs from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    // Ignores common NestJS build and dependency folders.
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Assumes your tsconfig.json is in the root. Adjust if necessary.
        project: './tsconfig.json',
      },
      // Sets up globals for a Node.js environment.
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      prettier,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // ✅ Prettier
      'prettier/prettier': 'warn',
      quotes: ['warn', 'single'],
      semi: ['warn', 'always'],
      indent: 'off', // Prettier handles indentation.

      // ✅ TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // Often inferred in NestJS
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'off', // Common with async operations in NestJS

      // ✅ Import Sorting
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@nestjs/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'src/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: [],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/first': 'error',
      'import/newline-after-import': ['warn', { count: 1 }],

      // ✅ General
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
      'no-debugger': 'error',
    },
  },
  // This integrates Prettier rules and disables any conflicting ESLint rules.
  eslintConfigPrettier,
];
