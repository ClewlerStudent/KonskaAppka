import type { Page, Route } from '@playwright/test';

/**
 * Atrapa tras /auth/v1 przez przechwytywanie żądań (page.route): panel bez backendu.
 * Stan sesji („ciasteczko”) trzyma atrapa, więc przeładowanie strony go zachowuje.
 */
export const MOCK_PASSWORD = 'Dobre-haslo-123';
export const MFA_CODE = '482913';
export const SIGN_UP_CODE = '48291375';

interface MockAccount {
  id: string;
  logins: string[];
  displayName: string;
  channel: 'sms' | 'email';
  phoneMasked: string | null;
  emailMasked: string | null;
  confirmed: boolean;
}

export interface RecordedRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface MockAuth {
  readonly requests: RecordedRequest[];
  /** Czy atrapa przyjmie refresh token (ciasteczko) przy POST /token. */
  sessionValid(): boolean;
}

const demoAccounts = (): MockAccount[] => [
  {
    id: '0199c6a0-0000-7000-8000-000000000001',
    logins: ['+48602000145', 'damian@stajnielipowe.pl'],
    displayName: 'Damian',
    channel: 'sms',
    phoneMasked: '+48 602 *** 145',
    emailMasked: 'd•••@stajnielipowe.pl',
    confirmed: true,
  },
  {
    id: '0199c6a0-0000-7000-8000-000000000004',
    logins: ['marta@stajnielipowe.pl'],
    displayName: 'Marta',
    channel: 'email',
    phoneMasked: null,
    emailMasked: 'm•••@stajnielipowe.pl',
    confirmed: true,
  },
];

const titles: Record<string, string> = {
  invalid_credentials: 'Invalid credentials',
  invalid_code: 'Invalid code',
  invalid_token: 'Invalid token',
  session_revoked: 'Session revoked',
  account_not_confirmed: 'Account not confirmed',
  weak_password: 'Weak password',
  validation_failed: 'Validation failed',
};

const masked = (account: MockAccount) =>
  account.channel === 'sms' ? account.phoneMasked! : account.emailMasked!;

function problem(route: Route, status: number, code: string) {
  return route.fulfill({
    status,
    contentType: 'application/problem+json',
    body: JSON.stringify({
      type: `urn:equenor:problem:${code}`,
      title: titles[code] ?? code,
      status,
      code,
    }),
  });
}

const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

export async function mockAuth(page: Page): Promise<MockAuth> {
  const accounts = demoAccounts();
  const loginTokens = new Map<string, MockAccount>();
  const requests: RecordedRequest[] = [];
  let signedIn: MockAccount | null = null;
  let issued = 0;

  const find = (login: string) => accounts.find((a) => a.logins.includes(login));
  const tokens = () => ({ accessToken: `at-${++issued}`, tokenType: 'Bearer', expiresIn: 300 });

  await page.route('**/auth/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const raw = request.postData();
    const body = (raw ? JSON.parse(raw) : undefined) as Record<string, string> | undefined;
    const headers = await request.allHeaders();
    requests.push({ method: request.method(), path, headers, body });

    switch (`${request.method()} ${path}`) {
      case 'POST /auth/v1/login': {
        const account = find(body?.login ?? '');
        if (!account || body?.password !== MOCK_PASSWORD) {
          return problem(route, 401, 'invalid_credentials');
        }
        if (!account.confirmed) return problem(route, 409, 'account_not_confirmed');
        const loginToken = `lt-${loginTokens.size + 1}`;
        loginTokens.set(loginToken, account);
        return json(route, 200, {
          loginToken,
          channel: account.channel,
          maskedContact: masked(account),
          expiresIn: 300,
        });
      }
      case 'POST /auth/v1/login/mfa': {
        const token = (headers.authorization ?? '').replace(/^Login /, '');
        const account = loginTokens.get(token);
        if (!account) return problem(route, 401, 'invalid_token');
        if (body?.code !== MFA_CODE) return problem(route, 401, 'invalid_code');
        loginTokens.delete(token);
        signedIn = account;
        return json(route, 200, tokens());
      }
      case 'POST /auth/v1/token':
        return signedIn ? json(route, 200, tokens()) : problem(route, 401, 'session_revoked');
      case 'GET /auth/v1/me': {
        if (!signedIn || !(headers.authorization ?? '').startsWith('Bearer at-')) {
          return problem(route, 401, 'invalid_token');
        }
        return json(route, 200, {
          id: signedIn.id,
          displayName: signedIn.displayName,
          locale: 'pl',
          contact: { phoneMasked: signedIn.phoneMasked, emailMasked: signedIn.emailMasked },
          businesses: [],
          startView: 'welcome',
        });
      }
      case 'POST /auth/v1/logout':
        signedIn = null;
        return route.fulfill({ status: 204 });
      case 'POST /auth/v1/sign-up': {
        const login = body?.login ?? '';
        if ((body?.password ?? '').length < 10) return problem(route, 422, 'weak_password');
        const email = login.includes('@');
        const account: MockAccount = {
          id: `0199c6a0-0000-7000-8000-${String(accounts.length + 1).padStart(12, '0')}`,
          logins: [login],
          displayName: body?.displayName ?? '',
          channel: email ? 'email' : 'sms',
          phoneMasked: email
            ? null
            : `${login.slice(0, 3)} ${login.slice(3, 6)} *** ${login.slice(-3)}`,
          emailMasked: email ? `${login[0]}•••@${login.split('@')[1]}` : null,
          confirmed: false,
        };
        if (!find(login)) accounts.push(account);
        const target = find(login)!;
        return json(route, 202, { channel: target.channel, maskedContact: masked(target) });
      }
      case 'POST /auth/v1/sign-up/resend': {
        const account = find(body?.login ?? '');
        if (!account) return json(route, 202, { channel: 'sms', maskedContact: '+48 *** ***' });
        return json(route, 202, { channel: account.channel, maskedContact: masked(account) });
      }
      case 'POST /auth/v1/sign-up/confirm': {
        const account = find(body?.login ?? '');
        if (!account || body?.code !== SIGN_UP_CODE) return problem(route, 401, 'invalid_code');
        account.confirmed = true;
        return route.fulfill({ status: 204 });
      }
      default:
        return problem(route, 404, 'not_found');
    }
  });

  return { requests, sessionValid: () => signedIn !== null };
}
