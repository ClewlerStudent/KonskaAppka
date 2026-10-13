// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { accentOptions, lcd, scrim, shadowCard, tablet } from './tokens';

/** Porównanie wartości CSS bez spacji, wielkości liter i zer na końcu liczb (Prettier je zmienia). */
const norm = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\d*\.?\d+/g, (n) => String(Number(n)));

const themeCss = readFileSync(new URL('./theme.css', import.meta.url), 'utf8');
const cssVars = new Map(
  [...themeCss.matchAll(/--eq-([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]),
);

const tokenVars: Record<string, string> = {
  ...lcd,
  ...tablet,
  scrim,
  'shadow-card': shadowCard,
};

describe('theme.css', () => {
  it('defines every token with the value from tokens.ts', () => {
    for (const [token, value] of Object.entries(tokenVars)) {
      expect(cssVars.has(token), `--eq-${token}`).toBe(true);
      expect(norm(cssVars.get(token)!), `--eq-${token}`).toBe(norm(value));
    }
  });

  it('has no color variables outside tokens.ts', () => {
    const colorVars = [...cssVars.entries()].filter(([, v]) => /#|rgba?\(/i.test(v));
    for (const [name] of colorVars) expect(tokenVars, `--eq-${name}`).toHaveProperty([name]);
  });
});

const paletteUrl = new URL('../../../docs/paleta.md', import.meta.url);
const hasPalette = existsSync(paletteUrl);

// Frontend może być osobnym repo: wtedy docs/paleta.md nie ma i test jest pomijany.
describe.skipIf(!hasPalette)('docs/paleta.md', () => {
  const palette = hasPalette ? readFileSync(paletteUrl, 'utf8') : '';

  /** Wiersze tabel: tokeny w `…` z pierwszej kolumny, kolory w `#…` z drugiej. */
  const documented = new Map<string, string>();
  for (const line of palette.split('\n')) {
    const cells = line.split('|').map((cell) => cell.trim());
    if (cells.length < 4) continue;
    const names = [...(cells[1] ?? '').matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]!);
    const colors = [...(cells[2] ?? '').matchAll(/`(#[0-9A-Fa-f]{6})`/g)].map((m) => m[1]!);
    if (names.length > 0 && names.length === colors.length) {
      names.forEach((name, i) => documented.set(name, colors[i]!));
    }
  }

  it('matches every token from the LCD and tablet tables', () => {
    const tokens: Record<string, string> = { ...lcd, ...tablet };
    expect([...documented.keys()].sort()).toEqual(Object.keys(tokens).sort());
    for (const [name, color] of documented) expect(norm(tokens[name]!), name).toBe(norm(color));
  });

  it('matches scrim, card shadow and accent options', () => {
    const backticked = [...palette.matchAll(/`([^`]+)`/g)].map((m) => norm(m[1]!));
    expect(backticked).toContain(norm(scrim));
    expect(backticked).toContain(norm(shadowCard));
    for (const option of accentOptions) {
      expect(palette).toContain(`${option.name} \`${option.accent}\`/\`${option.accentStrong}\``);
    }
  });
});

/** Kontrast WCAG 2.x. */
function luminance(hex: string): number {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

type Pair = [fg: keyof typeof lcd, bg: keyof typeof lcd];

describe('contrast of pairs used by components', () => {
  const text: Pair[] = [
    ['ink', 'bg'],
    ['ink', 'surface'],
    ['ink', 'sand'],
    ['ink', 'accent-soft'],
    ['ink-2', 'bg'],
    ['ink-2', 'surface'],
    ['ink-2', 'sand'],
    ['accent', 'bg'],
    ['accent', 'surface'],
    ['accent', 'sand'],
    ['accent-strong', 'bg'],
    ['accent-strong', 'surface'],
    ['on-accent', 'accent'],
    ['on-accent', 'accent-strong'],
    ['ok-text', 'ok-tint'],
    ['ok-text', 'surface'],
    ['warn-text', 'warn-tint'],
    ['warn-text', 'warn-tint-weak'],
    ['crit-text', 'crit-tint'],
    ['crit-text', 'surface'],
    ['on-crit', 'crit-solid'],
    ['surface', 'ink'],
  ];
  const nonText: Pair[] = [
    ['line-input', 'surface'],
    ['line-input', 'bg'],
    ['accent', 'bg'],
    ['crit-line', 'crit-tint'],
    ['crit-line', 'surface'],
    ['ok-line', 'ok-tint'],
    ['warn-line', 'warn-tint'],
  ];

  it.each(text)('text %s on %s ≥ 4.5:1', (fg, bg) => {
    expect(contrast(lcd[fg], lcd[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(nonText)('outline %s on %s ≥ 3:1', (fg, bg) => {
    expect(contrast(lcd[fg], lcd[bg])).toBeGreaterThanOrEqual(3);
  });

  it('tablet: white on t-crit and black on t-ok / t-warn ≥ 4.5:1', () => {
    expect(contrast(tablet['t-paper'], tablet['t-crit'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tablet['t-ink'], tablet['t-ok'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tablet['t-ink'], tablet['t-warn'])).toBeGreaterThanOrEqual(4.5);
  });
});
