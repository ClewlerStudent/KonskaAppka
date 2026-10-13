import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Granice: serwis nie importuje innego serwisu; kit, lib i contracts nie importują serwisów.
// Reguła rozwiązuje ścieżkę względną importu, więc działa na każdej głębokości katalogu.
const srcDir = fileURLToPath(new URL('./src/', import.meta.url));

const serviceBoundaries = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      otherService:
        'Serwis nie importuje innego serwisu (wspólny kod: src/kit, src/lib, src/contracts).',
      sharedImportsService: 'kit, lib i contracts nie importują serwisów.',
    },
  },
  create(context) {
    const file = path.relative(srcDir, context.filename).split(path.sep).join('/');
    const own = /^services\/([^/]+)\//.exec(file)?.[1];
    const shared = /^(kit|lib|contracts)\//.test(file);
    if (!own && !shared) return {};

    const check = (node, source) => {
      if (typeof source !== 'string') return;
      const target = source.startsWith('.')
        ? path.relative(srcDir, path.resolve(path.dirname(context.filename), source))
        : source;
      const service = /^(?:src\/)?services\/([^/]+)/.exec(target.split(path.sep).join('/'))?.[1];
      if (!service || service === own) return;
      context.report({ node, messageId: own ? 'otherService' : 'sharedImportsService' });
    };
    const fromSource = (node) => check(node, node.source?.value);
    return {
      ImportDeclaration: fromSource,
      ExportAllDeclaration: fromSource,
      ExportNamedDeclaration: fromSource,
      ImportExpression: (node) =>
        check(node, node.source.type === 'Literal' ? node.source.value : undefined),
    };
  },
};

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
  {
    files: ['src/**/*.ts'],
    plugins: { equenor: { rules: { 'service-boundaries': serviceBoundaries } } },
    rules: { 'equenor/service-boundaries': 'error' },
  },
  prettier,
);
