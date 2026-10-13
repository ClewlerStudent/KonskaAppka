import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { MFA_CODE, MOCK_PASSWORD, SIGN_UP_CODE, mockAuth } from './helpers/mock-auth';

// Panel web na atrapie API (page.route): logowanie hasłem i kodem MFA, PanelWitaj, wylogowanie,
// rejestracja. Przepływ z prawdziwym backendem auth: auth.spec.ts. Zrzuty: test-results/.

const webUrl = requireEnv('E2E_WEB_URL');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Brak ${name} (ustawia playwright.config.ts).`);
  return value;
}

const shot = (page: Page, testInfo: TestInfo, name: string) =>
  page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });

const passwordField = (page: Page) => page.getByLabel('Hasło', { exact: true });
const submit = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

async function typeCode(page: Page, code: string) {
  await page.getByLabel('Cyfra 1 z', { exact: false }).first().click();
  await page.keyboard.type(code);
}

async function submitPhoneLogin(page: Page, password = MOCK_PASSWORD) {
  await page.getByLabel('Numer telefonu').fill('602 000 145');
  await passwordField(page).fill(password);
  await submit(page, 'Zaloguj się').click();
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('panel web (mocked auth)', () => {
  test('Damian logs in with phone, password and SMS code; session survives reload; logout', async ({
    page,
  }, testInfo) => {
    const auth = await mockAuth(page);

    await page.goto(`${webUrl}/`);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page).toHaveTitle('Logowanie · EQUENOR');
    await expect(page.getByRole('heading', { name: 'Zaloguj się do panelu stajni' })).toBeVisible();
    await expect(page.getByText('Equestrian Management, Refined')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Telefon' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expectNoHorizontalScroll(page);
    await shot(page, testInfo, 'login');

    await submitPhoneLogin(page);
    await expect(page).toHaveURL(/\/login\/code$/);
    await expect(page.getByRole('heading', { name: 'Wpisz kod z SMS' })).toBeVisible();
    await expect(page.getByText('Kod wysłaliśmy na +48 602 *** 145.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Zmień numer' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Wyślij kod ponownie za \d:\d\d/ }),
    ).toBeDisabled();
    await typeCode(page, MFA_CODE.slice(0, 4));
    await shot(page, testInfo, 'login-code');
    await page.keyboard.type(MFA_CODE.slice(4));
    await submit(page, 'Zaloguj się').click();

    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page.getByRole('heading', { name: 'Witaj w EQUENOR, Damian' })).toBeVisible();
    await expect(page.getByText('Zalogowano: +48 602 *** 145')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Załóż konto firmy' })).toHaveAttribute(
      'href',
      '/business/new',
    );
    await expectNoHorizontalScroll(page);
    await shot(page, testInfo, 'welcome');

    const login = auth.requests.find((r) => r.path === '/auth/v1/login');
    expect(login?.body).toEqual({
      login: '+48602000145',
      password: MOCK_PASSWORD,
      clientId: 'web',
    });
    expect(login?.headers['x-equenor-client']).toBe('web');
    const mfa = auth.requests.find((r) => r.path === '/auth/v1/login/mfa');
    expect(mfa?.headers.authorization).toBe('Login lt-1');
    expect(mfa?.body).toEqual({ code: MFA_CODE });
    const storage = await page.evaluate(() => localStorage.length + sessionStorage.length);
    expect(storage).toBe(0);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Witaj w EQUENOR, Damian' })).toBeVisible();

    await page.getByRole('button', { name: 'Wyloguj' }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(auth.sessionValid()).toBe(false);
    await page.reload();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('wrong password and unknown account show the same message', async ({ page }) => {
    await mockAuth(page);
    await page.goto(`${webUrl}/login`);
    await submitPhoneLogin(page, 'zle-haslo-000');
    const alert = page.getByRole('alert');
    await expect(alert).toHaveText('Nieprawidłowy numer, e-mail lub hasło.');
    await expect(passwordField(page)).toHaveValue('');
    await expect(passwordField(page)).toBeFocused();

    await page.getByLabel('Numer telefonu').fill('600 999 999');
    await passwordField(page).fill(MOCK_PASSWORD);
    await submit(page, 'Zaloguj się').click();
    await expect(alert).toHaveText('Nieprawidłowy numer, e-mail lub hasło.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('wrong MFA code shows a message and clears the cells', async ({ page }) => {
    await mockAuth(page);
    await page.goto(`${webUrl}/login`);
    await submitPhoneLogin(page);
    await typeCode(page, '000000');
    await submit(page, 'Zaloguj się').click();
    await expect(page.getByRole('alert')).toHaveText('Nieprawidłowy kod. Spróbuj jeszcze raz.');
    for (let i = 1; i <= 6; i++) await expect(page.getByLabel(`Cyfra ${i} z 6`)).toHaveValue('');
    await expect(page.getByLabel('Cyfra 1 z 6')).toBeFocused();
  });

  test('Marta logs in with e-mail; the code comes by e-mail', async ({ page }) => {
    await mockAuth(page);
    await page.goto(`${webUrl}/login`);
    await page.getByRole('button', { name: 'E-mail' }).click();
    await page.getByLabel('Adres e-mail').fill('marta@stajnielipowe.pl');
    await passwordField(page).fill(MOCK_PASSWORD);
    await submit(page, 'Zaloguj się').click();
    await expect(page.getByRole('heading', { name: 'Wpisz kod z e-maila' })).toBeVisible();
    await expect(page.getByText('Kod wysłaliśmy na m•••@stajnielipowe.pl.')).toBeVisible();
    await expect(page.getByRole('group', { name: 'Kod z e-maila' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Zmień e-mail' })).toBeVisible();
    await typeCode(page, MFA_CODE);
    await submit(page, 'Zaloguj się').click();
    await expect(page.getByRole('heading', { name: 'Witaj w EQUENOR, Marta' })).toBeVisible();
    await expect(page.getByText('Zalogowano: m•••@stajnielipowe.pl')).toBeVisible();
  });

  test('resend after the countdown returns to the password with the login filled in', async ({
    page,
  }) => {
    await page.clock.install();
    await mockAuth(page);
    await page.goto(`${webUrl}/login`);
    await submitPhoneLogin(page);
    await expect(page.getByRole('button', { name: 'Wyślij kod ponownie za 1:00' })).toBeDisabled();
    await page.clock.fastForward(61_000);
    await page.getByRole('button', { name: 'Wyślij kod ponownie', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Numer telefonu')).toHaveValue('602 000 145');
    await expect(passwordField(page)).toHaveValue('');
    await expect(passwordField(page)).toBeFocused();
  });

  test('sign-up with e-mail, 8-digit confirmation, then login', async ({ page }, testInfo) => {
    await mockAuth(page);
    await page.goto(`${webUrl}/login`);
    await page.getByRole('link', { name: 'Załóż konto' }).click();
    await expect(page).toHaveURL(/\/sign-up$/);
    await expect(page).toHaveTitle('Załóż konto · EQUENOR');
    await expectNoHorizontalScroll(page);
    await shot(page, testInfo, 'sign-up');

    await page.getByRole('button', { name: 'E-mail' }).click();
    await page.getByLabel('Adres e-mail').fill('jan@stajniabrzozowa.pl');
    await passwordField(page).fill('krotkie');
    await page.getByLabel('Imię i nazwisko').fill('Jan Brzoza');
    await submit(page, 'Załóż konto').click();
    await expect(page.getByRole('alert')).toHaveText('Hasło musi mieć co najmniej 10 znaków.');

    await passwordField(page).fill(MOCK_PASSWORD);
    await page.getByRole('button', { name: 'English' }).click();
    await submit(page, 'Załóż konto').click();
    await expect(page).toHaveURL(/\/sign-up\/code$/);
    await expect(page.getByRole('heading', { name: 'Potwierdź konto' })).toBeVisible();
    await expect(page.getByText('Kod wysłaliśmy na j•••@stajniabrzozowa.pl.')).toBeVisible();
    await expect(page.getByLabel('Cyfra 8 z 8')).toBeVisible();
    await shot(page, testInfo, 'sign-up-code');

    await typeCode(page, SIGN_UP_CODE);
    await submit(page, 'Potwierdź').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('status')).toHaveText('Konto potwierdzone. Zaloguj się.');
    await expect(page.getByLabel('Adres e-mail')).toHaveValue('jan@stajniabrzozowa.pl');
    await expect(passwordField(page)).toBeFocused();
    await passwordField(page).fill(MOCK_PASSWORD);
    await submit(page, 'Zaloguj się').click();
    await typeCode(page, MFA_CODE);
    await submit(page, 'Zaloguj się').click();
    await expect(page.getByRole('heading', { name: 'Witaj w EQUENOR, Jan Brzoza' })).toBeVisible();
  });

  test('guards: /welcome without a session goes to login; forgot password is a placeholder', async ({
    page,
  }) => {
    await mockAuth(page);
    await page.goto(`${webUrl}/welcome`);
    await expect(page).toHaveURL(/\/login$/);
    await page.goto(`${webUrl}/login/code`);
    await expect(page).toHaveURL(/\/login$/);
    await page.getByRole('link', { name: 'Nie pamiętam hasła' }).click();
    await expect(page.getByRole('heading', { name: 'Nie pamiętam hasła' })).toBeVisible();
    await expect(page.getByText('Reset hasła będzie dostępny wkrótce.')).toBeVisible();
  });
});
