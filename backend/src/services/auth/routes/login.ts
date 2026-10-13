import { v7 as uuidv7 } from 'uuid';
import { login, loginMfa } from '../../../contracts/auth.js';
import { ClientIdSchema } from '../../../contracts/common.js';
import { epochSeconds } from '../../../kit/clock.js';
import { isBrowserRequest } from '../../../kit/origin.js';
import { ApiError } from '../../../kit/problem.js';
import type { Service } from '../../../kit/service.js';
import { mfaMessage } from '../codes/messages.js';
import { maskContact, requireContact } from '../contact.js';
import type { RouteDeps } from '../deps.js';
import { otpTarget } from '../identity/identity-provider.js';
import { isClientAllowed } from '../tokens/claims.js';
import { tokenReplyBody } from './session.js';

const LOGIN_AUTH_RE = /^Login +([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/;

/**
 * Logowanie (docs/mikroserwisy.md 3.1): hasło, potem zawsze kod MFA na kanał konta.
 * Kod wysyłamy dopiero po poprawnym haśle w tej samej sesji dostawcy tożsamości.
 */
export function registerLoginRoutes(service: Service, deps: RouteDeps): void {
  const { idp, codes, tokens, users, access, clock } = deps;

  service.route(login, async ({ body }) => {
    const contact = requireContact(body.login);
    const user = await idp.findUserByContact(contact);
    // Brak konta i złe hasło: identyczna odpowiedź.
    if (!user) throw new ApiError('invalid_credentials');
    const session = await idp.createSession({ idpUserId: user.id, password: body.password });
    if (session === 'locked') throw new ApiError('account_locked');
    if (session === 'invalid_credentials') throw new ApiError('invalid_credentials');

    // Dopiero po poprawnym haśle: konto bez potwierdzonego kanału kodu to 409.
    const target = otpTarget(user);
    if (!user.otpChannel || !target) {
      await idp.deleteSession(session.sessionId);
      throw new ApiError('account_not_confirmed');
    }
    const code = await idp.requestOtp(session.sessionId, user.otpChannel);
    await codes.send(mfaMessage(target, user.locale, code));

    const loginToken = await tokens.issueLoginToken({
      clientId: body.clientId,
      idpUserId: user.id,
      idpSessionId: session.sessionId,
      channel: user.otpChannel,
    });
    return {
      status: 200,
      body: {
        loginToken: loginToken.token,
        channel: user.otpChannel,
        maskedContact: maskContact(target),
        expiresIn: loginToken.expiresIn,
      },
    };
  });

  service.route(loginMfa, async ({ req, reply, body }) => {
    const header = LOGIN_AUTH_RE.exec(req.headers.authorization ?? '');
    const claims = header?.[1] ? await tokens.verifyLoginToken(header[1]) : null;
    const clientId = ClientIdSchema.safeParse(claims?.client_id);
    // Z przeglądarki tylko token logowania panelu web.
    if (!claims || !clientId.success || (isBrowserRequest(req) && clientId.data !== 'web')) {
      throw new ApiError('invalid_token');
    }

    const check = await idp.checkOtp(claims.idp_sid, body.code);
    if (check === 'no_session') throw new ApiError('invalid_token');
    if (check === 'locked') throw new ApiError('account_locked');
    if (check === 'invalid_code') throw new ApiError('invalid_code');

    // O tym, czy czynniki wystarczą, decyduje auth: ten sam użytkownik, hasło i kod.
    const session = await idp.getSession(claims.idp_sid);
    if (
      !session ||
      session.idpUserId !== claims.idp_uid ||
      !session.passwordChecked ||
      !session.otpChecked
    ) {
      req.log.warn({ alert: 'mfa_session_mismatch' }, 'MFA session does not match login token');
      throw new ApiError('invalid_token');
    }
    const idpUser = await idp.getUser(claims.idp_uid);
    await idp.deleteSession(claims.idp_sid);
    if (!idpUser) throw new ApiError('invalid_token');

    const now = clock.now();
    const user = await users.upsertOnLogin({
      id: idpUser.username,
      identityPool: 'customer',
      idpUserId: idpUser.id,
      displayName: idpUser.displayName,
      locale: idpUser.locale,
      phoneE164: idpUser.phone?.verified ? idpUser.phone.value : null,
      email: idpUser.email?.verified ? idpUser.email.value : null,
      now,
    });
    if (user.deletedAt) throw new ApiError('invalid_token');
    const grants = await access.forUser(user.id);
    if (!isClientAllowed(user, grants, clientId.data)) throw new ApiError('wrong_client');

    const nowSec = epochSeconds(clock);
    const issued = await tokens.issueSession({
      user,
      clientId: clientId.data,
      grants,
      sid: uuidv7(),
      sst: nowSec,
    });
    if (!issued) throw new Error('fresh session has no refresh window');
    return { status: 200, body: tokenReplyBody(reply, clientId.data, issued, nowSec) };
  });
}
