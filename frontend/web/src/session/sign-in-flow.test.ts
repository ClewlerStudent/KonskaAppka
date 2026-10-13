import { describe, expect, it } from 'vitest';
import { createSignInFlow, loginFromDraft, nationalDigits } from './sign-in-flow';

describe('loginFromDraft', () => {
  it('builds E.164 from the national number', () => {
    expect(loginFromDraft({ kind: 'phone', phone: '602 000 145', email: '' })).toEqual({
      ok: true,
      login: '+48602000145',
    });
    expect(nationalDigits('+48 602-000-145')).toBe('602000145');
    expect(loginFromDraft({ kind: 'phone', phone: '60200014', email: '' })).toEqual({
      ok: false,
      field: 'phone',
    });
  });

  it('trims the e-mail and requires @', () => {
    expect(loginFromDraft({ kind: 'email', phone: '', email: ' marta@stajnielipowe.pl ' })).toEqual(
      { ok: true, login: 'marta@stajnielipowe.pl' },
    );
    expect(loginFromDraft({ kind: 'email', phone: '', email: 'marta' })).toEqual({
      ok: false,
      field: 'email',
    });
  });
});

describe('sign-in flow', () => {
  it('returns to the password with hints and forgets the challenge', () => {
    const flow = createSignInFlow();
    flow.startMfa({ kind: 'phone', channel: 'sms', maskedContact: 'x', loginToken: 'lt' });
    flow.backToPassword();
    expect(flow.challenge()).toBeNull();
    expect(flow.loginHints()).toEqual({ accountConfirmed: false, focusPassword: true });
    flow.clearLoginHints();
    expect(flow.loginHints().focusPassword).toBe(false);
  });

  it('reset clears the login typed before', () => {
    const flow = createSignInFlow();
    flow.saveDraft({ kind: 'email', phone: '', email: 'a@b.pl' });
    flow.reset();
    expect(flow.draft()).toEqual({ kind: 'phone', phone: '', email: '' });
  });
});
