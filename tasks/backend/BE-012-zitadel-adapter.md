---
id: BE-012
title: "Adapter ZITADEL i konfiguracja jako kod"
area: backend
stage: 0
size: L
status: todo
depends_on: []
decisions: [DEC-08, DEC-10]
owner:
branch:
trello:
---
# BE-012 · Adapter ZITADEL i konfiguracja jako kod

## Cel
`auth` rozmawia z prawdziwym ZITADEL (self-hosted) zamiast z fałszywym dostawcą: rejestracja z potwierdzeniem, logowanie hasłem i kodem MFA, reset hasła, odblokowanie i zmiana kontaktu działają na ZITADEL z compose, a ustawienia ZITADEL (polityki, blokady, generatory kodów) są w repo jako kod.

## Kontekst
- Stan kodu: interfejs `IdentityProvider` w `backend/src/services/auth/identity/identity-provider.ts` (kształt jak API v2), fałszywa implementacja `fake-idp.ts`, szkielet `zitadel-idp.ts` (każda metoda rzuca `NotImplementedError`, komentarze z nazwami metod UserService i SessionService). `main.ts` przy `IDP=zitadel` rzuca „ZITADEL adapter not implemented”. Env: `ZITADEL_API_URL`, `ZITADEL_SERVICE_KEY_FILE` (`env.ts`). `docker-compose.yml`, profil `infra`: ZITADEL v4.19.4 na `http://localhost:8082` (w sieci compose `http://zitadel:8080`, wymagany nagłówek `Host: localhost:8082`), konto maszynowe `equenor-auth` z rolą `IAM_LOGIN_CLIENT` i jego PAT w wolumenie `zitadel-bootstrap` (`/zitadel/bootstrap/login-client.pat`).
- Dokumenty: `docs/mikroserwisy.md` 3.1 (kroki i metody API: `CreateUser` z `user_id` od `auth` i `return_code`, `VerifyEmail/Phone`, `AddOTPEmail/SMS`, `CreateSession` z `checks.user` i `checks.password`, `SetSession` z wyzwaniem `otpEmail/otpSms` i `returnCode`, `GetSession`, `DeleteSession`, `PasswordReset`, `SetPassword`; adres zastępczy przy rejestracji telefonem; jeden kontakt = jedno konto), 5.2 „Połączenie z ZITADEL” i „Kody” (blokady, generatory, wyłączone powiadomienia ZITADEL), 5.10, 11.4 pkt 1 (lista spike'u); `docs/development-szczegoly.md` 3.2 „ZITADEL lokalnie” i „Spike ZITADEL i auth”.
- Decyzje: DEC-08 wariant C (PAT w dev, klucz prywatny konta serwisowego, private key JWT, w test i prod; jedna instancja na środowisko, jedna organizacja klientów; hasło min. 10 znaków, kod MFA 6 cyfr i 5 min, kody weryfikacji i resetu 8 cyfr i 15 min, blokada po 5 złych kodach, bez blokady hasłem), DEC-10 (konta zespołu EQUENOR w tej samej organizacji, bez osobnej puli).
- Dane demo: konta demo z README (Damian, Ola, Anna, Marta) i z BE-011.

## Zakres
- [ ] Klient API ZITADEL v2 w `backend/src/services/auth/identity/zitadel/`: wywołania Connect/JSON (`POST /zitadel.user.v2.UserService/<Metoda>`, `…session.v2.SessionService/…`) albo REST, wybór opisany w notatce; nagłówek `Host` z env (`ZITADEL_HOST_HEADER`), limit czasu, ponowienie tylko dla błędów sieci przy metodach idempotentnych; logi bez haseł, kodów i `sessionToken`.
- [ ] Uwierzytelnienie (DEC-08 C): `ZITADEL_PAT_FILE` (tylko poza prod, `forbidInProd`) albo `ZITADEL_SERVICE_KEY_FILE` (private key JWT → token dostępu z odświeżaniem przed wygaśnięciem); `ZITADEL_ORG_ID` organizacji klientów.
- [ ] Wszystkie metody `ZitadelIdentityProvider`: `createUser` (`user_id` = `users.id` od `auth`, więc `idp_user_id = users.id`; kontakt z `return_code`; przy telefonie adres zastępczy `<userId>@phone.invalid` niezweryfikowany, pomijany przy szukaniu), `findUserByContact` (zweryfikowany kontakt ma pierwszeństwo), `getUser` (kontakty z weryfikacją, stan LOCKED, metoda OTP), `deleteUser` (brak konta = sukces), `verifyContact`, `resendVerificationCode`, `addOtp`, `createSession` (`lifetime` 300 s; LOCKED → `locked` bez sprawdzania hasła), `requestOtp` (`returnCode`), `checkOtp`, `getSession`, `deleteSession`.
- [ ] Nowe metody interfejsu (dodać też do `fake-idp.ts`): `requestPasswordReset(idpUserId)` → kod (8 cyfr), `setPassword(idpUserId, code, newPassword)`, `unlockUser(idpUserId)`, `setContact(idpUserId, contact, { verified?, returnCode })`, `removeOtp(idpUserId, channel)`. Trasy, które ich używają: BE-018, BE-020, BE-026.
- [ ] `backend/src/services/auth/infra/`: skrypt `npm run zitadel:configure` (idempotentny, osobnym kontem administratora ZITADEL): organizacja klientów, polityka haseł (min. 10), blokady (`max_otp_attempts = 5`, `max_password_attempts = 0`), generatory kodów (OTP SMS i e-mail 6 cyfr / 5 min, weryfikacja e-maila i telefonu oraz reset hasła 8 cyfr / 15 min), `force_mfa`, powiadomienie `PasswordChange` wyłączone, brak dostawcy SMTP i SMS. Uruchomienie Jobem w klastrze robi Dawid; lokalnie po `docker compose --profile infra up`.
- [ ] `main.ts`: usunąć blokadę `IDP=zitadel`; compose: `auth` na ZITADEL w profilu `infra` (zmienne, PAT z wolumenu), README: jak przełączyć.
- [ ] Skrypt `npm run dev:zitadel-seed`: konta demo w lokalnym ZITADEL przez adapter (stałe `user_id` z `lib/testing/demo.ts`, potwierdzone kontakty, metoda OTP, hasło z `DEV_DEMO_PASSWORD`).
- [ ] Testy kontraktowe tego samego zestawu na FAKE i na ZITADEL (`ZITADEL_TEST_URL`, inaczej pominięte z komunikatem). Notatka ze spike'u `docs/spike-zitadel.md`: wyniki punktów [S] z 11.4 pkt 1 (czy `IAM_LOGIN_CLIENT` obejmuje `DeleteUser`, `UnlockUser`; czy ZITADEL dopuszcza ten sam kontakt w dwóch kontach; adres zastępczy; czy `SetEmail` od razu zastępuje zweryfikowany kontakt; czas dostarczenia kodu).

## Poza zakresem
- Trasy resetu hasła, zmiany kontaktu i profilu (BE-018, BE-020), logowanie zespołu (BE-026), kolejki kodów (BE-015).
- Wdrożenie ZITADEL na klastrze, backup, TLS i NetworkPolicy (Dawid).

## Kryteria akceptacji
- [ ] Na ZITADEL z compose przechodzą przepływy z `backend/src/services/auth/app.test.ts` dla rejestracji, potwierdzenia, logowania hasłem i kodem oboma kanałami, złego kodu i blokady po 5 złych kodach (`403 account_locked`).
- [ ] Kod MFA przychodzi tylko po poprawnym haśle; sesja bez sprawdzonego hasła nie daje tokenu (GHSA-3gwm-5wx8-4gm6).
- [ ] Ani hasło, ani kod, ani `sessionToken` nie występuje w logach `auth` (test hasła-kanarka na logach).
- [ ] `npm run zitadel:configure` uruchomiony dwa razy nie zmienia nic za drugim razem.

## Testy
- Kontraktowe `identity-provider.contract.test.ts` (FAKE zawsze, ZITADEL warunkowo), jednostkowe klienta (mapowanie błędów ZITADEL na `invalid_credentials`, `locked`, `invalid_code`). `cd backend && npm test`; z ZITADEL: `docker compose --profile infra up -d zitadel` i `ZITADEL_TEST_URL=http://localhost:8082 npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; README (compose, profil `infra`, przełączenie `IDP`) i `docs/spike-zitadel.md`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- W tym środowisku ghcr.io bywał zablokowany (README): gdy obrazu nie da się pobrać, oddaj adapter z testami na FAKE i jasno opisz, czego nie sprawdzono.
- Aplikacje nie znają ZITADEL (W6): adres, PAT i klucz tylko w env `auth`. Żadna odpowiedź `auth` nie niesie `sessionToken` ani kodu.
- Bez `identity_pool` i bez drugiej organizacji (DEC-10). Wartości polityk z DEC-08; zmiana wymaga decyzji właściciela.
