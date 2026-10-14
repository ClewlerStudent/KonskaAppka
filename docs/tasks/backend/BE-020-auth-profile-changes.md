---
id: BE-020
title: "auth: kontakt, hasło, kanał kodu, usunięcie konta"
area: backend
stage: 1
size: L
status: todo
depends_on: [BE-012, BE-013, BE-015]
decisions: [DEC-08]
owner:
branch:
trello: https://trello.com/c/p9iyLBZR
---
# BE-020 · auth: kontakt, hasło, kanał kodu, usunięcie konta

## Cel
Osoba w profilu (apka i panel) zmienia e-mail albo telefon, hasło i kanał kodu MFA oraz usuwa konto. Każda zmiana wymaga ponownego hasła i kodu MFA, nowy kontakt także kodu z tego kontaktu, a zmiana hasła wylogowuje pozostałe urządzenia (W6, W9).

## Kontekst
- Stan kodu: token logowania (`login+jwt`, cel `login`) w `backend/src/services/auth/tokens/issue.ts` i `LoginClaims`/`LoginPurpose` w `backend/src/lib/auth/claims.ts`; krok MFA w `routes/login.ts`; limity tylko dla tras otwartych (`rateLimit` w `backend/src/kit/service.ts` wychodzi, gdy `!route.open`). Metody dostawcy `setContact`, `removeOtp`, `addOtp`, `setPassword`, `deleteUser`: BE-012. Kody przez kolejki i treści `code.contact_change`: BE-015, BE-014. `users.token_version`, `bumpTokenVersion`: BE-013. Zdarzenie `user.deleted` w katalogu `lib/messaging` (BE-008).
- Dokumenty: `docs/mikroserwisy.md` 5.2 tabela „Profil” (`PUT /me/mfa-channel`, `POST /me/contact`, `/contact/verify`, `/contact/confirm`, `POST /me/password`, `/password/verify`, `DELETE /me`), „Zmiana kontaktu i hasła (W6)” (kroki, porzucona zmiana kontaktu, OTP SMS usuwany i dodawany przy zmianie numeru, token logowania tylko dla konta z access tokenu), „Kody” (limity po IP i loginie także dla `/me/contact*` i `/me/password*`), 3.1 (jeden kontakt = jedno konto, kanał kodu), 3.8 (usunięcie konta: najpierw `DeleteUser`, potem transakcja z `token_version + 1`, pseudonimizacją i `user.deleted`); `docs/development-szczegoly.md` 4.2 „Zmiana kontaktu i hasła”.
- Makiety: ProfilZmianaNumeru (plan P2, `docs/makiety-plan.md` A Profil), opis w `docs/mockups/STAN.md` pkt 7.
- Decyzje: DEC-08 (kody kontaktu 8 cyfr / 15 min, MFA 6 cyfr / 5 min).
- Dane demo: Damian (telefon i e-mail potwierdzone: zmiana kanału), Ola (tylko telefon), Damian jako jedyny admin Stajnie Lipowe (`409 sole_business_admin`).

## Zakres
- [ ] `LoginPurpose`: `login | contact | contact_confirm | password`; token z celem `contact` niesie nowy kontakt; `auth` przyjmuje token tylko na trasie zgodnej z celem i tylko dla tego samego `idp_user_id` co access token.
- [ ] `PUT /auth/v1/me/mfa-channel` (`{ password, channel }` → token logowania i kod obecnym kanałem; potwierdzenie w `…/verify` z kodem): `addOtp` nowego kanału, `removeOtp` starego; tylko konto z potwierdzonym i e-mailem, i telefonem (inaczej 409 `contact_not_verified`).
- [ ] `POST /auth/v1/me/contact` (`{ newContact, password }`): hasło i kod MFA obecnym kanałem; `POST /me/contact/verify` (`Authorization: Login …`, kod MFA): kontakt nie należy do innego konta (inaczej 409 `contact_taken` bez ujawniania czyje), `setContact` z `returnCode`, kod `code.contact_change` na nowy kontakt, token `contact_confirm`; `POST /me/contact/confirm` (token, kod z nowego kontaktu): weryfikacja, przy telefonie wymiana OTP SMS, nowa kopia w `users` z audytem.
- [ ] Porzucona zmiana kontaktu: przy logowaniu i resecie, gdy zweryfikowany kontakt w ZITADEL różni się od kopii w `users`, `auth` przywraca kopię (`setContact` z `verified: true`) i wysyła kod na nią; funkcja współdzielona z BE-018.
- [ ] `POST /auth/v1/me/password` (`{ currentPassword }`) → token `password` i kod MFA; `POST /me/password/verify` (token, kod, `newPassword`): `setPassword`, zamknięcie sesji ZITADEL, `token_version + 1`, w odpowiedzi nowe tokeny dla tego urządzenia (ciasteczko dla `web`, jak w `routes/session.ts`).
- [ ] `DELETE /auth/v1/me`: jedyny admin firmy → 409 `sole_business_admin`; `deleteUser` w ZITADEL (brak konta = sukces), potem w jednej transakcji: `token_version + 1`, pseudonimizacja (`display_name` „Usunięte konto”, `phone_e164`, `email` = NULL, `deleted_at`), usunięcie członkostw, odwołanie `horse_access`, audyt; po COMMIT `user.deleted`.
- [ ] Limity na trasach z tokenem: rozszerz `RateRule` w `kit/route.ts` o klucz `user` (dla tras zewnętrznych) i podepnij w `kit/service.ts`; `/me/contact*`, `/me/password*`, `/me/mfa-channel` mają limity po użytkowniku i IP.
- [ ] Konto techniczne i konto zespołu: 403 `forbidden_role` na tych trasach. Kody błędów do `ERRORS`: `contact_taken`, `contact_not_verified`, `sole_business_admin`.

## Poza zakresem
- Ekrany profilu (WEB-007, MOB-006); reset hasła bez logowania (BE-018); usuwanie konta przez stronę www (WEB-008).

## Kryteria akceptacji
- [ ] Bez poprawnego hasła i kodu MFA nic się nie zmienia; token logowania innego konta albo z innym celem daje 401 `invalid_token`.
- [ ] Ola zmienia numer: nowy numer potwierdzony kodem, logowanie nowym numerem, kod MFA SMS na nowy numer, kopia w `users` zmieniona dopiero po potwierdzeniu.
- [ ] Kontakt zweryfikowany w innym koncie daje 409 `contact_taken`; porzucona zmiana nie blokuje logowania starym kontaktem.
- [ ] Zmiana hasła: stary refresh token drugiego urządzenia daje `401 session_revoked`, urządzenie zmieniające dostaje nowe tokeny.
- [ ] Damian `DELETE /me` → 409 `sole_business_admin`; inna osoba: konto znika w ZITADEL, wiersz pseudonimizowany, `user.deleted` opublikowane, logowanie niemożliwe.

## Testy
- `backend/src/services/auth/profile.test.ts` na FAKE IdP i harnessie bazy (scenariusze wyżej, limity, hasło-kanarek w logach), kontraktowe na ZITADEL warunkowo (BE-012). `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; `cd frontend && npm run gen:api`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Sesje ZITADEL nie wychodzą z `auth` (W6); odpowiedzi nie niosą `sessionToken` ani kodów.
- Punkty [S] (czy `SetEmail` od razu zastępuje zweryfikowany kontakt, czy do potwierdzenia działa stary kontakt) sprawdza BE-012 (`docs/spike-zitadel.md`); dopasuj kod do wyniku.
- Hasło tylko w żądaniu do dostawcy, nigdy w logach, bazie ani audycie.
