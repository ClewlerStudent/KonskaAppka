import type { FakeIdentityProvider, VerifiedUserInput } from './fake-idp.js';

/**
 * Konta demo dla FAKE IdP (dev, testy, E2E). Kontakty fikcyjne, już potwierdzone;
 * hasło wszystkich kont to DEV_DEMO_PASSWORD z env (nie ma go w repo).
 */
export const DEMO_USERS: readonly Omit<VerifiedUserInput, 'password'>[] = [
  {
    username: '0199c6a0-0000-7000-8000-000000000001',
    displayName: 'Damian',
    locale: 'pl',
    phone: '+48602000145',
    email: 'damian@stajnielipowe.pl',
    otpChannel: 'sms',
  },
  {
    username: '0199c6a0-0000-7000-8000-000000000002',
    displayName: 'Ola',
    locale: 'pl',
    phone: '+48607000218',
    otpChannel: 'sms',
  },
  {
    username: '0199c6a0-0000-7000-8000-000000000003',
    displayName: 'Anna',
    locale: 'pl',
    phone: '+48600000412',
    otpChannel: 'sms',
  },
  {
    username: '0199c6a0-0000-7000-8000-000000000004',
    displayName: 'Marta',
    locale: 'pl',
    email: 'marta@stajnielipowe.pl',
    otpChannel: 'email',
  },
];

export async function seedDemoUsers(idp: FakeIdentityProvider, password: string): Promise<void> {
  for (const user of DEMO_USERS) await idp.addVerifiedUser({ ...user, password });
}
