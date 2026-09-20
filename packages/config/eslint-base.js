// @ts-check
const tseslint = require('typescript-eslint');

/** @type {import('typescript-eslint').Config} */
const baseConfig = tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', '.next/**', 'out/**', 'build/**'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // TypeScript handles unused vars better
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Allow explicit any only with a comment — discourage but don't block CI
      '@typescript-eslint/no-explicit-any': 'warn',
      // No console.log in production code
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Consistent type imports
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
);

module.exports = baseConfig;
