import { describe, expect, it } from 'vitest';
import { createFakeClock } from '../../../kit/clock.js';
import { DEMO_USERS, seedDemoUsers } from './demo-users.js';
import { FakeIdentityProvider } from './fake-idp.js';
import type { IdentityProvider } from './identity-provider.js';
import { NotImplementedError, ZitadelIdentityProvider } from './zitadel-idp.js';

const PASSWORD = 'haslo-testowe-1';
const phone = { kind: 'phone', value: '+48602000145' } as const;

async function setup() {
  const clock = createFakeClock();
  const idp = new FakeIdentityProvider(clock);
  await seedDemoUsers(idp, PASSWORD);
  const damian = await idp.findUserByContact(phone);
  if (!damian) throw new Error('no demo user');
  const login = async () => {
    const session = await idp.createSession({ idpUserId: damian.id, password: PASSWORD });
    if (typeof session === 'string') throw new Error(session);
    const code = await idp.requestOtp(session.sessionId, 'sms');
    return { sessionId: session.sessionId, code };
  };
  return { clock, idp, damian, login };
}

const wrong = (code: string) => (code === '000000' ? '111111' : '000000');

describe('FakeIdentityProvider', () => {
  it('seeds confirmed demo accounts', async () => {
    const { idp, damian } = await setup();
    expect(damian).toMatchObject({
      username: DEMO_USERS[0]?.username,
      otpChannel: 'sms',
      phone: { value: '+48602000145', verified: true },
      email: { value: 'damian@stajnielipowe.pl', verified: true },
    });
    const marta = await idp.findUserByContact({ kind: 'email', value: 'marta@stajnielipowe.pl' });
    expect(marta?.otpChannel).toBe('email');
  });

  it('checks the password and the MFA code in one session', async () => {
    const { idp, damian, login } = await setup();
    expect(await idp.createSession({ idpUserId: damian.id, password: 'zle-haslo-123' })).toBe(
      'invalid_credentials',
    );
    const { sessionId, code } = await login();
    expect(await idp.getSession(sessionId)).toMatchObject({
      passwordChecked: true,
      otpChecked: false,
    });
    expect(await idp.checkOtp(sessionId, code)).toBe('ok');
    expect(await idp.getSession(sessionId)).toMatchObject({ otpChecked: true });
  });

  it('invalidates the previous MFA code and stops accepting codes after 5 min', async () => {
    const { idp, clock, login } = await setup();
    const first = await login();
    let second: string;
    do second = await idp.requestOtp(first.sessionId, 'sms');
    while (second === first.code);
    expect(await idp.checkOtp(first.sessionId, first.code)).toBe('invalid_code');

    const next = await login();
    clock.advanceSeconds(300);
    // Kod i sesja logowania żyją 5 min: potem trzeba zalogować się od nowa.
    expect(await idp.checkOtp(next.sessionId, next.code)).toBe('no_session');
  });

  it('locks the account after 5 bad MFA codes, also for the password step', async () => {
    const { idp, damian, login } = await setup();
    const { sessionId, code } = await login();
    for (let i = 0; i < 4; i++)
      expect(await idp.checkOtp(sessionId, wrong(code))).toBe('invalid_code');
    expect(await idp.checkOtp(sessionId, wrong(code))).toBe('locked');
    expect(await idp.checkOtp(sessionId, code)).toBe('locked');
    expect(await idp.createSession({ idpUserId: damian.id, password: PASSWORD })).toBe('locked');
    expect((await idp.getUser(damian.id))?.locked).toBe(true);
  });

  it('verifies a new contact with an 8-digit code valid 15 min', async () => {
    const { idp, clock } = await setup();
    const contact = { kind: 'email', value: 'nowa@example.com' } as const;
    expect(
      await idp.createUser({
        userId: 'u1',
        contact,
        password: 'krotkie',
        displayName: 'N',
        locale: 'pl',
      }),
    ).toBe('weak_password');
    const created = await idp.createUser({
      userId: 'u1',
      contact,
      password: PASSWORD,
      displayName: 'Nowa',
      locale: 'pl',
    });
    if (typeof created === 'string') throw new Error(created);
    expect(created.verificationCode).toMatch(/^\d{8}$/);
    clock.advanceSeconds(900);
    expect(await idp.verifyContact(created.idpUserId, 'email', created.verificationCode)).toBe(
      'invalid_code',
    );
    const resent = await idp.resendVerificationCode(created.idpUserId, 'email');
    expect(await idp.verifyContact(created.idpUserId, 'email', resent ?? '')).toBe('ok');
    await idp.addOtp(created.idpUserId, 'email');
    expect(await idp.findUserByContact(contact)).toMatchObject({
      otpChannel: 'email',
      email: { verified: true },
    });
    expect(await idp.resendVerificationCode(created.idpUserId, 'email')).toBeNull();
  });
});

describe('ZitadelIdentityProvider', () => {
  it('implements the interface and fails loudly until the spike', async () => {
    const idp: IdentityProvider = new ZitadelIdentityProvider({
      apiUrl: 'https://zitadel.internal',
      serviceKeyFile: '/secrets/auth.json',
    });
    await expect(idp.findUserByContact(phone)).rejects.toBeInstanceOf(NotImplementedError);
  });
});
