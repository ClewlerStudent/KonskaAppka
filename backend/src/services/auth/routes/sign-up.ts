import { v7 as uuidv7 } from 'uuid';
import { confirmSignUp, resendSignUpCode, signUp } from '../../../contracts/auth.js';
import { ApiError } from '../../../kit/problem.js';
import type { Service } from '../../../kit/service.js';
import { atLeast } from '../../../kit/timing.js';
import { existingAccountMessage, verifyMessage } from '../codes/messages.js';
import { channelFor, maskContact, requireContact, type Contact } from '../contact.js';
import type { RouteDeps } from '../deps.js';
import {
  hasVerifiedContact,
  isContactVerified,
  PASSWORD_MIN,
} from '../identity/identity-provider.js';

/**
 * Rejestracja (docs/mikroserwisy.md 3.1): ani treść, ani czas odpowiedzi nie zdradzają,
 * czy konto istnieje. Wiersz `users` powstaje dopiero przy pierwszym logowaniu.
 */
export function registerSignUpRoutes(service: Service, deps: RouteDeps): void {
  const { idp, codes, config } = deps;
  const evenly = <T>(work: () => Promise<T>) => atLeast(config.credentialCheckMinMs, work);
  const codeSent = (contact: Contact) => ({
    channel: channelFor(contact.kind),
    maskedContact: maskContact(contact),
  });

  service.route(signUp, ({ body }) =>
    evenly(async () => {
      const contact = requireContact(body.login);
      if (body.password.length < PASSWORD_MIN) throw new ApiError('weak_password');

      const existing = await idp.findUserByContact(contact);
      if (existing && isContactVerified(existing, contact)) {
        // Jeden kontakt, jedno konto: nic nie zakładamy, właściciel dostaje „Masz już konto”.
        await codes.send(existingAccountMessage(contact, existing.locale));
      } else if (existing && hasVerifiedContact(existing)) {
        // Kontakt dopisany do potwierdzonego konta, ale niezweryfikowany: nie ruszamy konta.
      } else {
        // Konto niepotwierdzone na ten kontakt (np. cudze) nie blokuje rejestracji właścicielowi.
        if (existing) await idp.deleteUser(existing.id);
        const created = await idp.createUser({
          userId: uuidv7(),
          contact,
          password: body.password,
          displayName: body.displayName,
          locale: body.locale,
        });
        if (created === 'weak_password') throw new ApiError('weak_password');
        await codes.send(verifyMessage(contact, body.locale, created.verificationCode));
      }
      return { status: 202, body: codeSent(contact) };
    }),
  );

  service.route(confirmSignUp, ({ body }) =>
    evenly(async () => {
      const contact = requireContact(body.login);
      const user = await idp.findUserByContact(contact);
      // Brak konta i konto już potwierdzone dają to samo co zły kod.
      if (!user || isContactVerified(user, contact)) throw new ApiError('invalid_code');
      const result = await idp.verifyContact(user.id, contact.kind, body.code);
      if (result !== 'ok') throw new ApiError('invalid_code');
      await idp.addOtp(user.id, channelFor(contact.kind));
      return { status: 204, body: undefined };
    }),
  );

  service.route(resendSignUpCode, ({ body }) =>
    evenly(async () => {
      const contact = requireContact(body.login);
      const user = await idp.findUserByContact(contact);
      if (user && !hasVerifiedContact(user)) {
        const code = await idp.resendVerificationCode(user.id, contact.kind);
        if (code) await codes.send(verifyMessage(contact, user.locale, code));
      }
      return { status: 202, body: codeSent(contact) };
    }),
  );
}
