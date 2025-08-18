// eslint.config.mjs
import tseslint from '@typescript-eslint/eslint-plugin';
import parserTs from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    // Ignores common build and dependency folders.
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
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
      // For browser-based packages, you might use `globals.browser`.
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
      'prettier/prettier': [
        'warn',
        {
          bracketSpacing: true,
          printWidth: 140,
          singleQuote: true,
          trailingComma: 'none',
          tabWidth: 2,
          useTabs: false
        }
      ],
      quotes: ['warn', 'single'],
      semi: ['warn', 'always'],
      indent: 'off', // Prettier handles indentation.

      // ✅ TypeScript
      'no-param-reassign': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'warn',

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
      'import/no-cycle': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/newline-after-import': ['warn', { count: 1 }],
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],

      // ✅ General
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
      'no-debugger': 'error',
    },
  },
  // This integrates Prettier rules and disables any conflicting ESLint rules.
  eslintConfigPrettier,
];
