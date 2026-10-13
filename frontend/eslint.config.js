import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Kolory tylko z src/theme: literały #rgb/#rrggbb, rgb() i hsl() w kodzie są błędem.
const colorLiteral =
  '/(?<!&)#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\\b|\\b(?:rgba?|hsla?)\\(/';
const colorMessage = 'Kolory tylko z src/theme (tokens.ts, zmienne CSS --eq-*).';

export default defineConfig(
  globalIgnores([
    'dist/',
    'coverage/',
    'test-results/',
    'playwright-report/',
    'e2e/.tmp/',
    'src/api/*.d.ts',
  ]),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)backend(/|$)',
              message: 'Frontend nie importuje z backend/ (typy API: src/api, npm run gen:api).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'web/**/*.{ts,tsx}'],
    ignores: ['**/*.node.test.ts'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'web/**/*.{ts,tsx}'],
    ignores: ['src/theme/**', '**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=${colorLiteral}]`, message: colorMessage },
        { selector: `TemplateElement[value.raw=${colorLiteral}]`, message: colorMessage },
      ],
    },
  },
  { files: ['web/**/*.tsx', 'src/**/*.tsx'], extends: [reactHooks.configs.flat.recommended] },
  {
    files: ['*.config.ts', 'e2e/**/*.ts', '**/*.node.test.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
