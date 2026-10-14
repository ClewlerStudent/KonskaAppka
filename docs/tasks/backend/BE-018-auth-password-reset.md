---
id: BE-018
title: "auth: reset hasła"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-012, BE-013]
decisions: [DEC-08, DEC-27]
owner:
branch:
trello: https://trello.com/c/kQ4ZKU00
---
# BE-018 · auth: reset hasła

## Cel
„Nie pamiętam hasła” działa w apce, panelu, na TV i tablecie: osoba podaje login, dostaje kod 8 cyfr tym samym kanałem co kod MFA, ustawia nowe hasło, a konto zablokowane po 5 złych kodach zostaje odblokowane. Odpowiedzi nie zdradzają, czy konto istnieje.

## Kontekst
- Stan kodu: trasy otwarte `auth` w `backend/src/contracts/auth.ts` (wzór: `signUp`, `confirmSignUp` z limitami po IP i loginie), lista tras otwartych `backend/open-routes.txt` (test w `contracts.test.ts`), równy czas odpowiedzi `atLeast` (`backend/src/kit/timing.ts`, `config.credentialCheckMinMs`), wzór trasy `routes/sign-up.ts`, kanał kodu `otpTarget()` w `identity/identity-provider.ts`. Metody dostawcy `requestPasswordReset`, `setPassword`, `unlockUser` w interfejsie i w FAKE IdP: BE-012. `users.token_version`: BE-013. Panel ma zaślepkę `/forgot-password` (WEB-002).
- Dokumenty: `docs/mikroserwisy.md` 3.1 (wiersz „Reset hasła”: `PasswordReset` z `returnCode`, `SetPassword` z `verificationCode`, `token_version + 1`; reset nie zdradza konta), 3.8 (reset podbija `token_version`), 5.2 „Kody” (`UnlockUser`, bo sam reset nie odblokowuje [S]; limity po IP i loginie), 10.1 pkt 12 (świadome ryzyko: reset tym samym kanałem), 10.2 pkt 24; `docs/development-szczegoly.md` 4.2 (reset nie zdradza konta, odblokowuje).
- Decyzje: DEC-08 (kod resetu 8 cyfr, 15 min; hasło min. 10 znaków).
- Dane demo: Ola (SMS), Marta (e-mail); konto zablokowane po 5 złych kodach MFA (`backend/README.md` „Znane ograniczenia”).

## Zakres
- [ ] Kontrakty w `contracts/auth.ts`: `POST /auth/v1/password/forgot` (`{ login, clientId }`, 202 bez treści) i `POST /auth/v1/password/reset` (`{ login, code: Code8Schema, newPassword }`, 204); `kind: 'open'`, `reason`, limity `ip` i `login` (wzór: `signUp`); błędy `validation_failed`, `invalid_code`, `weak_password`, `origin_not_allowed`, `rate_limited`. Dopisać obie trasy do `backend/open-routes.txt`; `npm run openapi`.
- [ ] `routes/password.ts`: `forgot`: kontakt z loginu → konto u dostawcy z tym zweryfikowanym kontaktem → `requestPasswordReset` → wiadomość `code.reset` (BE-014, jeśli już jest; inaczej treść w `codes/messages.ts`) na kanał MFA konta (`otpTarget`); nieznane, niepotwierdzone albo bez kanału konto: nic nie wysyła; zawsze 202 po `atLeast`.
- [ ] `reset`: konto → `setPassword(code, newPassword)` (zły kod: `401 invalid_code`, słabe hasło: `422 weak_password`) → `unlockUser` → przy istniejącym wierszu `users`: `token_version + 1` w `unitOfWork` z audytem (`action = password_reset`, aktor to właściciel konta, bez wartości hasła) → 204. Nieznane konto: `401 invalid_code` po tym samym czasie.
- [ ] Porzucona zmiana kontaktu (5.2): jeśli zweryfikowany kontakt w ZITADEL różni się od kopii w `users`, przywróć kopię przed wysłaniem kodu (logikę współdzieli BE-020; jeśli BE-020 jest wcześniej, użyj jej funkcji).
- [ ] Nagłówek `X-Equenor-Login` (5.2): jeśli jest, musi równać się loginowi z treści (inaczej 400), żeby limit po loginie na brzegu był wiarygodny.

## Poza zakresem
- Te same trasy dla zespołu na `[OPS]` (`/auth/v1/ops/password/*`, BE-026); ekrany (WEB-002, MOB-004, TAB-009).
- Wysyłka kodu przez kolejki (BE-015): tu przez bieżący `CodeSender`.

## Kryteria akceptacji
- [ ] Ola: `forgot` daje 202, kod 8 cyfr w skrzynce dev (`npm run dev:inbox`) jako SMS; `reset` z kodem i hasłem ≥ 10 znaków daje 204; logowanie nowym hasłem i kodem MFA działa, stary refresh token innego urządzenia daje `401 session_revoked`.
- [ ] Nieznany login: `forgot` daje 202 w tym samym czasie co znany, nic nie trafia do skrzynki; `reset` daje `401 invalid_code`.
- [ ] Konto zablokowane po 5 złych kodach MFA po resecie loguje się (odblokowane).
- [ ] Obie trasy są w `open-routes.txt`, mają limity po IP i loginie; hasło nie występuje w logach.

## Testy
- Rozszerzenie `backend/src/services/auth/app.test.ts` (FAKE IdP): powyższe scenariusze, równy czas (fałszywy `sleep`), limity; test kontraktowy na ZITADEL (BE-012) warunkowo. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; `cd frontend && npm run gen:api` po zmianie `openapi/auth.json`; `backend/README.md` (usunąć „reset hasła jeszcze nie działa”); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Odpowiedź `forgot` celowo bez kanału i zamaskowanego adresu: kod idzie kanałem MFA, który może różnić się od wpisanego loginu, a podanie go zdradzałoby konto. Ekrany pokazują ogólny tekst (uzgodnij z WEB-002 i MOB-004).
- Nie loguj loginu w całości; hasło i kod nigdy w logach, bazie ani audycie.
- Zależność od BE-012 wynika z nowych metod dostawcy; jeśli adapter ZITADEL nie jest gotowy, zrób trasę na FAKE IdP i koordynuj interfejs z BE-012.
