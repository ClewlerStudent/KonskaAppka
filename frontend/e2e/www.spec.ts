import { expect, test, type Page } from '@playwright/test';
import { lcd } from '../src/theme/tokens';

// Strona www (statyczna, bez JS): treść, linki do panelu, układ 1440 i 390, brak żądań
// poza localhost, fonty lokalne. Pełne zrzuty trafiają do test-results/ (porównanie z makietami).

const wwwUrl = requireEnv('E2E_WWW_URL');
const webUrl = requireEnv('E2E_WEB_URL');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Brak ${name} (ustawia playwright.config.ts).`);
  return value;
}

const hexToRgb = (hex: string) => {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const isLocal = (url: string) => {
  const { protocol, hostname } = new URL(url);
  return protocol === 'data:' || hostname === 'localhost' || hostname === '127.0.0.1';
};

async function openHome(page: Page): Promise<string[]> {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(`${wwwUrl}/`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return requests;
}

const screens = [
  ['Apka w telefonie', 'Flagi klientów i szybkie akcje obsługi.'],
  ['Tablet przy boksie', 'Flaga i karmienie przy samym koniu.'],
  ['Telewizor w korytarzu', 'Wszystkie hale na jednym ekranie.'],
  ['Panel web dla admina', 'Hale, boksy, ludzie i ustawienia.'],
] as const;

/** Tekst ze zwykłymi spacjami (\s obejmuje twarde spacje po jednoliterowych słowach). */
const plain = (text: string | null) => (text ?? '').replace(/\s+/g, ' ');

test('shows hero, four screens, flags and footer', async ({ page }) => {
  await openHome(page);

  await expect(page).toHaveTitle('EQUENOR · Equestrian Management, Refined');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');

  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveCount(1);
  expect(plain(await h1.textContent()).trim()).toBe('EQUENOR Equestrian Management, Refined');
  await expect(h1.locator('[lang="en"]')).toHaveText('Equestrian Management, Refined');
  expect(plain(await page.locator('.hero__lead').textContent()).trim()).toBe(
    'Klient ustawia flagę w apce, a tablet przy boksie pokazuje ją od razu, z godzinami.',
  );

  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Jedna stajnia, cztery ekrany',
    'Flagi z godzinami',
  ]);
  const cards = page.locator('.screens > li');
  await expect(cards).toHaveCount(4);
  for (const [i, [name, description]] of screens.entries()) {
    const card = cards.nth(i);
    expect(plain(await card.getByRole('heading', { level: 3 }).textContent())).toBe(name);
    expect(plain(await card.locator('p').textContent())).toBe(description);
  }

  await expect(
    page.getByRole('img', { name: /^Telefon klienta z flagą Bez śniadania/ }),
  ).toBeVisible();
  await expect(page.getByRole('img', { name: /^Flaga Bez śniadania 06:00–10:00/ })).toBeVisible();

  const footer = page.getByRole('contentinfo');
  await expect(footer.getByText('© 2026 EQUENOR')).toBeVisible();
  const email = footer.getByRole('link', { name: /@/ });
  await expect(email).toHaveAttribute('href', /^mailto:[^@\s%]+@[^@\s%]+$/);
  const info = footer.getByRole('navigation', { name: 'Informacje' });
  await expect(info.getByRole('link', { name: 'Polityka prywatności' })).toHaveAttribute(
    'href',
    '/polityka-prywatnosci.html',
  );
  await expect(info.getByRole('link', { name: 'Regulamin' })).toHaveAttribute(
    'href',
    '/regulamin.html',
  );
  await expect(footer.getByRole('link', { name: /App Store/ })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

test('links to the panel use the configured address', async ({ page }) => {
  await openHome(page);
  const hero = page.locator('.hero');
  await expect(hero.getByRole('link', { name: 'Załóż konto firmy' })).toHaveAttribute(
    'href',
    `${webUrl}/sign-up`,
  );
  await expect(hero.getByRole('link', { name: 'Zaloguj się' })).toHaveAttribute(
    'href',
    `${webUrl}/login`,
  );
  // Żaden znacznik %VITE_*% nie zostaje w gotowej stronie.
  expect(await page.content()).not.toContain('%VITE_');
});

test('makes no requests outside localhost and uses local fonts', async ({ page }) => {
  const requests = await openHome(page);
  expect(requests.filter((url) => !isLocal(url))).toEqual([]);

  const figtree700 = await page.evaluate(() =>
    [...document.fonts].some(
      (face) =>
        face.family.replace(/["']/g, '') === 'Figtree' &&
        face.weight === '700' &&
        face.status === 'loaded',
    ),
  );
  expect(figtree700).toBe(true);
  expect(
    await page.evaluate(() => getComputedStyle(document.body).fontFamily.split(',')[0]?.trim()),
  ).toMatch(/^"?Figtree"?$/);
});

test('matches the mockup layout', async ({ page, isMobile }, testInfo) => {
  await openHome(page);

  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    background: getComputedStyle(document.body).backgroundColor,
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.innerWidth);
  expect(sizes.background).toBe(hexToRgb(lcd.bg));

  const wordmark = page.locator('.hero__wordmark');
  const { fontSize, letterSpacing } = await wordmark.evaluate((el) => {
    const style = getComputedStyle(el);
    return { fontSize: parseFloat(style.fontSize), letterSpacing: parseFloat(style.letterSpacing) };
  });
  expect(fontSize).toBe(isMobile ? 44 : 76);
  expect(letterSpacing).toBeCloseTo(fontSize * 0.16, 1);

  const boxes = await page.locator('.screens > li').evaluateAll((items) =>
    items.map((item) => {
      const { x, y } = item.getBoundingClientRect();
      return { x: Math.round(x), y: Math.round(y) };
    }),
  );
  expect(boxes).toHaveLength(4);
  const rows = new Set(boxes.map((box) => box.y)).size;
  const columns = new Set(boxes.map((box) => box.x)).size;
  if (isMobile) {
    expect({ rows, columns }).toEqual({ rows: 2, columns: 2 });
    await expect(page.locator('.flag-list')).toBeVisible();
    await expect(page.locator('.timeline')).toBeHidden();
  } else {
    expect({ rows, columns }).toEqual({ rows: 1, columns: 4 });
    await expect(page.locator('.timeline')).toBeVisible();
    await expect(page.locator('.flag-list')).toBeHidden();
  }

  // Stopka: e-mail w jednym rzędzie ze znakiem (adres z .env ma realną długość).
  const footerRow = await page.evaluate(() => {
    const top = (selector: string) =>
      document.querySelector(`.site-footer__top ${selector}`)?.getBoundingClientRect();
    const brand = top('.brand');
    const email = top('.site-footer__email');
    return brand && email
      ? Math.abs(brand.top + brand.height / 2 - (email.top + email.height / 2))
      : -1;
  });
  expect(footerRow).toBeGreaterThanOrEqual(0);
  expect(footerRow).toBeLessThan(4);

  await page.screenshot({
    path: testInfo.outputPath(`www-${testInfo.project.name}.png`),
    fullPage: true,
  });
});

test('has no horizontal scroll from 390 to 1440 px; one-column hero art is centered', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Szerokości sprawdza projekt desktop.');
  await openHome(page);
  for (const width of [390, 480, 639, 640, 768, 1024, 1239, 1240, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `${width} px`).toBeLessThanOrEqual(0);
    if (width >= 640 && width < 1240) {
      // Hero w jednej kolumnie: ilustracja na środku sekcji, nie przy lewej krawędzi.
      const offset = await page.evaluate(() => {
        const frame = document.querySelector('.hero')?.getBoundingClientRect();
        const art = document.querySelector('.art--full')?.getBoundingClientRect();
        return frame && art
          ? Math.abs(frame.left + frame.width / 2 - (art.left + art.width / 2))
          : -1;
      });
      expect(offset, `${width} px`).toBeGreaterThanOrEqual(0);
      expect(offset, `${width} px`).toBeLessThan(1);
    }
  }
});

test('footer pages open and lead back home', async ({ page }) => {
  await openHome(page);
  await page.getByRole('link', { name: 'Regulamin' }).click();
  await expect(page).toHaveTitle('Regulamin · EQUENOR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Regulamin');

  await page.getByRole('link', { name: 'Polityka prywatności' }).click();
  await expect(page).toHaveTitle('Polityka prywatności · EQUENOR');

  await page.getByRole('link', { name: 'Wróć na stronę główną' }).click();
  await expect(page).toHaveTitle('EQUENOR · Equestrian Management, Refined');
});
