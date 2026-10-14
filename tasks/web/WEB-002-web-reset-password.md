---
id: WEB-002
title: PanelResetHasla
area: web
stage: 1
size: S
status: todo
depends_on: [BE-018, WEB-001]
decisions: [DEC-27]
owner:
branch:
trello:
---
# WEB-002 · PanelResetHasla

## Cel
Osoba, która nie pamięta hasła albo ma konto zablokowane po 5 złych kodach, sama ustawia nowe hasło w panelu: podaje telefon albo e-mail, dostaje kod (tym samym kanałem co kod MFA) i wpisuje nowe hasło. Ten sam ekran działa na telewizorze, bo TV używa zwykłej strony logowania.

## Kontekst
- **Stan kodu:** zaślepka `ForgotPasswordScreen` w `frontend/web/src/screens/PlaceholderScreens.tsx` (trasa `/forgot-password` w `router.tsx`); link „Nie pamiętam hasła” w `screens/LoginScreen.tsx`; komunikat `accountLocked` w `web/src/errors.ts`; gotowe komponenty: `AuthLayout`, `SegmentedControl` (Telefon | E-mail), `PhoneField`, `TextField`, `PasswordField`, `CodeInput` (`length: 8`), `ResendButton` (odliczanie 60 s), `Notice`; stan między ekranami w `session/sign-in-flow.ts` (`LoginDraft`, `loginFromDraft`, wskazówki dla ekranu logowania).
- **Dokumenty:** docs/mikroserwisy.md 5.2 „Kody” (kod resetu 8 cyfr, 15 min; reset odblokowuje konto), 3.1; BE-018: `POST /auth/v1/password/forgot` (`{ login, clientId }` → 202 zawsze, także dla nieznanego konta), `POST /auth/v1/password/reset` (`{ login, code, newPassword }` → 204; `401 invalid_code`, `422 weak_password`, `429 rate_limited`), nagłówki `X-Equenor-Client: web` i `X-Equenor-Login` (równy loginowi z treści).
- **Makiety:** makiety-plan.md B „PanelResetHasla” (karta 440 px jak PanelLogowanie: kontakt, „Wyślij kod”, potem „Kod wysłaliśmy na …”, 8 pól, „Nowe hasło”, „Zapisz hasło” → PanelLogowanie z komunikatem „Hasło zmienione. Zaloguj się.”; bez słowa „telewizor”), wzór apki: makiety-plan.md A „ResetHasla”. Plansza panelu nie jest jeszcze narysowana: układ jak PanelLogowanie.dc.html i PanelLogowanieKod.dc.html.
- **Decyzje:** brak (DEC-08 C: kody 8 cyfr / 15 min, hasło min. 10 znaków).
- **Dane demo:** Damian (telefon, kod SMS), Marta (e-mail), konto zablokowane po 5 złych kodach (fake IdP w `backend/src/services/auth/identity`).

## Zakres
- [ ] `AuthApi` (`frontend/src/api/auth-api.ts`): `forgotPassword(login)` i `resetPassword(login, code, newPassword)` z nagłówkami `X-Equenor-Client: web` i `X-Equenor-Login`; typy z `npm run gen:api` po BE-018.
- [ ] `web/src/screens/ResetPasswordScreen.tsx` zamiast zaślepki, jedna trasa `/forgot-password` z dwoma krokami w stanie komponentu: (1) H1 „Nowe hasło”, „Telefon | E-mail”, pole kontaktu (wypełnione z `flow.draft()`), „Wyślij kod”; (2) „Kod wysłaliśmy na …” (kontakt zamaskowany po stronie klienta, bo odpowiedź go nie zwraca), `CodeInput length={8}`, „Nowe hasło” (`PasswordField`, `autocomplete="new-password"`), „Zapisz hasło”, `ResendButton` (ponowne `forgot`), „Zmień numer” / „Zmień e-mail” wraca do kroku 1.
- [ ] Po 204: `flow` dostaje wskazówkę `passwordChanged` (nowe pole obok `accountConfirmed`), przejście na `/login` z komunikatem „Hasło zmienione. Zaloguj się.” i fokusem na haśle.
- [ ] Błędy: `invalid_code` → „Nieprawidłowy albo wygasły kod.”; `weak_password` → istniejący `messages.weakPassword`; `rate_limited` → `messages.rateLimited`; `network_error` → `messages.network`. Odpowiedź kroku 1 nie zdradza, czy konto istnieje (zawsze krok 2).
- [ ] Ekran logowania: przy `account_locked` komunikat z linkiem „Nie pamiętam hasła” prowadzącym do `/forgot-password` z zachowanym kontaktem.
- [ ] Strona dostępna bez sesji i dla zalogowanego (bez `guestOnly`), tytuł karty „Nowe hasło · EQUENOR”.

## Poza zakresem
- Reset dla zespołu na `[OPS]` (`/auth/v1/ops/password/*`, WEB-026); reset w apce (MOB-004) i na tablecie (TAB-009); zmiana hasła po zalogowaniu (WEB-007).

## Kryteria akceptacji
- [ ] Damian: kontakt → „Wyślij kod” → kod z dev-inbox (8 cyfr) i nowe hasło → logowanie z komunikatem „Hasło zmienione. Zaloguj się.” → logowanie nowym hasłem działa, starym nie.
- [ ] Nieznany numer: ten sam krok 2 i ten sam komunikat przy złym kodzie co dla istniejącego konta.
- [ ] Konto zablokowane po 5 złych kodach: z komunikatu na logowaniu przejście do resetu; po resecie logowanie hasłem i kodem działa (odblokowanie, BE-018).
- [ ] Za krótkie hasło: komunikat błędu bez opisu reguł pod polem (dec. 38).
- [ ] Przy 390 px bez poziomego przewijania; całość obsługiwana klawiaturą.

## Testy
- Vitest + Testing Library w `web/src/screens/auth-screens.test.tsx` (albo nowy plik): oba kroki, błędy, `account_locked` → link, wskazówka po sukcesie; zaktualizować test zaślepek.
- Playwright: `e2e/panel.spec.ts` (atrapa `mock-auth.ts` z trasami resetu) i `e2e/auth.spec.ts` z prawdziwym `auth` (kod z `e2e/.tmp/inbox.jsonl` przez `e2e/helpers/inbox.ts`).
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build` i `npm run e2e` we `frontend/` zielone; `src/api/auth.d.ts` z `npm run gen:api`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Hasło i kod tylko w stanie komponentu; nie zapisywać ich w `flow`, URL ani Web Storage, nie logować.
- Teksty bez objaśnień i bez reguł hasła pod polem (makiety-plan.md 2.3).
- Wzoruj się na `SignUpCodeScreen.tsx` (kod 8 cyfr, ponowne wysłanie) i `LoginScreen.tsx` (przełącznik kontaktu).
