import { describe, expect, it } from 'vitest';
import { loginRateKey, maskEmail, maskPhone, normalizeLogin } from './contact.js';

describe('normalizeLogin', () => {
  it.each([
    ['602 000 145', { kind: 'phone', value: '+48602000145' }],
    ['602-000-145', { kind: 'phone', value: '+48602000145' }],
    [' +48 602 000 145 ', { kind: 'phone', value: '+48602000145' }],
    ['+380 67 123 4567', { kind: 'phone', value: '+380671234567' }],
    [' Damian@StajnieLipowe.PL ', { kind: 'email', value: 'damian@stajnielipowe.pl' }],
  ])('%j → %j', (raw, expected) => {
    expect(normalizeLogin(raw)).toEqual(expected);
  });

  it.each(['12345', '0602000145', '+0123456789', 'damian@', '@x.pl', 'a b@x.pl', 'abc'])(
    'rejects %j',
    (raw) => {
      expect(normalizeLogin(raw)).toBeNull();
    },
  );

  it('rejects e-mails over 254 characters', () => {
    expect(normalizeLogin(`${'a'.repeat(250)}@x.pl`)).toBeNull();
  });

  it('gives one rate-limit key for every spelling of a contact', () => {
    expect(loginRateKey('602 000 145')).toBe(loginRateKey('+48602000145'));
    expect(loginRateKey('Ola@X.pl')).toBe('ola@x.pl');
  });
});

describe('masks', () => {
  it('masks phones and e-mails like the mockups', () => {
    expect(maskPhone('+48602000145')).toBe('+48 602 *** 145');
    expect(maskPhone('+380671234567')).toBe('+380 671 *** 567');
    expect(maskEmail('damian@stajnielipowe.pl')).toBe('d•••@stajnielipowe.pl');
    expect(maskEmail('marta@stajnielipowe.pl')).toBe('m•••@stajnielipowe.pl');
  });
});
