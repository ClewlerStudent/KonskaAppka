// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Strony www są statyczne i działają pod CSP bez 'unsafe-inline' (nginx/default.conf.template):
// bez skryptów, bez stylów inline i bez zasobów z innych domen.
const dir = new URL('./', import.meta.url);
const pages = readdirSync(dir).filter((name) => name.endsWith('.html'));

describe.each(pages)('www/%s', (name) => {
  const html = readFileSync(new URL(name, dir), 'utf8');

  it('is a Polish page with title, viewport, one h1 and the shared stylesheet', () => {
    expect(html).toContain('<html lang="pl">');
    expect(html).toMatch(/<title>[^<]*EQUENOR[^<]*<\/title>/);
    expect(html).toContain('name="viewport"');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('<link rel="stylesheet" href="/src/main.css" />');
  });

  it('has no scripts, inline styles or external URLs', () => {
    expect(html).not.toMatch(/<script|<style|\sstyle=|\son[a-z]+=/i);
    expect(html).not.toMatch(/(?:src|href)="(?:https?:)?\/\//);
  });

  it('links only to existing pages, the panel and the contact address', () => {
    for (const [, href = ''] of html.matchAll(/href="([^"]*)"/g)) {
      if (href.startsWith('%VITE_PANEL_URL%/') || href === 'mailto:%VITE_CONTACT_EMAIL%') continue;
      if (href === '/favicon.svg' || href === '/src/main.css') continue;
      const page = href === '/' ? 'index.html' : href.slice(1);
      expect(href.startsWith('/') && existsSync(new URL(page, dir)), href).toBe(true);
    }
  });
});

it('covers the home page and the footer documents', () => {
  expect([...pages].sort()).toEqual(['index.html', 'polityka-prywatnosci.html', 'regulamin.html']);
});
