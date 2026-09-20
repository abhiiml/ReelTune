// @ts-check
// NOTE: apps/api uses "type": "module" — this file must be .cjs (CommonJS)
const tseslint = require('typescript-eslint');
const baseConfig = require('@reeltune/config/eslint-base');

module.exports = tseslint.config(
  // Exclude test files from type-aware linting (tsconfig.build.json excludes them)
  {
    ignores: ['**/*.spec.ts', 'test/**'],
  },
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.build.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // NestJS decorators on classes that look "empty" to the linter
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
);
