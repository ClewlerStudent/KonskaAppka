import { expect, test, type Page } from '@playwright/test';
import { waitForCode } from './helpers/inbox';

// Panel web z prawdziwym backendem auth (FAKE IdP, konta demo, kody ze skrzynki dev).
// Atrapa API i pozostałe stany: panel.spec.ts. Na telefonie tylko pełna ścieżka Damiana.

const webUrl = requireEnv('E2E_WEB_URL');
const inbox = requireEnv('E2E_INBOX_FILE');
const demoPassword = requireEnv('E2E_DEMO_PASSWORD');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Brak ${name} (ustawia playwright.config.ts).`);
  return value;
}

const damian = { phone: '602 000 145', e164: '+48602000145', email: 'damian@stajnielipowe.pl' };
const ola = { phone: '607 000 218', e164: '+48607000218' };
const marta = { email: 'marta@stajnielipowe.pl' };

const passwordField = (page: Page) => page.getByLabel('Hasło', { exact: true });
const submit = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

async function typeCode(page: Page, code: string) {
  await page.getByLabel(/^Cyfra 1 z \d$/).click();
  await page.keyboard.type(code);
}

async function loginWithPhone(page: Page, phone: string, password: string) {
  await page.goto(`${webUrl}/login`);
  await page.getByLabel('Numer telefonu').fill(phone);
  await passwordField(page).fill(password);
  await submit(page, 'Zaloguj się').click();
}

async function loginWithEmail(page: Page, email: string, password: string) {
  await page.goto(`${webUrl}/login`);
  await page.getByRole('button', { name: 'E-mail' }).click();
  await page.getByLabel('Adres e-mail').fill(email);
  await passwordField(page).fill(password);
  await submit(page, 'Zaloguj się').click();
}

async function enterMfaCode(page: Page, to: string, after: number) {
  const { code } = await waitForCode(inbox, { to, purpose: 'mfa', after });
  await typeCode(page, code);
  await submit(page, 'Zaloguj się').click();
}

test.describe('panel web with the auth service', () => {
  test('Damian: phone, password and SMS code; cookie only; reload; logout', async ({
    page,
    context,
  }) => {
    const after = Date.now();
    await loginWithPhone(page, damian.phone, demoPassword);
    await expect(page.getByRole('heading', { name: 'Wpisz kod z SMS' })).toBeVisible();
    await expect(page.getByText('Kod wysłaliśmy na +48 602 *** 145.')).toBeVisible();
    await enterMfaCode(page, damian.e164, after);

    await expect(page.getByRole('heading', { name: 'Witaj w EQUENOR, Damian' })).toBeVisible();
    await expect(page.getByText('Zalogowano: +48 602 *** 145')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const cookie = (await context.cookies()).find((c) => c.name === '__Secure-eq_rt');
    expect(cookie).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/auth/v1/token',
    });
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Witaj w EQUENOR, Damian' })).toBeVisible();

    await page.getByRole('button', { name: 'Wyloguj' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.reload();
    await expect(page).toHaveURL(/\/login$/);
  });

  test.describe('desktop only', () => {
    test.skip(({ isMobile }) => isMobile, 'Na telefonie tylko pełna ścieżka Damiana.');

    test('wrong password and unknown account give the same message', async ({ page }) => {
      await loginWithPhone(page, damian.phone, `${demoPassword}-zle`);
      await expect(page.getByRole('alert')).toHaveText('Nieprawidłowy numer, e-mail lub hasło.');
      await loginWithPhone(page, '600 111 222', demoPassword);
      await expect(page.getByRole('alert')).toHaveText('Nieprawidłowy numer, e-mail lub hasło.');
    });

    test('wrong code: message and empty cells', async ({ page }) => {
      await loginWithPhone(page, damian.phone, demoPassword);
      await typeCode(page, '000000');
      await submit(page, 'Zaloguj się').click();
      await expect(page.getByRole('alert')).toHaveText('Nieprawidłowy kod. Spróbuj jeszcze raz.');
      await expect(page.getByLabel('Cyfra 1 z 6')).toHaveValue('');
    });

    test('Ola: phone, password and SMS code; PanelWitaj; logout', async ({ page }) => {
      const after = Date.now();
      await loginWithPhone(page, ola.phone, demoPassword);
      await expect(page.getByText('Kod wysłaliśmy na +48 607 *** 218.')).toBeVisible();
      await enterMfaCode(page, ola.e164, after);
      await expect(page).toHaveURL(/\/welcome$/);
      await expect(page.getByRole('heading', { name: 'Witaj w EQUENOR, Ola' })).toBeVisible();
      await expect(page.getByText('Zalogowano: +48 607 *** 218')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Załóż konto firmy' })).toBeVisible();

      await page.getByRole('button', { name: 'Wyloguj' }).click();
      await expect(page).toHaveURL(/\/login$/);
      await page.goto(`${webUrl}/welcome`);
      await expect(page).toHaveURL(/\/login$/);
    });

    test('Marta logs in with e-mail and the code comes by e-mail', async ({ page }) => {
      const after = Date.now();
      await loginWithEmail(page, marta.email, demoPassword);
      await expect(page.getByRole('heading', { name: 'Wpisz kod z e-maila' })).toBeVisible();
      await expect(page.getByText(/Kod wysłaliśmy na m•••@stajnielipowe\.pl\./)).toBeVisible();
      await enterMfaCode(page, marta.email, after);
      await expect(page.getByRole('heading', { name: 'Witaj w EQUENOR, Marta' })).toBeVisible();
    });

    test('Damian logs in with e-mail; the code comes by SMS (account channel)', async ({
      page,
    }) => {
      const after = Date.now();
      await loginWithEmail(page, damian.email, demoPassword);
      await expect(page.getByRole('heading', { name: 'Wpisz kod z SMS' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Zmień e-mail' })).toBeVisible();
      const { channel } = await waitForCode(inbox, { to: damian.e164, purpose: 'mfa', after });
      expect(channel).toBe('sms');
    });

    test('resend after the countdown: back to the password with the login filled in', async ({
      page,
    }) => {
      await page.clock.install();
      await loginWithPhone(page, damian.phone, demoPassword);
      await expect(page.getByRole('button', { name: /Wyślij kod ponownie za/ })).toBeDisabled();
      await page.clock.fastForward(61_000);
      await page.getByRole('button', { name: 'Wyślij kod ponownie', exact: true }).click();
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByLabel('Numer telefonu')).toHaveValue(damian.phone);
      await expect(passwordField(page)).toHaveValue('');
      await expect(passwordField(page)).toBeFocused();
    });

    test('sign-up with a new e-mail, confirmation code, then first login', async ({ page }) => {
      const email = `jan.${Date.now()}@stajniabrzozowa.pl`;
      const password = 'Nowe-haslo-2026';
      let after = Date.now();
      await page.goto(`${webUrl}/sign-up`);
      await page.getByRole('button', { name: 'E-mail' }).click();
      await page.getByLabel('Adres e-mail').fill(email);
      await passwordField(page).fill(password);
      await page.getByLabel('Imię i nazwisko').fill('Jan Brzoza');
      await submit(page, 'Załóż konto').click();

      await expect(page.getByRole('heading', { name: 'Potwierdź konto' })).toBeVisible();
      await expect(page.getByLabel('Cyfra 8 z 8')).toBeVisible();
      const { code } = await waitForCode(inbox, { to: email, purpose: 'verify', after });
      await typeCode(page, code);
      await submit(page, 'Potwierdź').click();
      await expect(page.getByRole('status')).toHaveText('Konto potwierdzone. Zaloguj się.');

      after = Date.now();
      await passwordField(page).fill(password);
      await submit(page, 'Zaloguj się').click();
      await enterMfaCode(page, email, after);
      await expect(
        page.getByRole('heading', { name: 'Witaj w EQUENOR, Jan Brzoza' }),
      ).toBeVisible();
    });

    test('„Nie pamiętam hasła” is a placeholder', async ({ page }) => {
      await page.goto(`${webUrl}/login`);
      await page.getByRole('link', { name: 'Nie pamiętam hasła' }).click();
      await expect(page.getByText('Reset hasła będzie dostępny wkrótce.')).toBeVisible();
    });
  });
});
