import { readdirSync } from 'node:fs';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Granice: serwis nie importuje innego serwisu; kit, lib i contracts nie importują serwisów.
// Jeden blok na serwis i głębokość katalogu, bo ścieżka względna zależy od głębokości pliku.
// Uwaga: późniejszy blok nadpisuje opcje reguły, więc wspólne wzorce trzeba powtarzać w każdym bloku.
const services = readdirSync(new URL('./src/services', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const serviceBoundaries = services.flatMap((service) =>
  [1, 2, 3, 4].map((depth) => ({
    files: [`src/services/${service}/${'*/'.repeat(depth - 1)}*.ts`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: `^(?:\\.\\./){${depth}}(?!${service}/)[^./]`,
              message:
                'Serwis nie importuje innego serwisu (wspólny kod: src/kit, src/lib, src/contracts).',
            },
          ],
        },
      ],
    },
  })),
);

export default defineConfig(
  globalIgnores(['dist/', 'coverage/', 'openapi/', '.local/']),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  { files: ['**/*.js'], extends: [tseslint.configs.disableTypeChecked] },
  serviceBoundaries,
  {
    files: ['src/kit/**/*.ts', 'src/lib/**/*.ts', 'src/contracts/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex: '(^|/)services/', message: 'kit, lib i contracts nie importują serwisów.' },
          ],
        },
      ],
    },
  },
  prettier,
);
