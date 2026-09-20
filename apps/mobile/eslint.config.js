// @ts-check
const baseConfig = require('@reeltune/config/eslint-base');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    // React Native / Expo overrides
    rules: {
      // RN style objects use camelCase, not kebab-case — nothing to lint here
      'no-console': 'off', // dev tools use console in RN debug builds
    },
  },
);
