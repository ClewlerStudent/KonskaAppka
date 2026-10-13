// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

// Kolory tylko z src/theme (tokeny i zmienne CSS). ESLint pilnuje literałów w TS/TSX,
// ten test także CSS i HTML. Testy (*.test.*) i favicon.svg są poza skanem.
const root = fileURLToPath(new URL('../..', import.meta.url));
const scanned = ['src', 'web', 'www'];
const skipped = new Set(['src/theme', 'src/api', 'node_modules', 'dist', 'public']);
const extensions = /\.(ts|tsx|css|html)$/;
const colorLiteral = /(?<!&)#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|\b(?:rgba?|hsla?)\(/i;

function* files(dir: string): Generator<string> {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipped.has(path) && !skipped.has(entry.name)) yield* files(path);
    } else if (extensions.test(entry.name) && !/\.test\.|\.d\.ts$/.test(entry.name)) {
      yield path;
    }
  }
}

it('has no color literals outside src/theme', () => {
  const offenders: string[] = [];
  for (const dir of scanned) {
    for (const file of files(dir)) {
      readFileSync(join(root, file), 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (colorLiteral.test(line))
            offenders.push(`${relative(root, join(root, file))}:${i + 1}`);
        });
    }
  }
  expect(offenders).toEqual([]);
});
